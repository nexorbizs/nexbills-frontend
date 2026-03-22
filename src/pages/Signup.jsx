import { useState, useEffect } from "react";
import API from "../api";
import logo from "../assets/NexBills Logo.png";

const planDays = {
  trial: 7,
  basic: 30,
  pro: 180,
  enterprise: 365,
  lifetime: 36500
};

const planInfo = {
  trial:      { label: "Trial",      duration: "7 days",    users: 1,   branches: 1 },
  basic:      { label: "Basic",      duration: "30 days",   users: 3,   branches: 1 },
  pro:        { label: "Pro",        duration: "6 months",  users: 10,  branches: 3 },
  enterprise: { label: "Enterprise", duration: "12 months", users: 25,  branches: 10 },
  lifetime:   { label: "Lifetime ♾️", duration: "Permanent", users: 999, branches: 999 }
};

export default function Signup({ goLogin }) {

  const [codeInput, setCodeInput] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [form, setForm] = useState({
    company: "",
    email: "",
    password: "",
    plan: "trial"
  });

  /* ================= ENTER KEY ================= */

  useEffect(() => {
    const handleKey = (e) => {
      if (!authorized && e.key === "Enter") checkCode();
      if (authorized && e.key === "Enter") handleSignup();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [authorized, form, codeInput]);

  /* ================= VERIFY SECRET ================= */

  const checkCode = async () => {
    if (!codeInput.trim()) return alert("Enter secret code");
    setVerifying(true);
    try {
      const res = await API.post("/auth/verify-code", { code: codeInput });
      if (res.data.success) setAuthorized(true);
    } catch {
      alert("Invalid Secret Code");
    }
    setVerifying(false);
  };

  /* ================= VALIDATION ================= */

  const validate = () => {
    if (!form.company.trim()) return alert("Company name required");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return alert("Invalid email");
    if (form.password.length < 6) return alert("Password must be 6+ characters");
    return true;
  };

  /* ================= SIGNUP ================= */

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await API.post("/auth/signup", {
        name: form.company.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        secret: codeInput,
        plan: form.plan  // ⭐ send plan
      });
      alert(`Client account created ✅ — ${planInfo[form.plan].label} plan (${planInfo[form.plan].duration})`);
      setForm({ company: "", email: "", password: "", plan: "trial" });
      goLogin();
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
    setLoading(false);
  };

  /* ================= SECRET SCREEN ================= */

  if (!authorized) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-md text-white">
          <div className="flex flex-col items-center mb-6">
            <img src={logo} className="w-16 h-16 bg-white rounded-full p-1 mb-3" />
            <h1 className="text-xl font-bold">Admin Access</h1>
            <p className="text-slate-300 text-sm">Enter secure onboarding code</p>
          </div>
          <input
            type="password"
            placeholder="Secret Code"
            value={codeInput}
            autoFocus
            onChange={e => setCodeInput(e.target.value)}
            className="border border-white/30 bg-white/10 p-3 w-full mb-6 rounded-xl"
          />
          <button onClick={checkCode} disabled={verifying}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full p-3 rounded-xl font-semibold">
            {verifying ? "Verifying..." : "Verify Code"}
          </button>
        </div>
      </div>
    );
  }

  /* ================= SIGNUP SCREEN ================= */

  const selected = planInfo[form.plan];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-md text-white">

          <h2 className="text-xl font-bold mb-6 text-center">Create Client Account</h2>

          <input
            placeholder="Company Name"
            value={form.company}
            onChange={e => setForm({ ...form, company: e.target.value })}
            className="border border-white/30 bg-white/10 p-3 w-full mb-4 rounded-xl"
          />

          <input
            placeholder="Client Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="border border-white/30 bg-white/10 p-3 w-full mb-4 rounded-xl"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="border border-white/30 bg-white/10 p-3 w-full mb-4 rounded-xl"
          />

          {/* ⭐ PLAN SELECTOR */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-300 mb-2 block">Select Plan</label>
            <select
              value={form.plan}
              onChange={e => setForm({ ...form, plan: e.target.value })}
              className="border border-white/30 bg-white/10 p-3 w-full rounded-xl text-white"
            >
              <option value="trial" className="text-black">Trial (7 days)</option>
              <option value="basic" className="text-black">Basic (30 days)</option>
              <option value="pro" className="text-black">Pro (6 months)</option>
              <option value="enterprise" className="text-black">Enterprise (12 months)</option>
              <option value="lifetime" className="text-black">Lifetime ♾️ (Permanent)</option>
            </select>
          </div>

          {/* ⭐ PLAN DETAILS */}
          <div className="bg-white/10 border border-white/20 rounded-xl p-3 mb-6 text-sm grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-slate-400 text-xs">Duration</p>
              <p className="font-semibold">{selected.duration}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Max Users</p>
              <p className="font-semibold">{selected.users === 999 ? "Unlimited" : selected.users}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Max Branches</p>
              <p className="font-semibold">{selected.branches === 999 ? "Unlimited" : selected.branches}</p>
            </div>
          </div>

          <button onClick={handleSignup} disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full p-3 rounded-xl font-semibold">
            {loading ? "Creating..." : `Create Client — ${selected.label}`}
          </button>

          <p onClick={goLogin} className="text-indigo-300 text-sm mt-4 cursor-pointer text-center">
            Back to Login
          </p>

        </div>
      </div>
    </div>
  );
}