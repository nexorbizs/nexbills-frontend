import { useState, useEffect, useRef } from "react";
import API from "../api";
import { useProductStore } from "../store/productStore";
import { useCartStore } from "../store/cartStore";
import { printThermal } from "../utils/thermalPrint";

export default function Billing() {

  const { products, loadProducts } = useProductStore();
  const { cart, addToCart, increaseQty, decreaseQty, clearCart, updateDiscount } = useCartStore();

  const [search, setSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customers, setCustomers] = useState([]);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [activeCartIndex, setActiveCartIndex] = useState(0);

  // ⭐ BRANCH
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  // ⭐ BARCODE - USB scanner
  const [barcodeBuffer, setBarcodeBuffer] = useState("");
  const [barcodeStatus, setBarcodeStatus] = useState(""); // success/error message
  const barcodeTimer = useRef(null);

  // ⭐ CAMERA SCAN
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const cameraStream = useRef(null);
  const scannerRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "OWNER";
  const userBranches = user?.branches || [];

  useEffect(() => {
    loadProducts();
    loadCustomers();
    loadBranches();
  }, []);

  // ⭐ Cleanup camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await API.get("/customers");
      setCustomers(res.data || []);
    } catch {
      console.log("customer load fail");
    }
  };

  const loadBranches = async () => {
    try {
      const res = await API.get("/branches");
      let allBranches = res.data || [];
      const filtered = role === "OWNER"
        ? allBranches
        : allBranches.filter(b => userBranches.some(ub => ub.id === b.id));
      setBranches(filtered);
      if (filtered.length > 0) setBranchId(filtered[0].id);
    } catch {
      console.log("branch load fail");
    }
  };

  // ⭐ BARCODE LOOKUP
  const lookupBarcode = async (barcode) => {
    if (!barcode.trim()) return;
    try {
      const res = await API.get(`/products/barcode/${barcode.trim()}`);
      const product = res.data;
      if (product.stock <= 0) {
        setBarcodeStatus(`❌ ${product.name} — Out of stock!`);
        return;
      }
      addToCart(product);
      setBarcodeStatus(`✅ Added: ${product.name} — ₹${product.price}`);
      setTimeout(() => setBarcodeStatus(""), 3000);
    } catch {
      setBarcodeStatus(`❌ Barcode not found: ${barcode}`);
      setTimeout(() => setBarcodeStatus(""), 3000);
    }
  };

  // ⭐ USB SCANNER — detects rapid keystrokes ending with Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip if focused on input (except barcode input)
      const tag = document.activeElement.tagName;
      const isBarcodeInput = document.activeElement.id === "barcode-input";
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag) && !isBarcodeInput) return;

      if (e.key === "Enter") {
        if (barcodeBuffer.length >= 6) {
          lookupBarcode(barcodeBuffer);
        }
        setBarcodeBuffer("");
        if (barcodeTimer.current) clearTimeout(barcodeTimer.current);
        return;
      }

      // Only collect printable characters
      if (e.key.length === 1) {
        setBarcodeBuffer(prev => prev + e.key);

        // Reset buffer after 100ms of inactivity (USB scanners are fast)
        if (barcodeTimer.current) clearTimeout(barcodeTimer.current);
        barcodeTimer.current = setTimeout(() => {
          setBarcodeBuffer("");
        }, 100);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [barcodeBuffer, products]);

  // ⭐ CAMERA SCANNER
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" } // use back camera on mobile
      });
      cameraStream.current = stream;
      setCameraOpen(true);

      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          startBarcodeScanning();
        }
      }, 300);
    } catch {
      alert("Camera not available. Please allow camera access.");
    }
  };

  const stopCamera = () => {
    if (cameraStream.current) {
      cameraStream.current.getTracks().forEach(t => t.stop());
      cameraStream.current = null;
    }
    if (scannerRef.current) {
      clearInterval(scannerRef.current);
      scannerRef.current = null;
    }
    setCameraOpen(false);
  };

  const startBarcodeScanning = () => {
    // Use BarcodeDetector API (supported in Chrome/Edge on Android)
    if (!("BarcodeDetector" in window)) {
      alert("Camera barcode scanning not supported in this browser. Use USB scanner instead.");
      stopCamera();
      return;
    }

    const detector = new window.BarcodeDetector({
      formats: ["ean_13", "ean_8", "upc_a", "upc_e", "qr_code", "code_128", "code_39"]
    });

    scannerRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes.length > 0) {
          const code = barcodes[0].rawValue;
          stopCamera();
          lookupBarcode(code);
        }
      } catch {
        // scanning in progress
      }
    }, 500);
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
      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

      if (search && filteredProducts.length) {
        if (e.key === "ArrowDown") setActiveProductIndex(i => i < filteredProducts.length - 1 ? i + 1 : 0);
        if (e.key === "ArrowUp") setActiveProductIndex(i => i > 0 ? i - 1 : filteredProducts.length - 1);
        if (e.key === "Enter") { addToCart(filteredProducts[activeProductIndex]); setSearch(""); }
        return;
      }

      if (cart.length) {
        if (e.key === "ArrowRight") setActiveCartIndex(i => i < cart.length - 1 ? i + 1 : 0);
        if (e.key === "ArrowLeft") setActiveCartIndex(i => i > 0 ? i - 1 : cart.length - 1);
        if (e.key === "ArrowUp") increaseQty(cart[activeCartIndex].id);
        if (e.key === "ArrowDown") decreaseQty(cart[activeCartIndex].id);
      }

      if (e.key === "Enter" && !search) createBill();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [search, filteredProducts, cart, activeProductIndex, activeCartIndex]);

  /* ================= GST CALC ================= */

  const calcRow = (item) => {
    const discount = Number(item.discount || 0);
    const discountedPrice = item.price * (1 - discount / 100);
    const taxable = discountedPrice * item.qty;
    const cgstAmt = taxable * item.cgst / 100;
    const sgstAmt = taxable * item.sgst / 100;
    return taxable + cgstAmt + sgstAmt;
  };

  const subTotal = cart.reduce((s, i) => {
    const discount = Number(i.discount || 0);
    const discountedPrice = i.price * (1 - discount / 100);
    return s + discountedPrice * i.qty;
  }, 0);

  const billDiscountAmount = discountType === "percent"
    ? subTotal * Number(discountValue || 0) / 100
    : Number(discountValue || 0);

  const discountedSubTotal = subTotal - billDiscountAmount;

  const totalGST = cart.reduce((s, i) => {
    const discount = Number(i.discount || 0);
    const discountedPrice = i.price * (1 - discount / 100);
    const taxable = discountedPrice * i.qty;
    return s + taxable * (i.cgst + i.sgst) / 100;
  }, 0);

  const gstMultiplier = subTotal > 0 ? discountedSubTotal / subTotal : 1;
  const adjustedGST = totalGST * gstMultiplier;
  const exactTotal = discountedSubTotal + adjustedGST;
  const roundedTotal = Math.round(exactTotal);
  const roundOff = roundedTotal - exactTotal;
  const balance = paymentMode === "cash" ? Number(amountReceived || 0) - roundedTotal : 0;

  /* ================= BILL ================= */

  const createBill = async () => {
    if (cart.length === 0) return alert("Cart empty");
    if (!customerName.trim()) return alert("Customer required");

    const width = window.confirm("Click OK for 80mm\nClick Cancel for 58mm") ? "80mm" : "58mm";

    try {
      setLoading(true);

      const res = await API.post("/sales", {
        customerName,
        customerPhone,
        paymentMode,
        amountReceived: paymentMode === "upi" ? roundedTotal : Number(amountReceived || 0),
        discountType,
        discountValue: Number(discountValue || 0),
        branchId: branchId ? Number(branchId) : null,
        items: cart.map(i => ({
          productId: i.id,
          qty: i.qty,
          discount: Number(i.discount || 0)
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
      setDiscountValue("");
      loadProducts();

    } catch (err) {
      alert(err.response?.data?.message || "Billing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

      <div className="xl:col-span-8 space-y-4">

        {/* BRANCH SELECTOR */}
        {branches.length > 0 && (
          <select value={branchId} onChange={e => setBranchId(e.target.value)}
            className="border p-3 w-full rounded-xl bg-white font-semibold text-slate-700">
            {branches.map(b => (
              <option key={b.id} value={b.id}>🏪 {b.name}</option>
            ))}
          </select>
        )}

        {/* ⭐ BARCODE SCANNER ROW */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              id="barcode-input"
              placeholder="📦 Scan barcode or type EAN/UPC number"
              className="border p-3 w-full rounded-xl font-mono"
              onKeyDown={e => {
                if (e.key === "Enter") {
                  lookupBarcode(e.target.value);
                  e.target.value = "";
                }
              }}
            />
          </div>
          <button
            onClick={cameraOpen ? stopCamera : startCamera}
            className={`px-4 py-3 rounded-xl font-semibold text-white text-sm transition ${cameraOpen ? "bg-red-500 hover:bg-red-600" : "bg-indigo-600 hover:bg-indigo-700"}`}
          >
            {cameraOpen ? "📷 Stop" : "📷 Camera"}
          </button>
        </div>

        {/* ⭐ BARCODE STATUS */}
        {barcodeStatus && (
          <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${barcodeStatus.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {barcodeStatus}
          </div>
        )}

        {/* ⭐ CAMERA VIEW */}
        {cameraOpen && (
          <div className="relative bg-black rounded-xl overflow-hidden">
            <video ref={videoRef} className="w-full rounded-xl" playsInline muted />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-green-400 w-64 h-32 rounded-lg opacity-70" />
            </div>
            <p className="absolute bottom-2 w-full text-center text-white text-xs">
              Point camera at barcode
            </p>
          </div>
        )}

        <input
          placeholder="Search Customer (Name / Phone)"
          value={customerSearch}
          onChange={e => setCustomerSearch(e.target.value)}
          className="border p-3 w-full rounded-xl"
        />

        {customerSearch && (
          <div className="bg-white border rounded-xl shadow">
            {filteredCustomers.map(c => (
              <div key={c.id} className="p-3 cursor-pointer hover:bg-slate-100" onClick={() => selectCustomer(c)}>
                {c.name} - {c.phone}
              </div>
            ))}
          </div>
        )}

        <input placeholder="Customer Name" value={customerName}
          onChange={e => setCustomerName(e.target.value)} className="border p-3 w-full rounded-xl" />

        <input placeholder="Customer Phone" value={customerPhone}
          onChange={e => setCustomerPhone(e.target.value)} className="border p-3 w-full rounded-xl" />

        <input placeholder="Search Product" value={search}
          onChange={e => setSearch(e.target.value)} className="border p-3 w-full rounded-xl" />

        {search && (
          <div className="bg-white border rounded-xl shadow">
            {filteredProducts.map((p, index) => (
              <div key={p.id}
                className={`p-3 cursor-pointer ${index === activeProductIndex ? "bg-blue-100" : ""}`}
                onClick={() => { addToCart(p); setSearch(""); }}>
                {p.name} ₹{p.price}
              </div>
            ))}
          </div>
        )}

        {/* CART TABLE */}
        <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
          {cart.length === 0
            ? <div className="p-6 text-center text-gray-400">No items in cart</div>
            : <table className="min-w-[650px] w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-4 text-left">Item</th>
                  <th className="p-4 text-center">Qty</th>
                  <th className="p-4 text-right">Price</th>
                  <th className="p-4 text-center">Disc%</th>
                  <th className="p-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.id} className="border-t">
                    <td className="p-4">
                      {item.name}
                      {Number(item.discount || 0) > 0 && (
                        <span className="ml-2 text-xs text-green-600 font-semibold">-{item.discount}%</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => decreaseQty(item.id)} className="bg-red-500 text-white w-7 h-7 rounded">-</button>
                        <span>{item.qty}</span>
                        <button onClick={() => increaseQty(item.id)} className="bg-green-500 text-white w-7 h-7 rounded">+</button>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      ₹ {item.price}
                      {Number(item.discount || 0) > 0 && (
                        <div className="text-xs text-green-600">₹ {(item.price * (1 - Number(item.discount) / 100)).toFixed(2)}</div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <input type="number" min="0" max="100" value={item.discount || ""} placeholder="0"
                        onChange={e => updateDiscount(item.id, Number(e.target.value || 0))}
                        className="border rounded p-1 w-16 text-center text-sm" />
                    </td>
                    <td className="p-4 text-right font-semibold">₹ {calcRow(item).toFixed(2)}</td>
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

          {branchId && branches.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4 text-sm text-blue-700 font-semibold">
              🏪 {branches.find(b => b.id === Number(branchId))?.name}
            </div>
          )}

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-lg">
              <span>Sub Total</span>
              <span>₹ {subTotal.toFixed(2)}</span>
            </div>

            <div className="flex gap-2 items-center">
              <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="border p-2 rounded-lg text-sm">
                <option value="percent">Discount %</option>
                <option value="flat">Flat ₹</option>
              </select>
              <input type="number" min="0" placeholder="0" value={discountValue}
                onChange={e => setDiscountValue(e.target.value)} className="border p-2 rounded-lg text-sm w-full" />
            </div>

            {billDiscountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>- ₹ {billDiscountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-lg text-orange-500">
              <span>Round Off</span>
              <span>₹ {roundOff.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-lg font-bold text-green-600">
              <span>Total</span>
              <span>₹ {roundedTotal.toFixed(2)}</span>
            </div>
          </div>

          <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="border p-3 w-full rounded-xl mb-4">
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
          </select>

          {paymentMode === "cash" && (
            <>
              <input placeholder="Amount Received" value={amountReceived}
                onChange={e => setAmountReceived(e.target.value)} className="border p-3 w-full rounded-xl mb-2" />
              <p className="text-right text-sm text-slate-500">Balance: ₹ {balance >= 0 ? balance : 0}</p>
            </>
          )}

          <button disabled={loading} onClick={createBill}
            className="bg-green-600 text-white p-4 w-full rounded-xl mt-4 font-semibold">
            {loading ? "Creating..." : "Generate Invoice"}
          </button>

        </div>
      </div>

    </div>
  );
}