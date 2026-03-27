import { useState, useEffect } from "react";
import API from "../api";
import FeatureGate from "../components/FeatureGate";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CASHIER",
    branchIds: [],
  });

  // For editing branch assignment of existing user
  const [editingUser, setEditingUser] = useState(null); // user id
  const [editBranchIds, setEditBranchIds] = useState([]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [usersRes, branchRes] = await Promise.all([
        API.get("/users"),
        API.get("/branches"),
      ]);
      setUsers(usersRes.data || []);
      setBranches(branchRes.data || []);
    } catch {
      console.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // ── multi-select branch toggle ─────────────────────────────────────────────

  const toggleFormBranch = (id) => {
    setForm((prev) => ({
      ...prev,
      branchIds: prev.branchIds.includes(id)
        ? prev.branchIds.filter((b) => b !== id)
        : [...prev.branchIds, id],
    }));
  };

  const toggleEditBranch = (id) => {
    setEditBranchIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const createUser = async () => {
    if (!form.name || !form.email || !form.password) return alert("All fields required");
    try {
      const res = await API.post("/users", form);
      setUsers((prev) => [...prev, res.data]);
      setForm({ name: "", email: "", password: "", role: "CASHIER", branchIds: [] });
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    }
  };

  const saveUserBranches = async (id) => {
    try {
      const res = await API.put(`/users/${id}/branches`, { branchIds: editBranchIds });
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
      setEditingUser(null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update branches");
    }
  };

  const toggleUser = async (id) => {
    try {
      const res = await API.put(`/users/${id}/toggle`);
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await API.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    }
  };

  // ── helpers ───────────────────────────────────────────────────────────────

  const roleColor = (role) => {
    if (role === "OWNER") return "bg-purple-100 text-purple-700";
    if (role === "MANAGER") return "bg-blue-100 text-blue-700";
    return "bg-green-100 text-green-700";
  };

  const getBranchNames = (user) => {
    if (user.role === "OWNER") return <span className="text-purple-500 text-xs font-semibold">All Branches</span>;
    if (!user.branches || user.branches.length === 0)
      return <span className="text-slate-400 text-xs">Not assigned</span>;
    return (
      <div className="flex flex-wrap gap-1 justify-center">
        {user.branches.map((b) => (
          <span key={b.id} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
            {b.name}
          </span>
        ))}
      </div>
    );
  };

  if (loading) return <div className="p-6">Loading Users...</div>;

  return (
    <FeatureGate feature="staff_role_management">
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">User Management</h1>

      {/* ── ADD USER FORM ── */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Add Staff Account</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <input
            placeholder="Full Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-3 rounded-lg text-sm"
          />
          <input
            placeholder="Email *"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border p-3 rounded-lg text-sm"
          />
          <input
            type="password"
            placeholder="Password *"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border p-3 rounded-lg text-sm"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border p-3 rounded-lg text-sm"
          >
            <option value="CASHIER">Cashier</option>
            <option value="MANAGER">Manager</option>
          </select>
        </div>

        {/* Branch multi-select (skip for OWNER) */}
        {branches.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-slate-600 mb-2">
              Assign Branches{" "}
              <span className="text-slate-400 font-normal">(select one or more)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {branches.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => toggleFormBranch(b.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    form.branchIds.includes(b.id)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                  }`}
                >
                  🏪 {b.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={createUser}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 font-semibold w-full transition"
        >
          Add User
        </button>
      </div>

      {/* ── USERS TABLE ── */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-center">Role</th>
              <th className="p-3 text-center">Branches</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-slate-400">
                  No users found
                </td>
              </tr>
            )}
            {users.map((u) => (
              <>
                <tr key={u.id} className="border-t hover:bg-slate-50">
                  <td className="p-3 font-medium">{u.name || "-"}</td>
                  <td className="p-3 text-slate-500">{u.email}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${roleColor(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-center">{getBranchNames(u)}</td>
                  <td className="p-3 text-center">
                    <span className={`text-xs font-semibold ${u.isActive ? "text-green-600" : "text-red-500"}`}>
                      {u.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {u.role !== "OWNER" ? (
                      <div className="flex justify-center gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            setEditingUser(editingUser === u.id ? null : u.id);
                            setEditBranchIds(u.branches?.map((b) => b.id) || []);
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition"
                        >
                          {editingUser === u.id ? "Cancel" : "Branches"}
                        </button>
                        <button
                          onClick={() => toggleUser(u.id)}
                          className={`px-3 py-1 rounded text-xs text-white transition ${
                            u.isActive
                              ? "bg-orange-500 hover:bg-orange-600"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          {u.isActive ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">Owner</span>
                    )}
                  </td>
                </tr>

                {/* Inline branch editor */}
                {editingUser === u.id && (
                  <tr className="bg-blue-50 border-t">
                    <td colSpan="6" className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-700 mb-2">
                        Edit Branch Assignment for <span className="text-blue-700">{u.name}</span>
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {branches.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => toggleEditBranch(b.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                              editBranchIds.includes(b.id)
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                            }`}
                          >
                            🏪 {b.name}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => saveUserBranches(u.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        Save Branches
                      </button>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── ROLE GUIDE ── */}
      <div className="mt-6 bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold mb-3 text-slate-700">Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="font-semibold text-purple-700 mb-1">OWNER</p>
            <p className="text-slate-600">Full access to everything — sees all branches automatically</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="font-semibold text-blue-700 mb-1">MANAGER</p>
            <p className="text-slate-600">Billing, Products, Customers, Sales, Reports — assigned branches only</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
          <p className="font-semibold text-green-700 mb-1">CASHIER</p>
          <p className="text-slate-600">Billing, Customers — assigned branches only</p>
          </div>
        </div>
      </div>
    </div>
    </FeatureGate>
  );
}