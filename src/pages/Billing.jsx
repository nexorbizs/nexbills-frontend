import { useState, useEffect } from "react";
import API from "../api";
import { useProductStore } from "../store/productStore";
import { useCartStore } from "../store/cartStore";
import { printThermal } from "../utils/thermalPrint";

export default function Billing(){

  const { products, loadProducts } = useProductStore();
  const { cart, addToCart, increaseQty, decreaseQty, clearCart } = useCartStore();

  const [search, setSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [customers, setCustomers] = useState([]);

  const [paymentMode, setPaymentMode] = useState("cash");
  const [amountReceived, setAmountReceived] = useState("");

  const [loading, setLoading] = useState(false);

  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [activeCartIndex, setActiveCartIndex] = useState(0);

  useEffect(() => {
    loadProducts();
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try{
      const res = await API.get("/customers");
      setCustomers(res.data || []);
    }catch{
      console.log("customer load fail");
    }
  };

  /* ================= CUSTOMER SEARCH ================= */

  const filteredCustomers = customers.filter(c =>
    (c.name || "").toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.phone || "").includes(customerSearch)
  );

  const selectCustomer = (c) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setCustomerSearch("");
  };

  /* ================= PRODUCT SEARCH ================= */

  const filteredProducts = products.filter(p =>
    p.stock > 0 &&
    (
      (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(search.toLowerCase())
    )
  );

  /* ================= KEYBOARD POS ================= */

  useEffect(() => {

    const handleKey = (e) => {

      if (["INPUT","TEXTAREA"].includes(document.activeElement.tagName))
        return;

      if(search && filteredProducts.length){

        if(e.key === "ArrowDown"){
          setActiveProductIndex(i =>
            i < filteredProducts.length - 1 ? i + 1 : 0
          );
        }

        if(e.key === "ArrowUp"){
          setActiveProductIndex(i =>
            i > 0 ? i - 1 : filteredProducts.length - 1
          );
        }

        if(e.key === "Enter"){
          addToCart(filteredProducts[activeProductIndex]);
          setSearch("");
        }

        return;
      }

      if(cart.length){

        if(e.key === "ArrowRight"){
          setActiveCartIndex(i =>
            i < cart.length - 1 ? i + 1 : 0
          );
        }

        if(e.key === "ArrowLeft"){
          setActiveCartIndex(i =>
            i > 0 ? i - 1 : cart.length - 1
          );
        }

        if(e.key === "ArrowUp"){
          increaseQty(cart[activeCartIndex].id);
        }

        if(e.key === "ArrowDown"){
          decreaseQty(cart[activeCartIndex].id);
        }

      }

      if(e.key === "Enter" && !search){
        createBill();
      }

    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);

  }, [search, filteredProducts, cart, activeProductIndex, activeCartIndex]);

  /* ================= GST CALC ================= */

  const calcRow = (item) => {
    const taxable = item.price * item.qty;
    const cgstAmt = taxable * item.cgst / 100;
    const sgstAmt = taxable * item.sgst / 100;
    return taxable + cgstAmt + sgstAmt;
  };

  const exactTotal = cart.reduce((s,i)=>s+calcRow(i),0);
  const roundedTotal = Math.round(exactTotal);
  const roundOff = roundedTotal - exactTotal;

  const balance =
    paymentMode === "cash"
      ? Number(amountReceived || 0) - roundedTotal
      : 0;

  /* ================= BILL ================= */

  const createBill = async () => {

    if(cart.length === 0) return alert("Cart empty");
    if(!customerName.trim()) return alert("Customer required");
  
    // ⭐ ASK WIDTH FIRST (before async call)
    const width = window.confirm(
      "Click OK for 80mm\nClick Cancel for 58mm"
    ) ? "80mm" : "58mm";
  
    try {
  
      setLoading(true);
  
      const res = await API.post("/sales", {
        customerName,
        customerPhone,
        paymentMode,
        amountReceived:
          paymentMode === "upi"
            ? roundedTotal
            : Number(amountReceived || 0),
        items: cart.map(i => ({
          productId: i.id,
          qty: i.qty
        }))
      });
  
      const saleData = {
        ...res.data.sale,
        company: JSON.parse(localStorage.getItem("company") || "{}")
      };
  
      printThermal(saleData, width);
  
      alert("Invoice Created: " + res.data.sale.invoiceNo);
  
      clearCart();
      setCustomerName("");
      setCustomerPhone("");
      setAmountReceived("");
      loadProducts();
  
    } catch (err) {
      console.log(err.response);
      alert(err.response?.data?.message || "Billing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

      <div className="xl:col-span-8 space-y-4">

        <input
          placeholder="Search Customer (Name / Phone)"
          value={customerSearch}
          onChange={e=>setCustomerSearch(e.target.value)}
          className="border p-3 w-full rounded-xl"
        />

        {customerSearch && (
          <div className="bg-white border rounded-xl shadow">
            {filteredCustomers.map(c=>(
              <div key={c.id}
                className="p-3 cursor-pointer hover:bg-slate-100"
                onClick={()=>selectCustomer(c)}>
                {c.name} - {c.phone}
              </div>
            ))}
          </div>
        )}

        <input
          placeholder="Customer Name"
          value={customerName}
          onChange={e=>setCustomerName(e.target.value)}
          className="border p-3 w-full rounded-xl"
        />

        <input
          placeholder="Customer Phone"
          value={customerPhone}
          onChange={e=>setCustomerPhone(e.target.value)}
          className="border p-3 w-full rounded-xl"
        />

        <input
          placeholder="Search Product"
          value={search}
          onChange={e=>setSearch(e.target.value)}
          className="border p-3 w-full rounded-xl"
        />

        {search && (
          <div className="bg-white border rounded-xl shadow">
            {filteredProducts.map((p,index)=>(
              <div key={p.id}
                className={`p-3 cursor-pointer ${
                  index === activeProductIndex ? "bg-blue-100" : ""
                }`}
                onClick={()=>{ addToCart(p); setSearch(""); }}>
                {p.name} ₹{p.price}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">

          {cart.length === 0
            ? <div className="p-6 text-center text-gray-400">
                No items in cart
              </div>
            :
          <table className="min-w-[600px] w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">Item</th>
                <th className="p-4 text-center">Qty</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {cart.map(item=>(
                <tr key={item.id} className="border-t">

                  <td className="p-4">{item.name}</td>

                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={()=>decreaseQty(item.id)}
                        className="bg-red-500 text-white w-7 h-7 rounded"
                      >-</button>

                      <span>{item.qty}</span>

                      <button
                        onClick={()=>increaseQty(item.id)}
                        className="bg-green-500 text-white w-7 h-7 rounded"
                      >+</button>
                    </div>
                  </td>

                  <td className="p-4 text-right">₹ {item.price}</td>

                  <td className="p-4 text-right font-semibold">
                    ₹ {calcRow(item).toFixed(2)}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
          }

        </div>

      </div>

      <div className="xl:col-span-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg">

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

            <div className="flex justify-between text-lg font-bold text-green-600">
              <span>Total</span>
              <span>₹ {roundedTotal.toFixed(2)}</span>
            </div>
          </div>

          <select
            value={paymentMode}
            onChange={e=>setPaymentMode(e.target.value)}
            className="border p-3 w-full rounded-xl mb-4"
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
          </select>

          {paymentMode === "cash" && (
            <>
              <input
                placeholder="Amount Received"
                value={amountReceived}
                onChange={e=>setAmountReceived(e.target.value)}
                className="border p-3 w-full rounded-xl mb-2"
              />

              <p className="text-right text-sm text-slate-500">
                Balance: ₹ {balance >= 0 ? balance : 0}
              </p>
            </>
          )}

          <button
            disabled={loading}
            onClick={createBill}
            className="bg-green-600 text-white p-4 w-full rounded-xl mt-4 font-semibold">
            {loading ? "Creating..." : "Generate Invoice"}
          </button>

        </div>
      </div>

    </div>
  );
}