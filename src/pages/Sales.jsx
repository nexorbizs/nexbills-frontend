import { useEffect, useState } from "react";
import API from "../api";

export default function Sales() {

  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    loadSales();

    window.addEventListener("saleUpdated", loadSales);

    return () =>
      window.removeEventListener("saleUpdated", loadSales);

  }, []);

  const loadSales = async () => {
    try {

      setLoading(true);

      const res = await API.get("/sales");

      setSales(res.data || []);
      setActiveIndex(0);

    } catch {
      alert("Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */

  const filtered = sales.filter(s =>
    (s.invoiceNo || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.customerPhone || "").includes(search)
  );

  /* ================= KEYBOARD ================= */

  useEffect(() => {

    const handleKey = (e) => {

      if (!filtered.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(i =>
          i < filtered.length - 1 ? i + 1 : 0
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(i =>
          i > 0 ? i - 1 : filtered.length - 1
        );
      }

      if (e.key === "Enter") {
        viewSale(filtered[activeIndex]);
      }

    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);

  }, [filtered, activeIndex]);

  /* ================= CALC ================= */

  const calcRow = (item) => {

    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    const cgst = Number(item.cgst) || 0;
    const sgst = Number(item.sgst) || 0;

    const taxable = price * qty;
    const cgstAmt = taxable * cgst / 100;
    const sgstAmt = taxable * sgst / 100;

    return taxable + cgstAmt + sgstAmt;
  };

  /* ================= VIEW INVOICE ================= */

  const viewSale = (sale) => {

    const rows = (sale.items || []).map(i => `
      <tr>
        <td>${i.productName || "-"}</td>
        <td>${i.hsn || "-"}</td>
        <td>${i.qty || 0}</td>
        <td>${i.price || 0}</td>
        <td>${i.cgst || 0}%</td>
        <td>${i.sgst || 0}%</td>
        <td>${calcRow(i).toFixed(2)}</td>
      </tr>
    `).join("");

    const html = `
      <html>
      <head>
      <style>
      body{font-family:Arial;padding:40px}
      h1{text-align:center}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      td,th{border:1px solid #000;padding:8px;text-align:center}
      </style>
      </head>
      <body>

      <h1>Invoice Details</h1>

      <p><b>Invoice No:</b> ${sale.invoiceNo}</p>
      <p><b>Date:</b> ${new Date(sale.createdAt).toLocaleString()}</p>
      <p><b>Customer:</b> ${sale.customerName}</p>
      <p><b>Phone:</b> ${sale.customerPhone}</p>

      <table>
        <tr>
          <th>Item</th>
          <th>HSN</th>
          <th>Qty</th>
          <th>Price</th>
          <th>CGST%</th>
          <th>SGST%</th>
          <th>Total</th>
        </tr>
        ${rows}
      </table>

      <h3 style="text-align:right">
      Sub Total ₹ ${(sale.subTotal || 0).toFixed(2)}
      </h3>

      <h3 style="text-align:right">
      Round Off ₹ ${(sale.roundOff || 0).toFixed(2)}
      </h3>

      <h2 style="text-align:right">
      Grand Total ₹ ${Number(sale.total).toLocaleString("en-IN")}
      </h2>

      </body>
      </html>
    `;

    const win = window.open("", "", "width=900,height=700");

    if (!win) {
      alert("Popup blocked");
      return;
    }

    win.document.write(html);
    win.document.close();
  };

  /* ================= UI ================= */

  if (loading)
    return <div className="p-6">Loading Sales...</div>;

  return (
    <div className="p-4 md:p-6">

      <h1 className="text-2xl md:text-3xl font-bold mb-4">
        Sales History
      </h1>

      <input
        placeholder="Search Invoice / Customer / Phone"
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          setActiveIndex(0);
        }}
        className="border p-3 rounded-xl w-full mb-4"
      />

      <div className="bg-white shadow rounded-xl overflow-x-auto">

        <table className="min-w-[600px] w-full text-sm">

          <thead className="bg-slate-100 sticky top-0">
            <tr>
              <th className="p-3 text-left">Invoice</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>

          <tbody>

            {filtered.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center p-6 text-gray-400">
                  No sales found
                </td>
              </tr>
            )}

            {filtered.map((s, index) => (
              <tr
                key={s.id}
                className={`border-t cursor-pointer
                ${index === activeIndex ? "bg-blue-50" : "hover:bg-gray-50"}`}
                onClick={() => viewSale(s)}
              >
                <td className="p-3 text-blue-600 font-semibold">
                  {s.invoiceNo}
                </td>

                <td className="p-3">
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>

                <td className="p-3">
                  {s.customerName}
                </td>

                <td className="p-3 text-right font-bold">
                  ₹ {Number(s.total).toLocaleString("en-IN")}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}