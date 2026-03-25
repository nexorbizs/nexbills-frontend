import { useEffect, useState } from "react";
import API from "../api";
import FeatureGate from "../components/FeatureGate";

const MODULE_COLORS = {
  SALE:     "bg-green-100 text-green-700",
  PRODUCT:  "bg-blue-100 text-blue-700",
  CUSTOMER: "bg-amber-100 text-amber-700",
  PURCHASE: "bg-purple-100 text-purple-700",
};

const ACTION_COLORS = {
  CREATED: "text-green-600",
  UPDATED: "text-blue-600",
  DELETED: "text-red-500",
};

const ACTION_ICONS = {
  CREATED: "✅",
  UPDATED: "✏️",
  DELETED: "🗑️",
};

export default function Activity() {
  const [logs, setLogs] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    branchId: "",
    module: "",
    from: "",
    to: "",
    limit: "100"
  });

  useEffect(() => {
    loadBranches();
    loadLogs();
  }, []);

  const loadBranches = async () => {
    try {
      const res = await API.get("/branches");
      setBranches(res.data || []);
    } catch {
      console.log("branch load fail");
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.branchId) params.append("branchId", filters.branchId);
      if (filters.module)   params.append("module", filters.module);
      if (filters.from)     params.append("from", new Date(filters.from).toISOString());
      if (filters.to)       params.append("to", new Date(filters.to + "T23:59:59").toISOString());
      if (filters.limit)    params.append("limit", filters.limit);

      const res = await API.get(`/activity?${params.toString()}`);
      setLogs(res.data || []);
    } catch {
      alert("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dt) => {
    const d = new Date(dt);
    return d.toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true
    });
  };

  return (
    <FeatureGate feature="activity_log"> 
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Activity Log 📋</h1>

      {/* ── FILTERS ── */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Branch</label>
            <select value={filters.branchId}
              onChange={e => setFilters({ ...filters, branchId: e.target.value })}
              className="border p-2 rounded-lg text-sm">
              <option value="">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Module</label>
            <select value={filters.module}
              onChange={e => setFilters({ ...filters, module: e.target.value })}
              className="border p-2 rounded-lg text-sm">
              <option value="">All Modules</option>
              <option value="SALE">Sale</option>
              <option value="PRODUCT">Product</option>
              <option value="CUSTOMER">Customer</option>
              <option value="PURCHASE">Purchase</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">From</label>
            <input type="date" value={filters.from}
              onChange={e => setFilters({ ...filters, from: e.target.value })}
              className="border p-2 rounded-lg text-sm" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">To</label>
            <input type="date" value={filters.to}
              onChange={e => setFilters({ ...filters, to: e.target.value })}
              className="border p-2 rounded-lg text-sm" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Show</label>
            <select value={filters.limit}
              onChange={e => setFilters({ ...filters, limit: e.target.value })}
              className="border p-2 rounded-lg text-sm">
              <option value="50">Last 50</option>
              <option value="100">Last 100</option>
              <option value="250">Last 250</option>
              <option value="500">Last 500</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <button onClick={loadLogs}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-sm font-semibold">
              Apply Filter
            </button>
          </div>

        </div>
      </div>

      {/* ── SUMMARY BADGES ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {["SALE", "PRODUCT", "CUSTOMER", "PURCHASE"].map(mod => (
          <div key={mod} className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${MODULE_COLORS[mod]}`}>
              {mod}
            </span>
            <span className="text-xl font-bold">
              {logs.filter(l => l.module === mod).length}
            </span>
          </div>
        ))}
      </div>

      {/* ── LOGS TABLE ── */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-slate-700">
            {logs.length} Activities
          </h2>
          <button onClick={loadLogs}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-sm">
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No activity found</div>
        ) : (
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Branch</th>
                <th className="p-3 text-center">Module</th>
                <th className="p-3 text-center">Action</th>
                <th className="p-3 text-left">Summary</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-t hover:bg-slate-50">
                  <td className="p-3 text-slate-400 text-xs whitespace-nowrap">
                    {formatTime(log.createdAt)}
                  </td>
                  <td className="p-3 font-medium text-slate-700">
                    {log.userName || "—"}
                  </td>
                  <td className="p-3 text-slate-500 text-xs">
                    {log.branchName || "—"}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${MODULE_COLORS[log.module] || "bg-slate-100 text-slate-600"}`}>
                      {log.module}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-xs font-bold ${ACTION_COLORS[log.action] || "text-slate-500"}`}>
                      {ACTION_ICONS[log.action]} {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{log.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </FeatureGate>
  );
}