import { useState, useEffect } from "react";
import API from "../api";

export default function Branches() {

  const [branches, setBranches] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [branchRes, statsRes] = await Promise.all([
        API.get("/branches"),
        API.get("/branches/dashboard")
      ]);
      setBranches(branchRes.data || []);
      setStats(statsRes.data || []);
    } catch {
      alert("Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD BRANCH ================= */
  const addBranch = async () => {
    if (!form.name.trim()) return alert("Branch name required");
    try {
      const res = await API.post("/branches", form);
      setBranches(prev => [...prev, res.data]);
      setForm({ name: "", address: "", phone: "" });
      loadAll();
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    }
  };

  /* ================= UPDATE BRANCH ================= */
  const updateBranch = async (id) => {
    try {
      const res = await API.put(`/branches/${id}`, editForm);
      setBranches(prev => prev.map(b => b.id === id ? res.data : b));
      setEditId(null);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    }
  };

  /* ================= DELETE BRANCH ================= */
  const deleteBranch = async (id) => {
    if (!window.confirm("Delete this branch?")) return;
    try {
      await API.delete(`/branches/${id}`);
      setBranches(prev => prev.filter(b => b.id !== id));
      loadAll();
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    }
  };

  if (loading) return <div className="p-6">Loading Branches...</div>;

  return (
    <div>

      <h1 className="text-2xl md:text-3xl font-bold mb-6">Branch Management</h1>

      {/* BRANCH STATS */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {stats.map(s => (
            <div key={s.id} className={`bg-white p-5 rounded-xl shadow border-l-4 ${s.isActive ? "border-green-500" : "border-slate-300"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{s.name}</h3>
                  <p className="text-slate-500 text-sm">{s.address || "No address"}</p>
                  {s.phone && <p className="text-slate-400 text-xs">{s.phone}</p>}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${s.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                  {s.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2 rounded-lg text-center">
                  <p className="text-xs text-slate-500">Revenue</p>
                  <p className="font-bold text-sm">₹ {Number(s.totalSales).toLocaleString("en-IN")}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg text-center">
                  <p className="text-xs text-slate-500">Invoices</p>
                  <p className="font-bold text-sm">{s.totalInvoices}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD BRANCH FORM */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Branch</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <input
            placeholder="Branch Name *"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="border p-3 rounded-lg text-sm"
          />
          <input
            placeholder="Address"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            className="border p-3 rounded-lg text-sm"
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            className="border p-3 rounded-lg text-sm"
          />
        </div>
        <button
          onClick={addBranch}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 font-semibold w-full transition"
        >
          Add Branch
        </button>
      </div>

      {/* BRANCHES TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Branch Name</th>
              <th className="p-3 text-left">Address</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {branches.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-400">
                  No branches found — add your first branch!
                </td>
              </tr>
            )}
            {branches.map(b => (
              <tr key={b.id} className="border-t hover:bg-slate-50">
                {editId === b.id ? (
                  <>
                    <td className="p-2">
                      <input value={editForm.name || ""}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        className="border p-2 rounded text-sm w-full" />
                    </td>
                    <td className="p-2">
                      <input value={editForm.address || ""}
                        onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                        className="border p-2 rounded text-sm w-full" />
                    </td>
                    <td className="p-2">
                      <input value={editForm.phone || ""}
                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                        className="border p-2 rounded text-sm w-full" />
                    </td>
                    <td className="p-2 text-center">
                      <select value={editForm.isActive}
                        onChange={e => setEditForm({ ...editForm, isActive: e.target.value === "true" })}
                        className="border p-2 rounded text-sm">
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </td>
                    <td className="p-2 text-center flex gap-2 justify-center">
                      <button onClick={() => updateBranch(b.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-xs">Save</button>
                      <button onClick={() => setEditId(null)}
                        className="bg-slate-400 text-white px-3 py-1 rounded text-xs">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-3 font-medium">{b.name}</td>
                    <td className="p-3 text-slate-500">{b.address || "-"}</td>
                    <td className="p-3 text-slate-500">{b.phone || "-"}</td>
                    <td className="p-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${b.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {b.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3 text-center flex gap-2 justify-center">
                      <button
                        onClick={() => { setEditId(b.id); setEditForm({ name: b.name, address: b.address, phone: b.phone, isActive: b.isActive }); }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs">
                        Edit
                      </button>
                      <button onClick={() => deleteBranch(b.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}