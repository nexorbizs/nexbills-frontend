export const printThermal = (sale, width = "80mm") => {

    const company = sale.company || 
      JSON.parse(localStorage.getItem("company") || "{}");
  
    const pageWidth = width === "58mm" ? "58mm" : "80mm";
    const fontSize = width === "58mm" ? "10px" : "12px";
  
    const rows = (sale.items || []).map(i => {
      const taxable = i.price * i.qty;
      const cgst = taxable * i.cgst / 100;
      const sgst = taxable * i.sgst / 100;
      const total = taxable + cgst + sgst;
  
      return `
        <tr>
          <td colspan="2">${i.productName}</td>
        </tr>
        <tr>
          <td>${i.qty} x ₹${i.price} 
            <span style="font-size:9px">
              (C:${i.cgst}% S:${i.sgst}%)
            </span>
          </td>
          <td style="text-align:right">₹${total.toFixed(2)}</td>
        </tr>
      `;
    }).join("");
  
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
      <meta charset="UTF-8"/>
      <title>Invoice</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
  
        @media print {
          @page {
            width: ${pageWidth};
            margin: 4mm;
          }
          body { width: ${pageWidth}; }
          .no-print { display: none; }
        }
  
        body {
          font-family: 'Courier New', monospace;
          font-size: ${fontSize};
          width: ${pageWidth};
          padding: 4mm;
        }
  
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .divider { border-top: 1px dashed #000; margin: 4px 0; }
  
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: ${fontSize};
        }
  
        td { padding: 2px 0; vertical-align: top; }
  
        .total-row td {
          font-weight: bold;
          font-size: ${width === "58mm" ? "11px" : "13px"};
          border-top: 1px dashed #000;
          padding-top: 4px;
        }
  
        .btn {
          display: block;
          width: 100%;
          padding: 8px;
          margin: 6px 0;
          font-size: 14px;
          cursor: pointer;
          border: none;
          border-radius: 4px;
          font-weight: bold;
        }
  
        .btn-print { background: #16a34a; color: white; }
        .btn-close { background: #dc2626; color: white; }
      </style>
      </head>
      <body>
  
      <!-- PRINT BUTTONS -->
      <div class="no-print">
        <button class="btn btn-print" onclick="window.print()">
          🖨️ Print Bill
        </button>
        <button class="btn btn-close" onclick="window.close()">
          ✖ Close
        </button>
      </div>
  
      <!-- BILL HEADER -->
      <div class="center bold" style="font-size:${width === "58mm" ? "13px" : "15px"}">
        ${company?.name || "NexBills"}
      </div>
  
      ${company?.setting?.address ? `
        <div class="center" style="font-size:9px">
          ${company.setting.address}
        </div>
      ` : ""}
  
      ${company?.setting?.phone ? `
        <div class="center" style="font-size:9px">
          Ph: ${company.setting.phone}
        </div>
      ` : ""}
  
      ${company?.setting?.gstNumber ? `
        <div class="center" style="font-size:9px">
          GSTIN: ${company.setting.gstNumber}
        </div>
      ` : ""}
  
      <div class="divider"></div>
  
      <div class="bold">Invoice: ${sale.invoiceNo}</div>
      <div>Date: ${new Date(sale.createdAt).toLocaleString("en-IN")}</div>
      <div>Customer: ${sale.customerName}</div>
      ${sale.customerPhone ? `<div>Phone: ${sale.customerPhone}</div>` : ""}
      <div>Payment: ${sale.paymentMode?.toUpperCase()}</div>
  
      <div class="divider"></div>
  
      <!-- ITEMS -->
      <table>
        <tbody>
          ${rows}
        </tbody>
      </table>
  
      <div class="divider"></div>
  
      <!-- TOTALS -->
      <table>
        <tr>
          <td>Sub Total</td>
          <td style="text-align:right">₹${Number(sale.subTotal).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Round Off</td>
          <td style="text-align:right">₹${Number(sale.roundOff).toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td>GRAND TOTAL</td>
          <td style="text-align:right">₹${Number(sale.total).toLocaleString("en-IN")}</td>
        </tr>
        ${sale.paymentMode === "cash" ? `
        <tr>
          <td>Received</td>
          <td style="text-align:right">₹${Number(sale.amountReceived).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Balance</td>
          <td style="text-align:right">₹${Number(sale.balance).toFixed(2)}</td>
        </tr>
        ` : ""}
      </table>
  
      <div class="divider"></div>
  
      <div class="center" style="font-size:9px; margin-top:4px">
        Thank you for your purchase!
      </div>
      <div class="center" style="font-size:8px">
        Powered by NexorBizs Technologies
      </div>
  
      </body>
      </html>
    `;
  
    const win = window.open("", "_blank", "width=400,height=600");
    if (!win) { alert("Popup blocked! Allow popups."); return; }
    win.document.write(html);
    win.document.close();
  };