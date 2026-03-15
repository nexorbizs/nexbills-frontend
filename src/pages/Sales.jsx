import { useEffect, useState } from "react";
import { getTenantData } from "../utils/tenant";

export default function Sales() {

  const [sales, setSales] = useState([]);

  useEffect(() => {

    const load = () => {
      const tenantInvoices = getTenantData("invoices") || [];
      setSales([...tenantInvoices].reverse());
    };

    load();

    window.addEventListener("invoiceUpdated", load);

    return () =>
      window.removeEventListener("invoiceUpdated", load);

  }, []);

  const calculateRow = (item) => {

    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;

    const cgstRate = Number(item.cgst) || 0;
    const sgstRate = Number(item.sgst) || 0;

    const taxable = price * qty;

    const cgstAmt = taxable * cgstRate / 100;
    const sgstAmt = taxable * sgstRate / 100;

    return {
      cgstRate,
      sgstRate,
      cgstAmt,
      sgstAmt,
      total: taxable + cgstAmt + sgstAmt
    };
  };

  const viewSale = (sale) => {

    const rows = sale.items.map(i => {

      const calc = calculateRow(i);

      return `
        <tr>
          <td>${i.name}</td>
          <td>${i.hsn || "-"}</td>
          <td>${i.qty}</td>
          <td>${i.price}</td>
          <td>${calc.cgstRate}%</td>
          <td>${calc.sgstRate}%</td>
          <td>${calc.total.toFixed(2)}</td>
        </tr>
      `;
    }).join("");

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
      <p><b>Date:</b> ${sale.date}</p>
      <p><b>Customer:</b> ${sale.customer?.name}</p>
      <p><b>Phone:</b> ${sale.customer?.phone}</p>

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
      Sub Total ₹ ${sale.subTotal?.toFixed(2) || "0.00"}
      </h3>

      <h3 style="text-align:right">
      Round Off ₹ ${sale.roundOff?.toFixed(2) || "0.00"}
      </h3>

      <h2 style="text-align:right">
      Grand Total ₹ ${sale.total}
      </h2>

      </body>
      </html>
    `;

    const win = window.open("", "", "width=900,height=700");
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">Sales History</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Invoice No</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {sales.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center p-6 text-gray-400">
                  No sales found
                </td>
              </tr>
            )}

            {sales.map(s => (
              <tr
                key={s.id}
                className="border-t cursor-pointer hover:bg-gray-50"
                onClick={() => viewSale(s)}
              >
                <td className="p-3 text-blue-600 font-semibold">
                  {s.invoiceNo}
                </td>
                <td className="p-3">{s.date}</td>
                <td className="p-3">{s.customer?.name}</td>
                <td className="p-3 text-right font-bold">
                  ₹ {s.total}
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}