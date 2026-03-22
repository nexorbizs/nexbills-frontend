export const printThermal = (sale, width = "80mm") => {

  const company = sale.company ||
    JSON.parse(localStorage.getItem("company") || "{}");

  const pageWidth = width === "58mm" ? "58mm" : "80mm";
  const fontSize = width === "58mm" ? "10px" : "12px";

  // ⭐ Branch name
  const branchName = sale.branch?.name || "";

  // ⭐ UPI ID from settings
  const upiId = company?.setting?.upiId || "";

  // ⭐ UPI QR code URL (uses Google Charts API)
  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(company?.name || "")}&am=${sale.total}&cu=INR&tn=${encodeURIComponent("Invoice " + sale.invoiceNo)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiString)}`;

  // ⭐ Logo URL
  const logoUrl = company?.setting?.logoUrl || "";

  const totalCgst = (sale.items || []).reduce((s, i) => {
    const discountedPrice = Number(i.discountedPrice || i.price);
    return s + (discountedPrice * Number(i.qty) * Number(i.cgst) / 100);
  }, 0);

  const totalSgst = (sale.items || []).reduce((s, i) => {
    const discountedPrice = Number(i.discountedPrice || i.price);
    return s + (discountedPrice * Number(i.qty) * Number(i.sgst) / 100);
  }, 0);

  const rows = (sale.items || []).map(i => {
    const discount = Number(i.discount || 0);
    const originalPrice = Number(i.price);
    const discountedPrice = Number(i.discountedPrice || i.price);
    const taxable = discountedPrice * Number(i.qty);
    const cgst = taxable * Number(i.cgst) / 100;
    const sgst = taxable * Number(i.sgst) / 100;
    const total = taxable + cgst + sgst;

    return `
      <tr>
        <td colspan="2"><b>${i.productName}</b></td>
      </tr>
      <tr>
        <td>${i.qty} x ₹${originalPrice}</td>
        <td style="text-align:right">₹${(originalPrice * Number(i.qty)).toFixed(2)}</td>
      </tr>
      ${discount > 0 ? `
      <tr>
        <td style="font-size:9px; color:#16a34a">Discount ${discount}%</td>
        <td style="text-align:right; font-size:9px; color:#16a34a">
          -₹${((originalPrice - discountedPrice) * Number(i.qty)).toFixed(2)}
        </td>
      </tr>
      <tr>
        <td style="font-size:9px">${i.qty} x ₹${discountedPrice.toFixed(2)}</td>
        <td style="text-align:right; font-size:9px">₹${taxable.toFixed(2)}</td>
      </tr>
      ` : ""}
      <tr>
        <td style="font-size:9px">CGST ${i.cgst}%</td>
        <td style="text-align:right; font-size:9px">₹${cgst.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="font-size:9px">SGST ${i.sgst}%</td>
        <td style="text-align:right; font-size:9px">₹${sgst.toFixed(2)}</td>
      </tr>
      <tr>
        <td><b>Item Total</b></td>
        <td style="text-align:right"><b>₹${total.toFixed(2)}</b></td>
      </tr>
      <tr><td colspan="2"><hr style="border:none;border-top:1px dashed #ccc"/></td></tr>
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

      .qr-box {
        text-align: center;
        margin: 6px 0;
      }

      .qr-box img {
        width: 120px;
        height: 120px;
      }
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

    <!-- ⭐ SHOP LOGO -->
    ${logoUrl ? `
    <div class="center" style="margin-bottom: 4px;">
      <img src="${logoUrl}" alt="Logo"
        style="max-width:${width === "58mm" ? "80px" : "100px"}; max-height:60px; object-fit:contain;" />
    </div>
    ` : ""}

    <!-- BILL HEADER -->
    <div class="center bold" style="font-size:${width === "58mm" ? "13px" : "15px"}">
      ${company?.name || "NexBills"}
    </div>

    <!-- ⭐ BRANCH NAME -->
    ${branchName ? `
    <div class="center" style="font-size:10px; font-weight:bold; color:#333;">
      📍 ${branchName}
    </div>
    ` : ""}

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
      ${Number(sale.discountAmount || 0) > 0 ? `
      <tr>
        <td style="color:#16a34a">
          Discount (${sale.discountType === "percent"
            ? sale.discountValue + "%"
            : "Flat"})
        </td>
        <td style="text-align:right; color:#16a34a">
          -₹${Number(sale.discountAmount).toFixed(2)}
        </td>
      </tr>
      ` : ""}
      <tr>
        <td style="font-size:9px">CGST</td>
        <td style="text-align:right; font-size:9px">₹${totalCgst.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="font-size:9px">SGST</td>
        <td style="text-align:right; font-size:9px">₹${totalSgst.toFixed(2)}</td>
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

    <!-- ⭐ UPI QR CODE — only for UPI payments or if UPI ID exists -->
    ${upiId && sale.paymentMode === "upi" ? `
    <div class="qr-box">
      <div style="font-size:9px; font-weight:bold; margin-bottom:4px;">
        Scan to Pay via UPI
      </div>
      <img src="${qrUrl}" alt="UPI QR Code" />
      <div style="font-size:9px; margin-top:4px;">${upiId}</div>
      <div style="font-size:9px; color:#16a34a; font-weight:bold;">
        ₹${Number(sale.total).toLocaleString("en-IN")}
      </div>
    </div>
    <div class="divider"></div>
    ` : ""}

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