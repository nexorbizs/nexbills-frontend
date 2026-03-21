import { useState, useEffect } from "react";
import API from "../api";

export default function Products(){

  const [products, setProducts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    hsn: "",
    price: "",
    stock: "",
    cgst: "",
    sgst: ""
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data || []);
    } catch {
      alert("Failed to load products");
    }
  };

  /* ================= KEYBOARD POS ================= */

  useEffect(() => {

    const handleKey = (e) => {

      if (!products.length) return;

      const current = products[activeIndex];

      // ⭐ CHANGE ROW
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActiveIndex(i => i < products.length - 1 ? i + 1 : 0);
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveIndex(i => i > 0 ? i - 1 : products.length - 1);
        return;
      }

      // ⭐ STOCK CONTROL
      if (e.key === "ArrowUp") {
        e.preventDefault();
        updateStock(current.id, 1);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        updateStock(current.id, -1);
        return;
      }

      // ⭐ ADD PRODUCT (ENTER)
      if (e.key === "Enter") {
        e.preventDefault();
        handleAdd();
        return;
      }

      // ⭐ DELETE
      if (e.key === "Delete") {
        e.preventDefault();
        deleteProduct(current.id);
        return;
      }

    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);

  }, [products, activeIndex, form]);

  /* ================= STOCK UPDATE ================= */

  const updateStock = async (id, change) => {
    try {

      // ⭐ PREVENT NEGATIVE STOCK
      const product = products.find(p => p.id === id);
      if (product && product.stock + change < 0)
        return alert("Stock cannot go below 0");

      await API.put(`/products/stock/${id}`, { change });

      setProducts(prev =>
        prev.map(p =>
          p.id === id
            ? { ...p, stock: p.stock + change }
            : p
        )
      );

    } catch (err) {
      alert(err.response?.data?.error || "Stock update failed");
    }
  };

  /* ================= DELETE ================= */

  const deleteProduct = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  /* ================= ADD ================= */

  const handleAdd = async () => {

    if (!form.name.trim()) return alert("Product name required");

    try {

      const res = await API.post("/products", {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        cgst: Number(form.cgst || 0),
        sgst: Number(form.sgst || 0)
      });

      setProducts(prev => [res.data, ...prev]);

      setForm({
        name: "",
        sku: "",
        hsn: "",
        price: "",
        stock: "",
        cgst: "",
        sgst: ""
      });

    } catch (err) {
      alert(err.response?.data?.error || "Add product failed");
    }
  };

  return (
    <div>

      <h1 className="text-2xl md:text-3xl font-bold mb-6">Product Inventory</h1>

      {/* ADD FORM */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">

          {Object.keys(form).map(key => (
            <input
              key={key}
              placeholder={key.toUpperCase()}
              value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              className="border p-3 rounded-lg text-sm"
            />
          ))}

          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 font-semibold transition"
          >
            ADD
          </button>

        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full min-w-[700px] text-sm">

          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">SKU</th>
              <th className="p-3 text-left">HSN</th>
              <th className="p-3 text-right">Price</th>
              <th className="p-3 text-center">Stock</th>
              <th className="p-3 text-center">CGST</th>
              <th className="p-3 text-center">SGST</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>

            {products.map((p, index) => (
              <tr
                key={p.id}
                className={`border-t ${index === activeIndex ? "bg-blue-100" : "hover:bg-slate-50"}`}
              >

                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-slate-500">{p.sku}</td>
                <td className="p-3 text-slate-500">{p.hsn}</td>
                <td className="p-3 text-right">₹ {p.price}</td>

                <td className="p-3">
                  <div className="flex justify-center items-center gap-2">

                    <button
                      onClick={() => updateStock(p.id, -1)}
                      className="w-8 h-8 bg-red-500 text-white rounded"
                    >-</button>

                    <span className="w-8 text-center font-semibold">{p.stock}</span>

                    <button
                      onClick={() => updateStock(p.id, 1)}
                      className="w-8 h-8 bg-green-500 text-white rounded"
                    >+</button>

                  </div>
                </td>

                <td className="p-3 text-center">{p.cgst}%</td>
                <td className="p-3 text-center">{p.sgst}%</td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition"
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

        {products.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            No products found
          </div>
        )}

      </div>

    </div>
  );
}