import { useState } from "react";
import { useProductStore } from "../store/productStore";
import { useCartStore } from "../store/cartStore";
import { getTenantData, saveTenantData } from "../utils/tenant";
import { generateInvoiceNumber } from "../utils/invoice";

export default function Billing(){

  const { products, reduceStock } = useProductStore();
  const { cart, addToCart, increaseQty, decreaseQty, clearCart } = useCartStore();

  const [search, setSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const customers = getTenantData("customers");
  const shop = getTenantData("settings")[0] || {};

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  const filteredProducts = products.filter(p =>
    p.stock > 0 &&
    (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      String(p.sku).toLowerCase().includes(search.toLowerCase())
    )
  );

  const calcRow = (item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    const cgst = Number(item.cgst) || 0;
    const sgst = Number(item.sgst) || 0;

    const taxable = price * qty;
    const cgstAmt = taxable * cgst / 100;
    const sgstAmt = taxable * sgst / 100;

    return {
      taxable,
      cgst,
      sgst,
      total: taxable + cgstAmt + sgstAmt
    };
  };

  const exactTotal = cart.reduce((s,i)=>s+calcRow(i).total,0);
  const roundedTotal = Math.round(exactTotal);
  const roundOff = roundedTotal - exactTotal;

  const markAsPaid = () => {

    if(cart.length === 0) return alert("Cart empty");
    if(!selectedCustomer) return alert("Select customer");

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    for(const item of cart){
      const product = products.find(p=>p.id === item.id);
      if(!product || product.stock < item.qty){
        alert(`${item.name} out of stock`);
        return;
      }
    }

    cart.forEach(i=>reduceStock(i.id, i.qty));

    const newInvoice = {
      id: Date.now(),
      invoiceNo: generateInvoiceNumber(currentUser.id),
      companyId: currentUser.id,
      customer: selectedCustomer,
      items: JSON.parse(JSON.stringify(cart)),
      subTotal: exactTotal,
      roundOff,
      total: roundedTotal,
      date: new Date().toLocaleString()
    };

    saveTenantData("invoices", newInvoice);
    window.dispatchEvent(new Event("invoiceUpdated"));

    const win = window.open("", "", "width=900,height=700");

    const rows = cart.map(i=>{
      const c = calcRow(i);
      return `
        <tr>
          <td>${i.name}</td>
          <td>${i.hsn || "-"}</td>
          <td>${i.qty}</td>
          <td>${i.price}</td>
          <td>${c.cgst}%</td>
          <td>${c.sgst}%</td>
          <td>${c.total.toFixed(2)}</td>
        </tr>
      `;
    }).join("");

    win.document.write(`
      <html>
      <head>
      <title>Invoice</title>
      
      <style>
      
      body{
      font-family: Arial;
      padding:40px;
      color:#111;
      }
      
      .header{
      display:flex;
      justify-content:space-between;
      border-bottom:2px solid #000;
      padding-bottom:10px;
      margin-bottom:20px;
      }
      
      .shop{
      font-size:22px;
      font-weight:bold;
      }
      
      .invoice-box{
      text-align:right;
      }
      
      table{
      width:100%;
      border-collapse:collapse;
      margin-top:20px;
      }
      
      th{
      background:#f3f4f6;
      padding:10px;
      border:1px solid #ccc;
      }
      
      td{
      padding:10px;
      border:1px solid #ccc;
      text-align:center;
      }
      
      .total-box{
      margin-top:20px;
      text-align:right;
      }
      
      .footer{
      margin-top:40px;
      font-size:12px;
      text-align:center;
      color:#555;
      }
      
      </style>
      </head>
      
      <body>
      
      <div class="header">
      
      <div>
      <div class="shop">${shop.shop || "Shop Name"}</div>
      <div>GST: ${shop.gst || "-"}</div>
      <div>${shop.phone || ""}</div>
      </div>
      
      <div class="invoice-box">
      <div><b>Invoice No:</b> ${newInvoice.invoiceNo}</div>
      <div><b>Date:</b> ${newInvoice.date}</div>
      </div>
      
      </div>
      
      <div>
      <b>Bill To:</b> ${selectedCustomer.name}<br/>
      ${selectedCustomer.phone}
      </div>
      
      <table>
      <tr>
      <th>Item</th>
      <th>HSN</th>
      <th>Qty</th>
      <th>Price</th>
      <th>CGST</th>
      <th>SGST</th>
      <th>Total</th>
      </tr>
      
      ${rows}
      
      </table>
      
      <div class="total-box">
      <div>Sub Total : ₹ ${exactTotal.toFixed(2)}</div>
      <div>Round Off : ₹ ${roundOff.toFixed(2)}</div>
      <h2>Grand Total : ₹ ${roundedTotal}</h2>
      </div>
      
      <div class="footer">
      This is a computer generated invoice<br/>
      Powered by NexBills
      </div>
      
      </body>
      </html>
      `);

    win.document.close();
    win.print();

    clearCart();
    setSearch("");
    setCustomerSearch("");
    setSelectedCustomer(null);
  };

  return (
    <div className="p-8 grid grid-cols-12 gap-8">

      {/* LEFT PANEL */}
      <div className="col-span-8">

        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">

          <input
            placeholder="Search Customer"
            value={customerSearch}
            onChange={(e)=>{
              setCustomerSearch(e.target.value);
              setShowCustomerDropdown(true);
            }}
            className="border p-3 w-full rounded-xl"
          />

          {showCustomerDropdown && customerSearch && (
            <div className="bg-white border rounded-xl mt-2 max-h-40 overflow-auto">
              {filteredCustomers.map(c=>(
                <div key={c.id}
                  className="p-3 hover:bg-slate-100 cursor-pointer"
                  onClick={()=>{
                    setSelectedCustomer(c);
                    setCustomerSearch(c.name);
                    setShowCustomerDropdown(false);
                  }}>
                  {c.name} — {c.phone}
                </div>
              ))}
            </div>
          )}

        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <input
            placeholder="Search Product / SKU"
            value={search}
            onChange={e=>setSearch(e.target.value)}
            className="border p-3 w-full rounded-xl"
          />

          {search && (
            <div className="bg-white border rounded-xl mt-2 max-h-40 overflow-auto">
              {filteredProducts.map(p=>(
                <div key={p.id}
                  onClick={()=>addToCart(p)}
                  className="p-3 hover:bg-slate-100 cursor-pointer">
                  {p.name} ₹{p.price}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CART */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">Item</th>
                <th className="p-4">HSN</th>
                <th className="p-4">Qty</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4">CGST</th>
                <th className="p-4">SGST</th>
                <th className="p-4 text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {cart.map(item=>{
                const c = calcRow(item);
                return (
                  <tr key={item.id} className="border-t">
                    <td className="p-4">{item.name}</td>
                    <td className="p-4 text-center">{item.hsn || "-"}</td>

                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button className="px-3 py-1 bg-slate-200 rounded"
                          onClick={()=>decreaseQty(item.id)}>-</button>
                        {item.qty}
                        <button className="px-3 py-1 bg-slate-200 rounded"
                          onClick={()=>increaseQty(item.id)}>+</button>
                      </div>
                    </td>

                    <td className="p-4 text-right">₹ {item.price}</td>
                    <td className="p-4 text-center">{c.cgst}%</td>
                    <td className="p-4 text-center">{c.sgst}%</td>
                    <td className="p-4 text-right font-semibold">
                      ₹ {c.total.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* RIGHT PANEL */}
      <div className="col-span-4">

        <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-6">

          <h2 className="text-2xl font-bold mb-6">Summary</h2>

          <div className="space-y-3 mb-6">

            <div className="flex justify-between text-lg">
              <span>Sub Total</span>
              <span>₹ {exactTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-lg text-orange-500">
              <span>Round Off</span>
              <span>₹ {roundOff.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-3xl font-bold text-green-600">
              <span>Total</span>
              <span>₹ {roundedTotal.toFixed(2)}</span>
            </div>

          </div>

          <button
            onClick={markAsPaid}
            className="bg-green-600 hover:bg-green-700 text-white p-4 w-full rounded-xl text-lg font-semibold">
            Generate GST Invoice
          </button>

        </div>

      </div>

    </div>
  );
}