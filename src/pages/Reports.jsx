import { useEffect, useState } from "react";
import { getTenantData } from "../utils/tenant";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Reports() {

  const [invoices, setInvoices] = useState([]);

  const [summary, setSummary] = useState({
    sales: 0,
    gst: 0,
    invoices: 0
  });

  useEffect(() => {

    const loadReports = () => {

      const tenantInvoices = getTenantData("invoices") || [];

      let salesTotal = 0;
      let gstTotal = 0;

      tenantInvoices.forEach(inv => {

        salesTotal += Number(inv.total);

        inv.items.forEach(i => {

          const taxable = Number(i.price) * Number(i.qty);
          const cgst = taxable * (Number(i.cgst) || 0) / 100;
          const sgst = taxable * (Number(i.sgst) || 0) / 100;

          gstTotal += cgst + sgst;

        });

      });

      setInvoices(tenantInvoices);

      // ⭐ FIXED
      setSummary({
        sales: salesTotal,
        gst: gstTotal,
        invoices: tenantInvoices.length
      });

    };

    loadReports();

    window.addEventListener("invoiceUpdated", loadReports);

    return () =>
      window.removeEventListener("invoiceUpdated", loadReports);

  }, []);

  const filterInvoices = (days) => {

    const now = new Date();

    return invoices.filter(inv => {

      const d = new Date(inv.date);
      const diff = (now - d) / (1000 * 60 * 60 * 24);

      return diff <= days;

    });

  };

  const downloadReport = (days) => {

    const data = filterInvoices(days);

    const rows = [];

    data.forEach(inv => {

      inv.items.forEach(i => {

        const taxable = i.price * i.qty;
        const cgst = taxable * (Number(i.cgst) || 0) / 100;
        const sgst = taxable * (Number(i.sgst) || 0) / 100;

        rows.push({
          InvoiceNo: inv.invoiceNo,
          Date: inv.date,
          Customer: inv.customer.name,
          Phone: inv.customer.phone,
          Item: i.name,
          HSN: i.hsn,
          Qty: i.qty,
          Price: i.price,
          TaxableValue: taxable,
          CGST: cgst,
          SGST: sgst,
          Total: taxable + cgst + sgst
        });

      });

      rows.push({
        InvoiceNo: "",
        Date: "",
        Customer: "",
        Phone: "",
        Item: "ROUND OFF",
        HSN: "",
        Qty: "",
        Price: "",
        TaxableValue: "",
        CGST: "",
        SGST: "",
        Total: inv.roundOff || 0
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

  };

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Sales Reports
      </h1>

      <div className="grid grid-cols-3 gap-6 mb-8">

        <Card title="Total Sales" value={`₹ ${summary.sales.toFixed(2)}`} />
        <Card title="Total GST" value={`₹ ${summary.gst.toFixed(2)}`} />
        <Card title="Invoices" value={summary.invoices} />

      </div>

      <div className="grid grid-cols-3 gap-6">

        <button
          onClick={() => downloadReport(1)}
          className="bg-blue-600 text-white p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Download Last 24 Hours
        </button>

        <button
          onClick={() => downloadReport(7)}
          className="bg-green-600 text-white p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Download Last 7 Days
        </button>

        <button
          onClick={() => downloadReport(30)}
          className="bg-purple-600 text-white p-6 rounded-xl shadow hover:scale-105 transition"
        >
          Download Last 30 Days
        </button>

      </div>

    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold">{value}</h2>
    </div>
  );
}