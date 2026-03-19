import { useEffect, useState } from "react";
import API from "../api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Reports() {

  const [summary, setSummary] = useState({
    revenue: 0,
    invoices: 0,
    products: 0,
    customers: 0
  });

  const [loading, setLoading] = useState(true);

  /* ================= LOAD SUMMARY ================= */

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {

    try {

      const res = await API.get("/reports/dashboard");

      setSummary(res.data);

    } catch {

      alert("Report summary load failed");

    } finally {

      setLoading(false);

    }

  };

  /* ================= DATE RANGE ================= */

  const getRange = (days) => {

    const to = new Date();
    const from = new Date();

    from.setDate(from.getDate() - days);

    return {
      from: from.toISOString(),
      to: to.toISOString()
    };

  };

  /* ================= DOWNLOAD ================= */

  const downloadReport = async (days) => {

    try {

      const { from, to } = getRange(days);

      const res = await API.get(`/reports/sales?from=${from}&to=${to}`);

      const sales = res.data.sales || [];

      if (!sales.length) {
        alert("No data available");
        return;
      }

      const rows = [];

      sales.forEach(inv => {

        (inv.items || []).forEach(i => {

          const taxable = i.price * i.qty;
          const cgst = taxable * i.cgst / 100;
          const sgst = taxable * i.sgst / 100;

          rows.push({
            Invoice: inv.invoiceNo,
            Date: new Date(inv.createdAt).toLocaleDateString("en-IN"),
            Customer: inv.customerName,
            Phone: inv.customerPhone,
            Item: i.productName,
            HSN: i.hsn,
            Qty: i.qty,
            Rate: i.price,
            Taxable: taxable,
            CGST: cgst,
            SGST: sgst,
            Total: i.total
          });

        });

        rows.push({
          Invoice: inv.invoiceNo,
          Item: "ROUND OFF",
          Total: inv.roundOff
        });

      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, ws, "GST Report");

      const buffer = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array"
      });

      const blob = new Blob([buffer], {
        type: "application/octet-stream"
      });

      saveAs(blob, `GST_Report_${days}_days.xlsx`);

    } catch {

      alert("Report generation failed");

    }

  };

  /* ================= UI ================= */

  if (loading)
    return <div className="p-6">Loading Reports...</div>;

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-8">
        Business Reports
      </h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

        <Card title="Revenue"
          value={`₹ ${Number(summary.revenue).toLocaleString("en-IN")}`} />

        <Card title="Invoices"
          value={summary.invoices} />

        <Card title="Products"
          value={summary.products} />

        <Card title="Customers"
          value={summary.customers} />

      </div>

      {/* DOWNLOAD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <DownloadCard
          title="Last 24 Hours"
          onClick={() => downloadReport(1)}
          color="blue"
        />

        <DownloadCard
          title="Last 7 Days"
          onClick={() => downloadReport(7)}
          color="green"
        />

        <DownloadCard
          title="Last 30 Days"
          onClick={() => downloadReport(30)}
          color="purple"
        />

      </div>

    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Card({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}

function DownloadCard({ title, onClick, color }) {

  const colors = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    purple: "bg-purple-600 hover:bg-purple-700"
  };

  return (
    <button
      onClick={onClick}
      className={`${colors[color]} text-white p-6 rounded-xl hover:scale-105 transition`}
    >
      Download {title}
    </button>
  );
}