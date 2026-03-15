import { useEffect, useState } from "react";
import { useProductStore } from "../store/productStore";
import { getTenantData } from "../utils/tenant";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function Dashboard() {

  const { products, loadProducts } = useProductStore();

  const [todayData, setTodayData] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [monthData, setMonthData] = useState([]);

  const [stats, setStats] = useState({
    sales: 0,
    customers: 0,
    invoices: 0
  });

  useEffect(() => {

    const loadDashboard = () => {

      loadProducts();

      const invoices = getTenantData("invoices") || [];
      const customers = getTenantData("customers") || [];

      let totalSales = 0;

      const now = new Date();

      const today = [];
      const week = [];
      const month = [];

      invoices.forEach(inv => {

        totalSales += Number(inv.total) || 0;

        const d = new Date(inv.date);
        const diff = (now - d) / (1000 * 60 * 60 * 24);

        if(diff < 1) today.push(inv);
        if(diff <= 7) week.push(inv);
        if(diff <= 30) month.push(inv);

      });

      setStats({
        sales: totalSales,
        customers: customers.length,
        invoices: invoices.length
      });

      const group = (data) => {

        const map = {};

        data.forEach(i => {
          const day = new Date(i.date).toLocaleDateString();
          if(!map[day]) map[day] = 0;
          map[day] += Number(i.total) || 0;
        });

        return Object.keys(map).map(k => ({
          name: k,
          revenue: map[k]
        }));

      };

      setTodayData(group(today));
      setWeekData(group(week));
      setMonthData(group(month));

    };

    loadDashboard();

    window.addEventListener("invoiceUpdated", loadDashboard);

    return () =>
      window.removeEventListener("invoiceUpdated", loadDashboard);

  }, []);

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Sales Dashboard 🚀
      </h1>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <Card title="Total Sales" value={`₹ ${stats.sales.toFixed(2)}`} />
        <Card title="Products" value={products.length} />
        <Card title="Customers" value={stats.customers} />
        <Card title="Invoices" value={stats.invoices} />
      </div>

      <Graph title="Today's Revenue" data={todayData} color="#22c55e" />
      <Graph title="Last 7 Days Revenue" data={weekData} color="#3b82f6" />
      <Graph title="Last 30 Days Revenue" data={monthData} color="#f59e0b" />

    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}

function Graph({ title, data, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="name"/>
          <YAxis/>
          <Tooltip/>
          <Line type="monotone" dataKey="revenue" stroke={color} strokeWidth={3}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}