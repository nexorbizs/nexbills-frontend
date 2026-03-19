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

  /* ================= STOCK UPDATE (NO RELOAD) ================= */

  const updateStock = async (id, change) => {
    try {

      await API.put(`/products/stock/${id}`, { change });

      setProducts(prev =>
        prev.map(p =>
          p.id === id
            ? { ...p, stock: p.stock + change }
            : p
        )
      );

    } catch {
      alert("Stock update failed");
    }
  };

  const deleteProduct = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const handleAdd = async () => {

    if(!form.name.trim()) return alert("Product name required");

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

    } catch {
      alert("Add product failed");
    }
  };

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">Product Inventory</h1>

      {/* ADD FORM */}

      <div className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-7 gap-3">

        {Object.keys(form).map(key => (
          <input
            key={key}
            placeholder={key.toUpperCase()}
            value={form[key]}
            onChange={e => setForm({ ...form, [key]: e.target.value })}
            className="border p-3 rounded-lg"
          />
        ))}

        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white rounded-lg"
        >
          ADD
        </button>

      </div>

      {/* TABLE */}

      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full min-w-[900px]">

          <thead className="bg-slate-100">
            <tr>
              <th className="p-3">Name</th>
              <th>SKU</th>
              <th>HSN</th>
              <th>Price</th>
              <th>Stock</th>
              <th>CGST</th>
              <th>SGST</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {products.map((p,index)=>(
              <tr key={p.id}
                className={`border-t ${index===activeIndex?"bg-blue-100":""}`}>

                <td className="p-3">{p.name}</td>
                <td>{p.sku}</td>
                <td>{p.hsn}</td>
                <td>₹ {p.price}</td>

                <td>
                  <div className="flex justify-center gap-2">

                    <button
                      onClick={()=>updateStock(p.id,-1)}
                      className="w-8 h-8 bg-red-500 text-white rounded"
                    >-</button>

                    <span>{p.stock}</span>

                    <button
                      onClick={()=>updateStock(p.id,1)}
                      className="w-8 h-8 bg-green-500 text-white rounded"
                    >+</button>

                  </div>
                </td>

                <td>{p.cgst}%</td>
                <td>{p.sgst}%</td>

                <td>
                  <button
                    onClick={()=>deleteProduct(p.id)}
                    className="bg-black text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}