<<<<<<< HEAD
import { useState, useEffect } from "react";
import { useProductStore } from "../store/productStore";

export default function Products(){

  const { products, addProduct, deleteProduct, loadProducts, updateStock } = useProductStore();

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

  const validate = () => {

    if(!form.name.trim())
      return alert("Product name required");

    const currentUser =
      JSON.parse(localStorage.getItem("currentUser"));

    const all =
      JSON.parse(localStorage.getItem("products")) || [];

    if(all.find(p =>
      p.sku?.toUpperCase() === form.sku.toUpperCase()
      && p.companyId === currentUser.id
    ))
      return alert("SKU must be unique");

    if(all.find(p =>
      p.hsn?.toUpperCase() === form.hsn.toUpperCase()
      && p.companyId === currentUser.id
    ))
      return alert("HSN must be unique");

    if(Number(form.price) <= 0)
      return alert("Invalid price");

    if(Number(form.stock) < 0)
      return alert("Invalid stock");

    if(Number(form.cgst) > 50 || Number(form.sgst) > 50)
      return alert("Invalid GST");

    return true;
  };

  const handleAdd = () => {

    if(!validate()) return;

    const currentUser =
      JSON.parse(localStorage.getItem("currentUser"));

    addProduct({
      ...form,
      id: Date.now(),
      companyId: currentUser.id,
      sku: form.sku.toUpperCase(),
      hsn: form.hsn.toUpperCase(),
      price: Number(form.price),
      stock: Number(form.stock),
      cgst: Number(form.cgst),
      sgst: Number(form.sgst)
    });

    setForm({
      name: "",
      sku: "",
      hsn: "",
      price: "",
      stock: "",
      cgst: "",
      sgst: ""
    });
  };

  return (
    <div className="p-8">

      <h1 className="text-4xl font-bold mb-8">
        Product Inventory
      </h1>

      {/* FORM */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mb-8">

        <h2 className="text-xl font-semibold mb-4">
          Add New Product
        </h2>

        <div className="grid grid-cols-7 gap-4">

          <input
            placeholder="Product Name"
            value={form.name}
            onChange={e=>setForm({...form,name:e.target.value})}
            className="border p-3 rounded-xl"
          />

          <input
            placeholder="SKU"
            value={form.sku}
            onChange={e=>setForm({...form,sku:e.target.value})}
            className="border p-3 rounded-xl"
          />

          <input
            placeholder="HSN"
            value={form.hsn}
            onChange={e=>setForm({...form,hsn:e.target.value})}
            className="border p-3 rounded-xl"
          />

          <input
            placeholder="Price"
            value={form.price}
            onChange={e=>{
              const val = e.target.value;
              if(/^\d*\.?\d*$/.test(val))
                setForm({...form,price:val});
            }}
            className="border p-3 rounded-xl"
          />

          <input
            placeholder="Stock"
            value={form.stock}
            onChange={e=>{
              const val = e.target.value.replace(/\D/g,"");
              setForm({...form,stock:val});
            }}
            className="border p-3 rounded-xl"
          />

          <input
            placeholder="CGST %"
            value={form.cgst}
            onChange={e=>{
              const val = e.target.value.replace(/\D/g,"");
              setForm({...form,cgst:val});
            }}
            className="border p-3 rounded-xl"
          />

          <input
            placeholder="SGST %"
            value={form.sgst}
            onChange={e=>{
              const val = e.target.value.replace(/\D/g,"");
              setForm({...form,sgst:val});
            }}
            className="border p-3 rounded-xl"
          />

        </div>

        <button
          onClick={handleAdd}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold"
        >
          Add Product
        </button>

      </div>

      {/* TABLE */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4">SKU</th>
              <th className="p-4">HSN</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">CGST</th>
              <th className="p-4">SGST</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t hover:bg-slate-50">

                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-center">{p.sku}</td>
                <td className="p-4 text-center">{p.hsn}</td>
                <td className="p-4 text-center">₹ {p.price}</td>

                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">

                    <button
                      onClick={()=>updateStock(p.id,-1)}
                      className="px-3 py-1 bg-slate-200 rounded-lg"
                    >-</button>

                    <span className="font-bold">{p.stock}</span>

                    <button
                      onClick={()=>updateStock(p.id,1)}
                      className="px-3 py-1 bg-slate-200 rounded-lg"
                    >+</button>

                  </div>
                </td>

                <td className="p-4 text-center">{p.cgst}%</td>
                <td className="p-4 text-center">{p.sgst}%</td>

                <td className="p-4 text-center">
                  <button
                    onClick={()=>deleteProduct(p.id)}
                    className="text-red-500 hover:text-red-700 font-semibold"
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
=======
import { useState, useEffect } from "react";
import { useProductStore } from "../store/productStore";

export default function Products(){

  const { products, addProduct, deleteProduct, loadProducts, updateStock } = useProductStore();

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

  const validate = () => {

    if(!form.name.trim())
      return alert("Product name required");

    const currentUser =
      JSON.parse(localStorage.getItem("currentUser"));

    const all =
      JSON.parse(localStorage.getItem("products")) || [];

    if(all.find(p =>
      p.sku?.toUpperCase() === form.sku.toUpperCase()
      && p.companyId === currentUser.id
    ))
      return alert("SKU must be unique");

    if(all.find(p =>
      p.hsn?.toUpperCase() === form.hsn.toUpperCase()
      && p.companyId === currentUser.id
    ))
      return alert("HSN must be unique");

    if(Number(form.price) <= 0)
      return alert("Invalid price");

    if(Number(form.stock) < 0)
      return alert("Invalid stock");

    if(Number(form.cgst) > 50 || Number(form.sgst) > 50)
      return alert("Invalid GST");

    return true;
  };

  const handleAdd = () => {

    if(!validate()) return;

    const currentUser =
      JSON.parse(localStorage.getItem("currentUser"));

    addProduct({
      ...form,
      id: Date.now(),
      companyId: currentUser.id,
      sku: form.sku.toUpperCase(),
      hsn: form.hsn.toUpperCase(),
      price: Number(form.price),
      stock: Number(form.stock),
      cgst: Number(form.cgst),
      sgst: Number(form.sgst)
    });

    setForm({
      name: "",
      sku: "",
      hsn: "",
      price: "",
      stock: "",
      cgst: "",
      sgst: ""
    });
  };

  return (
    <div className="p-8">

      <h1 className="text-4xl font-bold mb-8">
        Product Inventory
      </h1>

      {/* FORM */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mb-8">

        <h2 className="text-xl font-semibold mb-4">
          Add New Product
        </h2>

        <div className="grid grid-cols-7 gap-4">

          <input
            placeholder="Product Name"
            value={form.name}
            onChange={e=>setForm({...form,name:e.target.value})}
            className="border p-3 rounded-xl"
          />

          <input
            placeholder="SKU"
            value={form.sku}
            onChange={e=>setForm({...form,sku:e.target.value})}
            className="border p-3 rounded-xl"
          />

          <input
            placeholder="HSN"
            value={form.hsn}
            onChange={e=>setForm({...form,hsn:e.target.value})}
            className="border p-3 rounded-xl"
          />

          <input
            placeholder="Price"
            value={form.price}
            onChange={e=>{
              const val = e.target.value;
              if(/^\d*\.?\d*$/.test(val))
                setForm({...form,price:val});
            }}
            className="border p-3 rounded-xl"
          />

          <input
            placeholder="Stock"
            value={form.stock}
            onChange={e=>{
              const val = e.target.value.replace(/\D/g,"");
              setForm({...form,stock:val});
            }}
            className="border p-3 rounded-xl"
          />

          <input
            placeholder="CGST %"
            value={form.cgst}
            onChange={e=>{
              const val = e.target.value.replace(/\D/g,"");
              setForm({...form,cgst:val});
            }}
            className="border p-3 rounded-xl"
          />

          <input
            placeholder="SGST %"
            value={form.sgst}
            onChange={e=>{
              const val = e.target.value.replace(/\D/g,"");
              setForm({...form,sgst:val});
            }}
            className="border p-3 rounded-xl"
          />

        </div>

        <button
          onClick={handleAdd}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold"
        >
          Add Product
        </button>

      </div>

      {/* TABLE */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4">SKU</th>
              <th className="p-4">HSN</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">CGST</th>
              <th className="p-4">SGST</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t hover:bg-slate-50">

                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-center">{p.sku}</td>
                <td className="p-4 text-center">{p.hsn}</td>
                <td className="p-4 text-center">₹ {p.price}</td>

                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">

                    <button
                      onClick={()=>updateStock(p.id,-1)}
                      className="px-3 py-1 bg-slate-200 rounded-lg"
                    >-</button>

                    <span className="font-bold">{p.stock}</span>

                    <button
                      onClick={()=>updateStock(p.id,1)}
                      className="px-3 py-1 bg-slate-200 rounded-lg"
                    >+</button>

                  </div>
                </td>

                <td className="p-4 text-center">{p.cgst}%</td>
                <td className="p-4 text-center">{p.sgst}%</td>

                <td className="p-4 text-center">
                  <button
                    onClick={()=>deleteProduct(p.id)}
                    className="text-red-500 hover:text-red-700 font-semibold"
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
>>>>>>> 479c1c5f3a0fe0426cba61fe2c2eecef4c23e0a9
}