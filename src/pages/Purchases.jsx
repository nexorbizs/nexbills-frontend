import { useState, useEffect } from "react";
import API from "../api";
import FeatureGate from "../ccomponents/FeatureGate";

export default function Purchases() {

  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    supplierId: "",
    paymentMode: "cash",
    amountPaid: "",
    notes: ""
  });

  const [items, setItems] = useState([]);
  const [itemForm, setItemForm] = useState({
    productId: "",
    qty: "",
    price: "",
    cgst: "",
    sgst: ""
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [purchRes, supRes, proRes] = await Promise.all([
        API.get("/purchases"),
        API.get("/suppliers"),
        API.get("/products")
      ]);
      setPurchases(purchRes.data || []);
      setSuppliers(supRes.data || []);
      setProducts(proRes.data || []);
    } catch {
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD ITEM TO LIST ================= */

  const addItem = () => {
    if (!itemForm.productId) return alert("Select a product");
    if (!itemForm.qty || Number(itemForm.qty) <= 0) return alert("Enter valid qty");
    if (!itemForm.price || Number(itemForm.price) <= 0) return alert("Enter valid price");

    const product = products.find(p => p.id === Number(itemForm.productId));
    if (!product) return;

    const exists = items.find(i => i.productId === Number(itemForm.productId));
    if (exists) return alert("Product already added");

    setItems(prev => [...prev, {
      productId: Number(itemForm.productId),
      productName: product.name,
      hsn: product.hsn,
      qty: Number(itemForm.qty),
      price: Number(itemForm.price),
      cgst: Number(itemForm.cgst || product.cgst || 0),
      sgst: Number(itemForm.sgst || product.sgst || 0)
    }]);

    setItemForm({ productId: "", qty: "", price: "", cgst: "", sgst: "" });
  };

  const removeItem = (productId) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  /* ================= CALC ================= */

  const subTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const taxAmount = items.reduce((s, i) => {
    const taxable = i.price * i.qty;
    return s + taxable * (i.cgst + i.sgst) / 100;
  }, 0);
  const total = subTotal + taxAmount;
  const balance = total - Number(form.amountPaid || 0);

  /* ================= CREATE PURCHASE ================= */

  const createPurchase = async () => {
    if (!form.supplierId) return alert("Select supplier");
    if (items.length === 0) return alert("Add at least one item");

    try {
      const res = await API.post("/purchases", {
        ...form,
        supplierId: Number(form.supplierId),
        amountPaid: Number(form.amountPaid || 0),
        items
      });

      setPurchases(prev => [res.data.purchase, ...prev]);
      setItems([]);
      setForm({ supplierId: "", paymentMode: "cash", amountPaid: "", notes: "" });
      alert("Purchase created: " + res.data.purchase.purchaseNo);

    } catch (err) {
      alert(err.response?.data?.error || "Purchase failed");
    }
  };

  /* ================= VIEW PURCHASE ================= */

  const viewPurchase = (p) => {
    const rows = (p.items || []).map(i => `
      <tr>
        <td>${i.productName}</td>
        <td>${i.hsn}</td>
        <td>${i.qty}</td>
        <td>₹${i.price}</td>
        <td>${i.cgst}%</td>
        <td>${i.sgst}%</td>
        <td>₹${Number(i.total).toFixed(2)}</td>
      </tr>
    `).join("");

    const html = `
      <html><head><style>
        body{font-family:Arial;padding:30px}
        table{width:100%;border-collapse:collapse;margin-top:20px}
        td,th{border:1px solid #000;padding:8px;text-align:center}
        h2{text-align:center}
      </style></head><body>
      <h2>Purchase Details</h2>
      <p><b>Purchase No:</b> ${p.purchaseNo}</p>
      <p><b>Date:</b> ${new Date(p.createdAt).toLocaleString()}</p>
      <p><b>Supplier:</b> ${p.supplierName}</p>
      <p><b>Payment:</b> ${p.paymentMode?.toUpperCase()}</p>
      <table>
        <tr>
          <th>Item</th><th>HSN</th><th>Qty</th>
          <th>Price</th><th>CGST</th><th>SGST</th><th>Total</th>
        </tr>
        ${rows}
      </table>
      <h3 style="text-align:right">Sub Total: ₹${Number(p.subTotal).toFixed(2)}</h3>
      <h3 style="text-align:right">Tax: ₹${Number(p.taxAmount).toFixed(2)}</h3>
      <h2 style="text-align:right">Total: ₹${Number(p.total).toLocaleString("en-IN")}</h2>
      <h3 style="text-align:right">Paid: ₹${Number(p.amountPaid).toFixed(2)}</h3>
      <h3 style="text-align:right">Balance: ₹${Number(p.balance).toFixed(2)}</h3>
      </body></html>
    `;

    const win = window.open("", "", "width=900,height=700");
    if (!win) { alert("Popup blocked"); return; }
    win.document.write(html);
    win.document.close();
  };

  const filtered = purchases.filter(p =>
    p.purchaseNo.toLowerCase().includes(search.toLowerCase()) ||
    p.supplierName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-6">Loading Purchases...</div>;

  return (
    <FeatureGate feature="purchase_management">
    <div>

      <h1 className="text-2xl md:text-3xl font-bold mb-6">Purchase Module</h1>

      {/* ADD PURCHASE FORM */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow mb-6">

        <h2 className="text-lg font-semibold mb-4">New Purchase</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <select
            value={form.supplierId}
            onChange={e => setForm({ ...form, supplierId: e.target.value })}
            className="border p-3 rounded-lg text-sm"
          >
            <option value="">Select Supplier</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select
            value={form.paymentMode}
            onChange={e => setForm({ ...form, paymentMode: e.target.value })}
            className="border p-3 rounded-lg text-sm"
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="credit">Credit</option>
          </select>

          <input
            placeholder="Amount Paid"
            value={form.amountPaid}
            onChange={e => setForm({ ...form, amountPaid: e.target.value })}
            className="border p-3 rounded-lg text-sm"
            type="number"
          />

          <input
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            className="border p-3 rounded-lg text-sm"
          />
        </div>

        {/* ADD ITEM */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-3">
          <select
            value={itemForm.productId}
            onChange={e => {
              const product = products.find(p => p.id === Number(e.target.value));
              setItemForm({
                ...itemForm,
                productId: e.target.value,
                cgst: product?.cgst || "",
                sgst: product?.sgst || ""
              });
            }}
            className="border p-3 rounded-lg text-sm col-span-2"
          >
            <option value="">Select Product</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <input
            placeholder="Qty"
            value={itemForm.qty}
            onChange={e => setItemForm({ ...itemForm, qty: e.target.value })}
            className="border p-3 rounded-lg text-sm"
            type="number"
          />

          <input
            placeholder="Price"
            value={itemForm.price}
            onChange={e => setItemForm({ ...itemForm, price: e.target.value })}
            className="border p-3 rounded-lg text-sm"
            type="number"
          />

          <input
            placeholder="CGST %"
            value={itemForm.cgst}
            onChange={e => setItemForm({ ...itemForm, cgst: e.target.value })}
            className="border p-3 rounded-lg text-sm"
            type="number"
          />

          <input
            placeholder="SGST %"
            value={itemForm.sgst}
            onChange={e => setItemForm({ ...itemForm, sgst: e.target.value })}
            className="border p-3 rounded-lg text-sm"
            type="number"
          />
        </div>

        <button
          onClick={addItem}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 p-2 text-sm font-semibold transition mb-4"
        >
          + Add Item
        </button>

        {/* ITEMS LIST */}
        {items.length > 0 && (
          <div className="overflow-x-auto mb-4">
            <table className="w-full min-w-[600px] text-sm border rounded-lg overflow-hidden">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-center">CGST</th>
                  <th className="p-3 text-center">SGST</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-center">Remove</th>
                </tr>
              </thead>
              <tbody>
                {items.map(i => {
                  const taxable = i.price * i.qty;
                  const tax = taxable * (i.cgst + i.sgst) / 100;
                  return (
                    <tr key={i.productId} className="border-t">
                      <td className="p-3">{i.productName}</td>
                      <td className="p-3 text-center">{i.qty}</td>
                      <td className="p-3 text-right">₹{i.price}</td>
                      <td className="p-3 text-center">{i.cgst}%</td>
                      <td className="p-3 text-center">{i.sgst}%</td>
                      <td className="p-3 text-right font-semibold">₹{(taxable + tax).toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => removeItem(i.productId)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                        >✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* SUMMARY */}
        {items.length > 0 && (
          <div className="bg-slate-50 p-4 rounded-lg mb-4 text-sm">
            <div className="flex justify-between"><span>Sub Total</span><span>₹{subTotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>₹{taxAmount.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t mt-2 pt-2"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
            <div className="flex justify-between text-green-600"><span>Paid</span><span>₹{Number(form.amountPaid || 0).toFixed(2)}</span></div>
            <div className="flex justify-between text-red-600"><span>Balance</span><span>₹{balance.toFixed(2)}</span></div>
          </div>
        )}

        <button
          onClick={createPurchase}
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-3 font-semibold transition w-full"
        >
          Create Purchase
        </button>

      </div>

      {/* PURCHASE HISTORY */}
      <input
        placeholder="Search Purchase"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="border p-3 rounded-lg w-full mb-4"
      />

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Purchase No</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Supplier</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-400">
                  No purchases found
                </td>
              </tr>
            )}
            {filtered.map(p => (
              <tr
                key={p.id}
                className="border-t cursor-pointer hover:bg-slate-50"
                onClick={() => viewPurchase(p)}
              >
                <td className="p-3 text-blue-600 font-semibold">{p.purchaseNo}</td>
                <td className="p-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="p-3">{p.supplierName}</td>
                <td className="p-3 text-right font-bold">₹{Number(p.total).toLocaleString("en-IN")}</td>
                <td className={`p-3 text-right font-semibold ${Number(p.balance) > 0 ? "text-red-500" : "text-green-600"}`}>
                  ₹{Number(p.balance).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
    </FeatureGate>  
  );
}