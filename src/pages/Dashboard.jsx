import { useEffect, useState } from "react";
import API from "../api";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const startOfDay = (daysBack) => {
  const d = new Date();
  d.setDate(d.getDate() - daysBack + 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const makePie = (data = []) => {
  if (!data.length) return [{ name: "No Data", value: 1 }];
  let revenue = 0, productsSold = 0;
  const customers = new Set();
  data.forEach((inv) => {
    revenue += Number(inv.total) || 0;
    if (inv.customerPhone) customers.add(inv.customerPhone);
    (inv.items || []).forEach((i) => { productsSold += Number(i.qty) || 0; });
  });
  return [
    { name: "Revenue", value: revenue },
    { name: "Products Sold", value: productsSold },
    { name: "Customers", value: customers.size },
  ];
};

const BRANCH_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6"];

export default function Dashboard() {
  const [stats, setStats] = useState({ revenue: 0, invoices: 0, products: 0, customers: 0 });
  const [todayPie, setTodayPie] = useState([]);
  const [weekPie, setWeekPie] = useState([]);
  const [monthPie, setMonthPie] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [branchStats, setBranchStats] = useState([]);
  const [branchBarData, setBranchBarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ⭐ Get user info
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "OWNER";
  const userBranches = user?.branches || [];

  useEffect(() => {
    loadDashboard();
    window.addEventListener("saleCreated", loadDashboard);
    window.addEventListener("productUpdated", loadDashboard);
    return () => {
      window.removeEventListener("saleCreated", loadDashboard);
      window.removeEventListener("productUpdated", loadDashboard);
    };
  }, []);

  useEffect(() => {
    if (!loading) loadPies();
  }, [selectedBranch]);

  const branchQuery = (extra = "") =>
    selectedBranch !== "all" ? `&branchId=${selectedBranch}${extra}` : extra;

  const loadPies = async () => {
    const now = new Date().toISOString();
    const todayFrom = startOfDay(1);
    const weekFrom = startOfDay(7);
    const monthFrom = startOfDay(30);
    const [todayRes, weekRes, monthRes] = await Promise.all([
      API.get(`/reports/sales?from=${todayFrom}&to=${now}${branchQuery()}`),
      API.get(`/reports/sales?from=${weekFrom}&to=${now}${branchQuery()}`),
      API.get(`/reports/sales?from=${monthFrom}&to=${now}${branchQuery()}`),
    ]);
    setTodayPie(makePie(todayRes.data.sales));
    setWeekPie(makePie(weekRes.data.sales));
    setMonthPie(makePie(monthRes.data.sales));
  };

  const loadDashboard = async () => {
    try {
      setError(false);
      const now = new Date().toISOString();
      const weekFrom = startOfDay(7);

      const [summaryRes, branchRes] = await Promise.all([
        API.get("/reports/dashboard"),
        API.get("/branches"),
      ]);

      setStats(summaryRes.data);
      const allBranches = branchRes.data || [];

      // ⭐ Filter branches by user's assigned branches
      const filteredBranches = role === "OWNER"
        ? allBranches
        : allBranches.filter(b => userBranches.some(ub => ub.id === b.id));

      setBranches(filteredBranches);

      const branchResults = await Promise.all(
        filteredBranches.map(async (b) => {
          const res = await API.get(`/reports/sales?from=${weekFrom}&to=${now}&branchId=${b.id}`);
          const sales = res.data.sales || [];
          let revenue = 0, productsSold = 0;
          const customers = new Set();
          sales.forEach((inv) => {
            revenue += Number(inv.total) || 0;
            if (inv.customerPhone) customers.add(inv.customerPhone);
            (inv.items || []).forEach((i) => { productsSold += Number(i.qty) || 0; });
          });
          return { id: b.id, name: b.name, location: b.location, revenue, invoices: sales.length, customers: customers.size, productsSold };
        })
      );

      setBranchStats(branchResults);
      setBranchBarData(branchResults.map((b) => ({
        name: b.name, Revenue: b.revenue, Invoices: b.invoices, Customers: b.customers,
      })));

      await loadPies();
    } catch (err) {
      console.error("Dashboard load error", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-lg">Loading Dashboard...</div>;
  if (error) return <div className="p-6 text-red-500">Dashboard failed to load</div>;

  return (
    <div className="space-y-8">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Business Dashboard 🚀</h1>
        {branches.length > 0 && (
          <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}
            className="border p-2 rounded-xl text-sm font-semibold text-slate-700 bg-white shadow-sm w-full sm:w-56">
            {role === "OWNER" && <option value="all">🏢 All Branches</option>}
            {branches.map((b) => (
              <option key={b.id} value={b.id}>🏪 {b.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Sales" value={`₹ ${Number(stats.revenue).toLocaleString("en-IN")}`} />
        <Card title="Products" value={stats.products} />
        <Card title="Customers" value={stats.customers} />
        <Card title="Invoices" value={stats.invoices} />
      </div>

      {branches.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-3">
            Branch Performance <span className="text-sm font-normal text-slate-400">(Last 7 Days)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {branchStats.map((b, i) => (
              <div key={b.id}
                onClick={() => setSelectedBranch(String(b.id) === String(selectedBranch) ? (role === "OWNER" ? "all" : String(b.id)) : String(b.id))}
                className={`bg-white rounded-2xl shadow p-5 cursor-pointer border-2 transition-all ${
                  String(selectedBranch) === String(b.id) ? "border-blue-500 shadow-blue-100" : "border-transparent hover:border-slate-200"
                }`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: BRANCH_COLORS[i % BRANCH_COLORS.length] }} />
                  <p className="font-bold text-slate-800 truncate">{b.name}</p>
                  {b.location && <span className="text-xs text-slate-400 ml-auto truncate">📍 {b.location}</span>}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-slate-400">Revenue</p><p className="font-bold text-green-600">₹ {Number(b.revenue).toLocaleString("en-IN")}</p></div>
                  <div><p className="text-slate-400">Invoices</p><p className="font-bold text-blue-600">{b.invoices}</p></div>
                  <div><p className="text-slate-400">Customers</p><p className="font-bold text-amber-600">{b.customers}</p></div>
                  <div><p className="text-slate-400">Items Sold</p><p className="font-bold text-purple-600">{b.productsSold}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {branches.length > 1 && role === "OWNER" && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
            Branch Revenue Comparison <span className="text-sm font-normal text-slate-400">(Last 7 Days)</span>
          </h2>
          <div className="w-full h-64">
            <ResponsiveContainer>
              <BarChart data={branchBarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value, name) => name === "Revenue" ? [`₹ ${Number(value).toLocaleString("en-IN")}`, name] : [value, name]} />
                <Legend />
                <Bar dataKey="Revenue" fill="#22c55e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Invoices" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Customers" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div>
        {selectedBranch !== "all" && (
          <p className="text-sm text-blue-600 font-semibold mb-3">
            🏪 Showing: {branches.find((b) => String(b.id) === String(selectedBranch))?.name}
            {role === "OWNER" && (
              <button onClick={() => setSelectedBranch("all")} className="ml-3 text-slate-400 hover:text-slate-600 underline font-normal">
                Clear filter
              </button>
            )}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <PieBlock title="Today" data={todayPie} />
          <PieBlock title="Last 7 Days" data={weekPie} />
          <PieBlock title="Last 30 Days" data={monthPie} />
        </div>
      </div>

    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}

function PieBlock({ title, data }) {
  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b"];
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      <div className="w-full h-[280px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius="75%" label>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}