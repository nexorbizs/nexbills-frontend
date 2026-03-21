import { useState } from "react";
import API from "../api";

export default function Admin() {

  const [secret, setSecret] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    companyId: "",
    plan: "basic",
    days: "30",
    maxUsers: "1",
    maxBranches: "1",
    notes: ""
  });

  /* ================= VERIFY ================= */

  const verify = async () => {
    if (!secret.trim()) return alert("Enter secret");
    setLoading(true);
    try {
      const res = await API.get(`/subscriptions/companies?secret=${secret}`);
      setCompanies(res.data);
      setAuthorized(true);
    } catch {
      alert("Invalid secret or unauthorized");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SET SUBSCRIPTION ================= */

  const setSubscription = async () => {
    if (!form.companyId) return alert("Select company");
    try {
      await API.post("/subscriptions/set", { ...form, secret });
      alert("Subscription updated!");
      loadCompanies();
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    }
  };

  /* ================= SUSPEND ================= */

  const suspendCompany = async (companyId) => {
    if (!window.confirm("Suspend this company?")) return;
    try {
      await API.post("/subscriptions/suspend", { companyId, secret });
      alert("Suspended!");
      loadCompanies();
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    }
  };

  /* ================= RELOAD COMPANIES ================= */

  const loadCompanies = async () => {
    try {
      const res = await API.get(`/subscriptions/companies?secret=${secret}`);
      setCompanies(res.data);
    } catch {
      alert("Failed to load companies");
    }
  };

  /* ================= STATUS COLOR ================= */

  const statusColor = (status) => {
    if (status === "active") return "text-green-600";
    if (status === "expired") return "text-red-500";
    if (status === "suspended") return "text-orange-500";
    return "text-slate-400";
  };

  const planColor = (plan) => {
    if (plan === "enterprise") return "bg-green-100 text-green-700";
    if (plan === "pro") return "bg-purple-100 text-purple-700";
    if (plan === "basic") return "bg-blue-100 text-blue-700";
    return "bg-yellow-100 text-yellow-700";
  };

  /* ================= SECRET SCREEN ================= */

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 w-full max-w-md text-white">
          <h1 className="text-2xl font-bold text-center mb-2">NexBills Admin</h1>
          <p className="text-slate-400 text-sm text-center mb-6">
            NexorBizs Technologies
          </p>
          <input
            type="password"
            placeholder="Admin Secret"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === "Enter" && verify()}
            className="border border-white/30 bg-white/10 p-3 w-full mb-4 rounded-xl text-white placeholder-white/50"
            autoFocus
          />
          <button
            onClick={verify}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full p-3 rounded-xl font-semibold"
          >
            {loading ? "Verifying..." : "Access Admin Panel"}
          </button>
        </div>
      </div>
    );
  }

  /* ================= ADMIN PANEL ================= */

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Admin Panel</h1>
            <p className="text-slate-500 text-sm">NexorBizs Technologies</p>
          </div>
          <button
            onClick={() => setAuthorized(false)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>

        {/* SET SUBSCRIPTION */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">

          <h2 className="text-lg font-bold mb-4">Set / Renew Subscription</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">

            <select
              value={form.companyId}
              onChange={e => setForm({ ...form, companyId: e.target.value })}
              className="border p-3 rounded-lg text-sm col-span-2"
            >
              <option value="">Select Company</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (#{c.id})
                </option>
              ))}
            </select>

            <select
              value={form.plan}
              onChange={e => setForm({ ...form, plan: e.target.value })}
              className="border p-3 rounded-lg text-sm"
            >
              <option value="trial">Trial</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <input
              placeholder="Days"
              type="number"
              value={form.days}
              onChange={e => setForm({ ...form, days: e.target.value })}
              className="border p-3 rounded-lg text-sm"
            />

            <input
              placeholder="Max Users"
              type="number"
              value={form.maxUsers}
              onChange={e => setForm({ ...form, maxUsers: e.target.value })}
              className="border p-3 rounded-lg text-sm"
            />

            <input
              placeholder="Max Branches"
              type="number"
              value={form.maxBranches}
              onChange={e => setForm({ ...form, maxBranches: e.target.value })}
              className="border p-3 rounded-lg text-sm"
            />

          </div>

          <div className="flex gap-3 mt-3">
            <input
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="border p-3 rounded-lg text-sm flex-1"
            />
            <button
              onClick={setSubscription}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-lg font-semibold"
            >
              Save
            </button>
          </div>

        </div>

        {/* COMPANIES TABLE */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">

          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold">All Companies ({companies.length})</h2>
            <button
              onClick={loadCompanies}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm"
            >
              Refresh
            </button>
          </div>

          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-center">Plan</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Expiry</th>
                <th className="p-3 text-center">Users</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-slate-400">
                    No companies found
                  </td>
                </tr>
              )}
              {companies.map(c => (
                <tr key={c.id} className="border-t hover:bg-slate-50">
                  <td className="p-3 text-slate-500">#{c.id}</td>
                  <td className="p-3 font-semibold">{c.name}</td>
                  <td className="p-3 text-slate-500">{c.email}</td>
                  <td className="p-3 text-center">
                    {c.subscription ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${planColor(c.subscription.plan)}`}>
                        {c.subscription.plan?.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">No Plan</span>
                    )}
                  </td>
                  <td className={`p-3 text-center font-semibold ${statusColor(c.subscription?.status)}`}>
                    {c.subscription?.status || "—"}
                  </td>
                  <td className="p-3 text-center text-slate-500">
                    {c.subscription?.expiryDate
                      ? new Date(c.subscription.expiryDate).toLocaleDateString("en-IN")
                      : "—"
                    }
                  </td>
                  <td className="p-3 text-center">
                    {c.subscription?.maxUsers || "—"}
                  </td>
                  <td className="p-3 text-center">
                    {c.subscription?.status !== "suspended" ? (
                      <button
                        onClick={() => suspendCompany(c.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setForm({ ...form, companyId: String(c.id), days: "30" });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Renew
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

      </div>

    </div>
  );
}