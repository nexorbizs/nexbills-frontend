import { useState } from "react";
import API from "../api";

const planDays = {
  trial: 7,
  basic: 30,
  pro: 180,
  enterprise: 365,
  lifetime: 36500
};

// ⭐ NEW
const FEATURE_LABELS = {
  purchase_management: "Purchase Management",
  supplier_management: "Supplier Management",
  multi_branch: "Multi-Branch Dashboard",
  reports: "Sales & Purchase Reports",
  profit_loss_report: "Profit & Loss Report",
  activity_log: "Activity Log",
  staff_role_management: "Staff Role Management",
};

// ⭐ NEW — base plan defaults (mirror of planFeatures.js)
const PLAN_FEATURES = {
  trial:      { purchase_management: false, supplier_management: false, multi_branch: false, reports: false, profit_loss_report: false, activity_log: false, staff_role_management: false },
  basic:      { purchase_management: false, supplier_management: false, multi_branch: false, reports: false, profit_loss_report: false, activity_log: false, staff_role_management: false },
  pro:        { purchase_management: false, supplier_management: false, multi_branch: true,  reports: true,  profit_loss_report: true,  activity_log: true,  staff_role_management: true  },
  enterprise: { purchase_management: true,  supplier_management: true,  multi_branch: true,  reports: true,  profit_loss_report: true,  activity_log: true,  staff_role_management: true  },
  lifetime:   { purchase_management: true,  supplier_management: true,  multi_branch: true,  reports: true,  profit_loss_report: true,  activity_log: true,  staff_role_management: true  },
};

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

  // ⭐ NEW state for feature control
  const [featureCompanyId, setFeatureCompanyId] = useState("");
  const [featureOverrides, setFeatureOverrides] = useState({});
  const [featureSaving, setFeatureSaving] = useState(false);

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

  /* ================= LOAD COMPANIES ================= */

  const loadCompanies = async () => {
    try {
      const res = await API.get(`/subscriptions/companies?secret=${secret}`);
      setCompanies(res.data);
    } catch {
      alert("Failed to load companies");
    }
  };

  /* ================= SET SUBSCRIPTION ================= */

  const setSubscription = async () => {
    if (!form.companyId) return alert("Select company");
    try {
      await API.post("/subscriptions/set", { ...form, secret });
      alert("Subscription updated!");
      await loadCompanies();
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
      await loadCompanies();
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    }
  };

  /* ================= UNSUSPEND ================= */

  const unsuspendCompany = async (companyId) => {
    if (!window.confirm("Reactivate this company?")) return;
    try {
      await API.post("/subscriptions/unsuspend", { companyId, secret });
      alert("Reactivated!");
      await loadCompanies();
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    }
  };

  /* ================= EXTEND ================= */

  const extendDays = async (companyId, days) => {
    if (!window.confirm(`Extend by ${days} days?`)) return;
    try {
      await API.post("/subscriptions/extend", { companyId, days, secret });
      alert(`Extended by ${days} days!`);
      await loadCompanies();
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    }
  };

  // ⭐ NEW — load company's current features when selected
  const loadCompanyFeatures = (companyId) => {
    setFeatureCompanyId(companyId);
    if (!companyId) { setFeatureOverrides({}); return; }
    const company = companies.find(c => c.id === Number(companyId));
    if (!company) return;
    const plan = company.subscription?.plan || "basic";
    const base = PLAN_FEATURES[plan] || PLAN_FEATURES["basic"];
    const dbOverrides = company.subscription?.features || {};
    setFeatureOverrides({ ...base, ...dbOverrides });
  };

  // ⭐ NEW — save feature overrides to DB
  const saveFeatures = async () => {
    if (!featureCompanyId) return alert("Select a company");
    setFeatureSaving(true);
    try {
      await API.post("/subscriptions/set-features", {
        companyId: featureCompanyId,
        features: featureOverrides,
        secret,
      });
      alert("Features updated!");
      loadCompanies();
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    } finally {
      setFeatureSaving(false);
    }
  };

  /* ================= HELPERS ================= */

  const statusColor = (status) => {
    if (status === "active") return "text-green-600";
    if (status === "expired") return "text-red-500";
    if (status === "suspended") return "text-orange-500";
    return "text-slate-400";
  };

  const planColor = (plan) => {
    if (plan === "lifetime") return "bg-slate-800 text-white";
    if (plan === "enterprise") return "bg-green-100 text-green-700";
    if (plan === "pro") return "bg-purple-100 text-purple-700";
    if (plan === "basic") return "bg-blue-100 text-blue-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const rowBg = (c) => {
    if (c.subscription?.status === "suspended") return "bg-orange-50";
    if (c.subscription?.plan === "lifetime") return "";
    if (c.daysLeft !== null && c.daysLeft <= 0) return "bg-red-100";
    if (c.daysLeft !== null && c.daysLeft <= 7) return "bg-red-50";
    return "";
  };

  /* ================= SECRET SCREEN ================= */

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 w-full max-w-md text-white">
          <h1 className="text-2xl font-bold text-center mb-2">NexBills Admin</h1>
          <p className="text-slate-400 text-sm text-center mb-6">NexorBizs Technologies</p>
          <input
            type="password"
            placeholder="Admin Secret"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === "Enter" && verify()}
            className="border border-white/30 bg-white/10 p-3 w-full mb-4 rounded-xl text-white placeholder-white/50"
            autoFocus
          />
          <button onClick={verify} disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full p-3 rounded-xl font-semibold">
            {loading ? "Verifying..." : "Access Admin Panel"}
          </button>
        </div>
      </div>
    );
  }

  /* ================= ADMIN PANEL ================= */

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Admin Panel</h1>
            <p className="text-slate-500 text-sm">NexorBizs Technologies</p>
          </div>
          <button onClick={() => setAuthorized(false)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">
            Logout
          </button>
        </div>

        {/* STATS SUMMARY */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-slate-400 text-sm">Total Companies</p>
            <p className="text-2xl font-bold">{companies.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-slate-400 text-sm">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {companies.filter(c => c.subscription?.status === "active").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-slate-400 text-sm">Suspended</p>
            <p className="text-2xl font-bold text-orange-500">
              {companies.filter(c => c.subscription?.status === "suspended").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-slate-400 text-sm">Expiring Soon</p>
            <p className="text-2xl font-bold text-red-500">
              {companies.filter(c =>
                c.subscription?.plan !== "lifetime" &&
                c.daysLeft !== null &&
                c.daysLeft <= 7 &&
                c.daysLeft > 0
              ).length}
            </p>
          </div>
        </div>

        {/* SET SUBSCRIPTION */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Set / Renew Subscription</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Company</label>
              <select value={form.companyId}
                onChange={e => setForm({ ...form, companyId: e.target.value })}
                className="border p-3 rounded-lg text-sm">
                <option value="">Select Company</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name} (#{c.id})</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Plan</label>
              <select value={form.plan}
                onChange={e => setForm({ ...form, plan: e.target.value, days: planDays[e.target.value] || 30 })}
                className="border p-3 rounded-lg text-sm">
                <option value="trial">Trial (7 days)</option>
                <option value="basic">Basic (30 days)</option>
                <option value="pro">Pro (6 months)</option>
                <option value="enterprise">Enterprise (12 months)</option>
                <option value="lifetime">Lifetime ♾️ (Permanent)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">
                Days {form.plan === "lifetime" ? "(Permanent)" : "(auto-filled)"}
              </label>
              <input type="number" value={form.days}
                onChange={e => setForm({ ...form, days: e.target.value })}
                disabled={form.plan === "lifetime"}
                className={`border p-3 rounded-lg text-sm ${form.plan === "lifetime" ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-white"}`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Max Users</label>
              <input type="number" placeholder="e.g. 5" value={form.maxUsers}
                onChange={e => setForm({ ...form, maxUsers: e.target.value })}
                className="border p-3 rounded-lg text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Max Branches</label>
              <input type="number" placeholder="e.g. 2" value={form.maxBranches}
                onChange={e => setForm({ ...form, maxBranches: e.target.value })}
                className="border p-3 rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex gap-3 mt-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-semibold text-slate-500">Notes (optional)</label>
              <input placeholder="e.g. Paid via UPI" value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="border p-3 rounded-lg text-sm" />
            </div>
            <div className="flex flex-col justify-end">
              <button onClick={setSubscription}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold">
                Save
              </button>
            </div>
          </div>
        </div>

        {/* ⭐ NEW — FEATURE CONTROL */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Feature Control</h2>

          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-500 block mb-1">Select Company</label>
            <select
              className="border p-3 rounded-lg text-sm w-full max-w-sm"
              value={featureCompanyId}
              onChange={e => loadCompanyFeatures(e.target.value)}
            >
              <option value="">-- Select Company --</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.subscription?.plan || "no plan"}
                </option>
              ))}
            </select>
          </div>

          {featureCompanyId && (
            <>
              <p className="text-xs text-slate-400 mb-3">
                Click any feature to toggle ON / OFF. Changes are saved when you click Save.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {Object.entries(FEATURE_LABELS).map(([key, label]) => (
                  <div
                    key={key}
                    onClick={() => setFeatureOverrides(prev => ({ ...prev, [key]: !prev[key] }))}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition select-none ${
                      featureOverrides[key]
                        ? "bg-green-50 border-green-400"
                        : "bg-red-50 border-red-300"
                    }`}
                  >
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                    <span className={`text-xs font-bold ${featureOverrides[key] ? "text-green-600" : "text-red-500"}`}>
                      {featureOverrides[key] ? "ON ✓" : "OFF ✗"}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={saveFeatures}
                disabled={featureSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                {featureSaving ? "Saving..." : "Save Features"}
              </button>
            </>
          )}
        </div>

        {/* COMPANIES TABLE */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold">All Companies ({companies.length})</h2>
            <button onClick={loadCompanies}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm">
              Refresh
            </button>
          </div>
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-center">Plan</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Expiry</th>
                <th className="p-3 text-center">Days Left</th>
                <th className="p-3 text-center">Users</th>
                <th className="p-3 text-center">Branches</th>
                <th className="p-3 text-center">Sales</th>
                <th className="p-3 text-center">Notes</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 && (
                <tr>
                  <td colSpan="12" className="p-6 text-center text-slate-400">No companies found</td>
                </tr>
              )}
              {companies.map(c => (
                <tr key={c.id} className={`border-t hover:bg-slate-50 ${rowBg(c)}`}>
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
                    {c.subscription?.plan === "lifetime"
                      ? "♾️ Permanent"
                      : c.subscription?.expiryDate
                        ? new Date(c.subscription.expiryDate).toLocaleDateString("en-IN")
                        : "—"}
                  </td>
                  <td className="p-3 text-center">
                    {c.subscription?.plan === "lifetime" ? (
                      <span className="font-semibold text-xs text-slate-700">♾️</span>
                    ) : c.daysLeft !== null ? (
                      <span className={`font-semibold text-xs ${
                        c.daysLeft <= 0 ? "text-red-600" :
                        c.daysLeft <= 7 ? "text-orange-500" :
                        "text-green-600"
                      }`}>
                        {c.daysLeft <= 0 ? "Expired" : `${c.daysLeft}d`}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="p-3 text-center text-slate-600">{c.userCount ?? "—"} / {c.subscription?.maxUsers ?? "—"}</td>
                  <td className="p-3 text-center text-slate-600">{c.branchCount ?? "—"} / {c.subscription?.maxBranches ?? "—"}</td>
                  <td className="p-3 text-center text-slate-600">{c.salesCount ?? "—"}</td>
                  <td className="p-3 text-center text-slate-400 text-xs max-w-[120px] truncate">
                    {c.subscription?.notes || "—"}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-1 flex-wrap">
                      {c.subscription && c.subscription.plan !== "lifetime" && (
                        <>
                          <button onClick={() => extendDays(c.id, 30)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs">
                            +30d
                          </button>
                          <button onClick={() => extendDays(c.id, 90)}
                            className="bg-blue-700 hover:bg-blue-800 text-white px-2 py-1 rounded text-xs">
                            +90d
                          </button>
                        </>
                      )}
                      {c.subscription?.status !== "suspended" ? (
                        <button onClick={() => suspendCompany(c.id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs">
                          Suspend
                        </button>
                      ) : (
                        <button onClick={() => unsuspendCompany(c.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs">
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* LEGEND */}
        <div className="mt-4 flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 inline-block" /> Expired</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-50 inline-block" /> Expiring ≤ 7 days</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-50 inline-block" /> Suspended</span>
        </div>

      </div>
    </div>
  );
}