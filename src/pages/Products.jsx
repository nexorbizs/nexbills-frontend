import { useState, useEffect } from "react";
import API from "../api";

export default function Products() {

  const [products, setProducts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [form, setForm] = useState({
    name: "", sku: "", hsn: "", barcode: "",
    price: "", stock: "", cgst: "", sgst: "", discount: ""
  });

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data || []);
    } catch {
      alert("Failed to load products");
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (editingId) return; // ⭐ skip keyboard nav when editing
      if (!products.length) return;
      const current = products[activeIndex];
      if (e.key === "ArrowRight") { e.preventDefault(); setActiveIndex(i => i < products.length - 1 ? i + 1 : 0); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); setActiveIndex(i => i > 0 ? i - 1 : products.length - 1); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); updateStock(current.id, 1); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); updateStock(current.id, -1); return; }
      if (e.key === "Enter") { e.preventDefault(); handleAdd(); return; }
      if (e.key === "Delete") { e.preventDefault(); deleteProduct(current.id); return; }
      if (e.key === "Escape") { setEditingId(null); return; }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [products, activeIndex, form, editingId]);

  const updateStock = async (id, change) => {
    try {
      const product = products.find(p => p.id === id);
      if (product && change < 0 && product.stock <= 0)
        return alert("Stock cannot go below 0");
      await API.put(`/products/stock/${id}`, { change });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: p.stock + change } : p));
    } catch (err) {
      alert(err.response?.data?.error || "Stock update failed");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await API.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return alert("Product name required");
    const discount = Number(form.discount || 0);
    if (discount < 0 || discount > 100) return alert("Discount must be between 0 and 100");
    try {
      const res = await API.post("/products", {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        cgst: Number(form.cgst || 0),
        sgst: Number(form.sgst || 0),
        discount
      });
      setProducts(prev => [res.data, ...prev]);
      setForm({ name: "", sku: "", hsn: "", barcode: "", price: "", stock: "", cgst: "", sgst: "", discount: "" });
    } catch (err) {
      alert(err.response?.data?.error || "Add product failed");
    }
  };

  // ⭐ START EDITING
  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      sku: p.sku,
      hsn: p.hsn,
      barcode: p.barcode || "",
      price: p.price,
      cgst: p.cgst,
      sgst: p.sgst,
      discount: p.discount || 0
    });
  };

  // ⭐ SAVE EDIT
  const saveEdit = async (id) => {
    if (!editForm.name.trim()) return alert("Product name required");
    try {
      const res = await API.put(`/products/${id}`, {
        name: editForm.name,
        sku: editForm.sku,
        hsn: editForm.hsn,
        barcode: editForm.barcode,
        price: Number(editForm.price),
        cgst: Number(editForm.cgst || 0),
        sgst: Number(editForm.sgst || 0),
        discount: Number(editForm.discount || 0)
      });
      setProducts(prev => prev.map(p => p.id === id ? res.data : p));
      setEditingId(null);
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    }
  };

  const formFields = [
    { key: "name",     placeholder: "NAME" },
    { key: "sku",      placeholder: "SKU" },
    { key: "hsn",      placeholder: "HSN" },
    { key: "barcode",  placeholder: "BARCODE (EAN/UPC)" },
    { key: "price",    placeholder: "PRICE" },
    { key: "stock",    placeholder: "STOCK" },
    { key: "cgst",     placeholder: "CGST %" },
    { key: "sgst",     placeholder: "SGST %" },
    { key: "discount", placeholder: "DISC %" },
  ];

  const editFields = ["name", "sku", "hsn", "barcode", "price", "cgst", "sgst", "discount"];

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Product Inventory</h1>

      {/* ADD FORM */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {formFields.map(f => (
            <input key={f.key} placeholder={f.placeholder} value={form[f.key]}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              className="border p-3 rounded-lg text-sm" />
          ))}
          <button onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 font-semibold transition">
            ADD
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">SKU</th>
              <th className="p-3 text-left">HSN</th>
              <th className="p-3 text-left">Barcode</th>
              <th className="p-3 text-right">Price</th>
              <th className="p-3 text-center">Stock</th>
              <th className="p-3 text-center">CGST</th>
              <th className="p-3 text-center">SGST</th>
              <th className="p-3 text-center">Disc%</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, index) => (
              <>
                <tr key={p.id}
                  className={`border-t ${editingId === p.id ? "bg-yellow-50" : index === activeIndex ? "bg-blue-100" : "hover:bg-slate-50"}`}>

                  {editingId === p.id ? (
                    // ⭐ EDIT MODE — inline inputs
                    <>
                      {editFields.map(field => (
                        <td key={field} className="p-2">
                          <input
                            value={editForm[field]}
                            onChange={e => setEditForm({ ...editForm, [field]: e.target.value })}
                            className="border p-2 rounded-lg text-sm w-full min-w-[70px]"
                          />
                        </td>
                      ))}
                      {/* Stock — read only during edit */}
                      <td className="p-2 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button onClick={() => updateStock(p.id, -1)} className="w-7 h-7 bg-red-500 text-white rounded text-xs">-</button>
                          <span className="w-8 text-center font-semibold">{p.stock}</span>
                          <button onClick={() => updateStock(p.id, 1)} className="w-7 h-7 bg-green-500 text-white rounded text-xs">+</button>
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => saveEdit(p.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-semibold">
                            Save
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="bg-slate-400 hover:bg-slate-500 text-white px-3 py-1 rounded text-xs">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // ⭐ VIEW MODE
                    <>
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3 text-slate-500">{p.sku}</td>
                      <td className="p-3 text-slate-500">{p.hsn}</td>
                      <td className="p-3 text-slate-500 font-mono text-xs">{p.barcode || "—"}</td>
                      <td className="p-3 text-right">₹ {p.price}</td>
                      <td className="p-3">
                        <div className="flex justify-center items-center gap-2">
                          <button onClick={() => updateStock(p.id, -1)} className="w-8 h-8 bg-red-500 text-white rounded">-</button>
                          <span className="w-8 text-center font-semibold">{p.stock}</span>
                          <button onClick={() => updateStock(p.id, 1)} className="w-8 h-8 bg-green-500 text-white rounded">+</button>
                        </div>
                      </td>
                      <td className="p-3 text-center">{p.cgst}%</td>
                      <td className="p-3 text-center">{p.sgst}%</td>
                      <td className="p-3 text-center">
                        {Number(p.discount || 0) > 0
                          ? <span className="text-green-600 font-semibold">{p.discount}%</span>
                          : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => startEdit(p)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition">
                            Edit
                          </button>
                          <button onClick={() => deleteProduct(p.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition">
                            Delete
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              </>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <div className="p-8 text-center text-slate-400">No products found</div>}
      </div>
    </div>
  );
}