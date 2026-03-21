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

  const [pl, setPl] = useState(null);
  const [plDays, setPlDays] = useState(30);
  const [plLoading, setPlLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD SUMMARY ================= */

  useEffect(() => {
    loadSummary();
    loadPL(30);
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

  /* ================= LOAD P&L ================= */

  const loadPL = async (days) => {
    try {
      setPlLoading(true);
      const { from, to } = getRange(days);
      const res = await API.get(`/reports/profit-loss?from=${from}&to=${to}`);
      setPl(res.data);
      setPlDays(days);
    } catch {
      alert("P&L load failed");
    } finally {
      setPlLoading(false);
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

  /* ================= DOWNLOAD GST REPORT ================= */

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
          Date: "", Customer: "", Phone: "",
          Item: "── SUMMARY ──",
          HSN: "", Qty: "", Rate: "",
          Taxable: inv.subTotal,
          CGST: "", SGST: "", Total: ""
        });

        rows.push({
          Invoice: inv.invoiceNo,
          Date: "", Customer: "", Phone: "",
          Item: "Round Off",
          HSN: "", Qty: "", Rate: "",
          Taxable: "", CGST: "", SGST: "",
          Total: inv.roundOff
        });

        rows.push({
          Invoice: inv.invoiceNo,
          Date: "", Customer: "", Phone: "",
          Item: "GRAND TOTAL",
          HSN: "", Qty: "", Rate: "",
          Taxable: "", CGST: "", SGST: "",
          Total: inv.total
        });

        rows.push({});
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "GST Report");

      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      saveAs(blob, `GST_Report_${days}_days.xlsx`);

    } catch {
      alert("Report generation failed");
    }
  };

  /* ================= DOWNLOAD P&L EXCEL ================= */

  const downloadPL = async () => {
    if (!pl) return;

    const rows = [
      { Metric: "Total Revenue", Value: pl.totalRevenue },
      { Metric: "Total Purchase Cost", Value: pl.totalCost },
      { Metric: "Gross Profit", Value: pl.grossProfit },
      { Metric: "Total Discount Given", Value: pl.totalDiscount },
      { Metric: "Total Sales", Value: pl.totalSales },
      { Metric: "Total Purchases", Value: pl.totalPurchases },
      {},
      { Metric: "── PRODUCT BREAKDOWN ──", Value: "" },
      ...( pl.productBreakdown || []).map(p => ({
        Metric: p.name,
        "Qty Sold": p.qtySold,
        "Sales Revenue": p.salesRevenue.toFixed(2),
        "Purchase Cost": p.purchaseCost.toFixed(2),
        "Profit": p.profit.toFixed(2)
      }))
    ];

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "P&L Report");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `PL_Report_${plDays}_days.xlsx`);
  };

  /* ================= UI ================= */

  if (loading)
    return <div className="p-6">Loading Reports...</div>;

  return (
    <div>

      <h1 className="text-2xl md:text-3xl font-bold mb-8">
        Business Reports
      </h1>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card title="Revenue" value={`₹ ${Number(summary.revenue).toLocaleString("en-IN")}`} />
        <Card title="Invoices" value={summary.invoices} />
        <Card title="Products" value={summary.products} />
        <Card title="Customers" value={summary.customers} />
      </div>

      {/* GST DOWNLOAD */}
      <h2 className="text-xl font-bold mb-4">GST Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <DownloadCard title="Last 24 Hours" onClick={() => downloadReport(1)} color="blue" />
        <DownloadCard title="Last 7 Days" onClick={() => downloadReport(7)} color="green" />
        <DownloadCard title="Last 30 Days" onClick={() => downloadReport(30)} color="purple" />
      </div>

      {/* P&L REPORT */}
      <div className="bg-white rounded-xl shadow p-6">

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold">Profit & Loss Report</h2>

          <div className="flex gap-2 flex-wrap">
            {[1, 7, 30].map(d => (
              <button
                key={d}
                onClick={() => loadPL(d)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  plDays === d
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {d === 1 ? "Today" : d === 7 ? "7 Days" : "30 Days"}
              </button>
            ))}

            <button
              onClick={downloadPL}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition"
            >
              Download Excel
            </button>
          </div>
        </div>

        {plLoading ? (
          <div className="text-center p-6 text-slate-400">Loading P&L...</div>
        ) : pl ? (
          <>
            {/* P&L SUMMARY */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <p className="text-green-600 text-sm">Total Revenue</p>
                <h3 className="text-xl font-bold text-green-700">
                  ₹ {Number(pl.totalRevenue).toLocaleString("en-IN")}
                </h3>
              </div>

              <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                <p className="text-red-600 text-sm">Purchase Cost</p>
                <h3 className="text-xl font-bold text-red-700">
                  ₹ {Number(pl.totalCost).toLocaleString("en-IN")}
                </h3>
              </div>

              <div className={`p-4 rounded-xl border ${
                pl.grossProfit >= 0
                  ? "bg-blue-50 border-blue-200"
                  : "bg-orange-50 border-orange-200"
              }`}>
                <p className={`text-sm ${pl.grossProfit >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                  Gross Profit
                </p>
                <h3 className={`text-xl font-bold ${pl.grossProfit >= 0 ? "text-blue-700" : "text-orange-700"}`}>
                  ₹ {Number(pl.grossProfit).toLocaleString("en-IN")}
                </h3>
              </div>

              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <p className="text-purple-600 text-sm">Discount Given</p>
                <h3 className="text-xl font-bold text-purple-700">
                  ₹ {Number(pl.totalDiscount).toLocaleString("en-IN")}
                </h3>
              </div>

            </div>

            {/* PRODUCT BREAKDOWN */}
            {pl.productBreakdown?.length > 0 && (
              <>
                <h3 className="font-semibold text-slate-700 mb-3">Product Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="p-3 text-left">Product</th>
                        <th className="p-3 text-center">Qty Sold</th>
                        <th className="p-3 text-right">Sales Revenue</th>
                        <th className="p-3 text-right">Purchase Cost</th>
                        <th className="p-3 text-right">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pl.productBreakdown.map((p, i) => (
                        <tr key={i} className="border-t hover:bg-slate-50">
                          <td className="p-3 font-medium">{p.name}</td>
                          <td className="p-3 text-center">{p.qtySold}</td>
                          <td className="p-3 text-right">₹ {Number(p.salesRevenue).toFixed(2)}</td>
                          <td className="p-3 text-right">₹ {Number(p.purchaseCost).toFixed(2)}</td>
                          <td className={`p-3 text-right font-bold ${
                            p.profit >= 0 ? "text-green-600" : "text-red-500"
                          }`}>
                            ₹ {Number(p.profit).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        ) : null}

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