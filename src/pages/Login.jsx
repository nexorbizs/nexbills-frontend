import { useState } from "react";
import logo from "../assets/NexBills Logo.png";
import API from "../api";

export default function Login({ setIsLoggedIn, goSignup }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  /* ================= VALIDATION ================= */

  const validate = () => {

    if (!email.trim())
      return alert("Email required");

    if (!/^\S+@\S+\.\S+$/.test(email))
      return alert("Invalid email");

    if (!password)
      return alert("Password required");

    if (password.length < 6)
      return alert("Password must be minimum 6 characters");

    return true;
  };

  /* ================= LOGIN ================= */

  const handleLogin = async () => {

    if (loading) return;

    if (!validate()) return;

    setLoading(true);

    try {

      const res = await API.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password
      });

      const { token, company } = res.data;

      /* ⭐ STORE SESSION */
      localStorage.setItem("token", token);
      localStorage.setItem("company", JSON.stringify(company));

      /* ⭐ LOGIN SUCCESS */
      setIsLoggedIn(true);

    } catch (err) {

      alert(err.response?.data?.message || "Login Failed");

      setLoading(false);
    }
  };

  /* ================= ENTER KEY ================= */

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black p-6">

      {/* PARTICLES */}
      <div className="absolute inset-0">
        {[...Array(60)].map((_, i) => (
          <span
            key={i}
            className="absolute bg-white rounded-full opacity-40"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animation: `particleMove ${10 + Math.random() * 20}s linear infinite`,
            }}
          />
        ))}
      </div>

      {/* GLOW */}
      <div className="absolute w-[700px] h-[700px] bg-indigo-500 rounded-full blur-[200px] opacity-20 top-[-200px] left-[-200px]" />
      <div className="absolute w-[600px] h-[600px] bg-purple-500 rounded-full blur-[180px] opacity-20 bottom-[-200px] right-[-200px]" />

      {/* CARD */}
      <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 w-full max-w-md p-8 md:p-10 rounded-3xl shadow-2xl text-white">

        <div className="mb-8 flex items-center justify-center gap-3">
          <img src={logo} className="w-14 h-14 bg-white rounded-full p-1" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              NexBills
            </h1>
            <p className="text-xs text-slate-300">
              powered by NexorBizs Technologies
            </p>
          </div>
        </div>

        <h2 className="text-lg md:text-xl font-semibold mb-6 text-center">
          Client Login
        </h2>

        <input
          placeholder="Client Email"
          autoFocus
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full border border-white/30 bg-white/10 p-3 rounded-xl mb-4 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full border border-white/30 bg-white/10 p-3 rounded-xl mb-6 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-semibold transition"
        >
          {loading ? "Logging in..." : "Login to NexBills"}
        </button>

        

      </div>
    </div>
  );
}