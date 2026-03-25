import { useState, useEffect } from "react";
import API from "../api";
import FeatureGate from "../components/FeatureGate";

export default function Suppliers() {

  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    gstin: ""
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const res = await API.get("/suppliers");
      setSuppliers(res.data || []);
    } catch {
      alert("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VALIDATION ================= */

  const validate = () => {
    if (!form.name.trim()) return alert("Supplier name required");
    if (form.phone.length < 6) return alert("Invalid phone number");
    if (!form.address.trim()) return alert("Address required");

    const duplicate = suppliers.find(s => s.phone === form.phone);
    if (duplicate) return alert(`Phone already exists for: ${duplicate.name}`);

    return true;
  };

  /* ================= ADD ================= */

  const addSupplier = async () => {
    if (!validate()) return;

    try {
      const res = await API.post("/suppliers", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        gstin: form.gstin.trim()
      });

      setSuppliers(prev => [res.data, ...prev]);
      setForm({ name: "", phone: "", address: "", gstin: "" });

    } catch (err) {
      alert(err.response?.data?.error || "Add failed");
    }
  };

  /* ================= DELETE ================= */

  const deleteSupplier = async (id) => {
    try {
      await API.delete(`/suppliers/${id}`);
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  /* ================= SEARCH ================= */

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search) ||
    (s.gstin || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return <div className="p-6">Loading Suppliers...</div>;

  return (
    <FeatureGate feature="supplier_management">
    <div>

      <h1 className="text-2xl md:text-3xl font-bold mb-6">Suppliers</h1>

      {/* ADD FORM */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <input
            placeholder="Supplier Name *"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="border p-3 rounded-lg text-sm"
          />
          <input
            placeholder="Phone *"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
            maxLength={15}
            className="border p-3 rounded-lg text-sm"
          />
          <input
            placeholder="Address *"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            className="border p-3 rounded-lg text-sm"
          />
          <input
            placeholder="GSTIN (optional)"
            value={form.gstin}
            onChange={e => setForm({ ...form, gstin: e.target.value })}
            className="border p-3 rounded-lg text-sm"
          />
        </div>
        <button
          onClick={addSupplier}
          className="mt-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 p-3 font-semibold transition w-full"
        >
          Add Supplier
        </button>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search Supplier"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="border p-3 rounded-lg w-full mb-4"
      />

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Address</th>
              <th className="p-3 text-left">GSTIN</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-400">
                  No suppliers found
                </td>
              </tr>
            )}
            {filtered.map(s => (
              <tr key={s.id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3 text-slate-500">{s.phone}</td>
                <td className="p-3 text-slate-500">{s.address}</td>
                <td className="p-3 text-slate-500">{s.gstin || "-"}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => deleteSupplier(s.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition"
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
    </FeatureGate>
  );
}