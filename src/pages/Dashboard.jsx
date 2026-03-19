import { useEffect, useState } from "react";
import API from "../api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function Dashboard() {

  const [stats, setStats] = useState({
    revenue: 0,
    invoices: 0,
    products: 0,
    customers: 0
  });

  const [todayPie, setTodayPie] = useState([]);
  const [weekPie, setWeekPie] = useState([]);
  const [monthPie, setMonthPie] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadDashboard();

    window.addEventListener("saleCreated", loadDashboard);
    window.addEventListener("productUpdated", loadDashboard);

    return () => {
      window.removeEventListener("saleCreated", loadDashboard);
      window.removeEventListener("productUpdated", loadDashboard);
    };

  }, []);

  const loadDashboard = async () => {

    try {

      setError(false);

      const todayFrom = startOfDay(1);
      const weekFrom = startOfDay(7);
      const monthFrom = startOfDay(30);
      const now = new Date().toISOString();

      const [
        summaryRes,
        todayRes,
        weekRes,
        monthRes
      ] = await Promise.all([
        API.get("/reports/dashboard"),
        API.get(`/reports/sales?from=${todayFrom}&to=${now}`),
        API.get(`/reports/sales?from=${weekFrom}&to=${now}`),
        API.get(`/reports/sales?from=${monthFrom}&to=${now}`)
      ]);

      setStats(summaryRes.data);

      setTodayPie(makePie(todayRes.data.sales));
      setWeekPie(makePie(weekRes.data.sales));
      setMonthPie(makePie(monthRes.data.sales));

    } catch (err) {
      console.log("Dashboard load error");
      setError(true);
    } finally {
      setLoading(false);
    }

  };

  const startOfDay = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days + 1);
    d.setHours(0,0,0,0);
    return d.toISOString();
  };

  const makePie = (data = []) => {

    if (!data.length)
      return [{ name: "No Data", value: 1 }];

    let revenue = 0;
    let productsSold = 0;
    const customers = new Set();

    data.forEach(inv => {

      revenue += Number(inv.total) || 0;

      if (inv.customerPhone)
        customers.add(inv.customerPhone);

      (inv.items || []).forEach(i => {
        productsSold += Number(i.qty) || 0;
      });

    });

    return [
      { name: "Revenue", value: revenue },
      { name: "Products Sold", value: productsSold },
      { name: "Customers", value: customers.size }
    ];
  };

  if (loading)
    return <div className="p-6 text-lg">Loading Dashboard...</div>;

  if (error)
    return <div className="p-6 text-red-500">Dashboard failed to load</div>;

  return (
    <div>

      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Business Dashboard 🚀
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

        <Card title="Total Sales"
          value={`₹ ${Number(stats.revenue).toLocaleString("en-IN")}`} />

        <Card title="Products" value={stats.products} />
        <Card title="Customers" value={stats.customers} />
        <Card title="Invoices" value={stats.invoices} />

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        <PieBlock title="Today" data={todayPie} />
        <PieBlock title="Last 7 Days" data={weekPie} />
        <PieBlock title="Last 30 Days" data={monthPie} />

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

      <h3 className="text-lg font-semibold mb-4 text-center">
        {title}
      </h3>

      <div className="w-full h-[280px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius="75%"
              label
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}