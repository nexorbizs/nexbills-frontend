<<<<<<< HEAD
import { useState } from "react";

export default function Login({ setIsLoggedIn, goSignup }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      u => u.email === email && u.password === password
    );

    if(!user){
      alert("Invalid Email or Password");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));
    setIsLoggedIn(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">

      <div className="bg-white w-[420px] p-10 rounded-2xl shadow-2xl">

        {/* BRAND */}
        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold text-slate-900">
            NexBills
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            powered by NexorBizs Technologies
          </p>

        </div>

        {/* TITLE */}
        <h2 className="text-xl font-semibold mb-6 text-center">
          Client Login
        </h2>

        {/* EMAIL */}
        <input
          placeholder="Client Email"
          className="w-full border border-slate-300 p-3 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={e=>setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className="w-full border border-slate-300 p-3 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={e=>setPassword(e.target.value)}
        />

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-semibold transition"
        >
          Login to NexBills
        </button>
        <p
  onClick={goSignup}
  className="text-blue-600 text-sm mt-3 cursor-pointer"
>
  Create Client Account
</p>
      </div>

    </div>
  );
=======
import { useState } from "react";

export default function Login({ setIsLoggedIn, goSignup }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      u => u.email === email && u.password === password
    );

    if(!user){
      alert("Invalid Email or Password");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));
    setIsLoggedIn(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">

      <div className="bg-white w-[420px] p-10 rounded-2xl shadow-2xl">

        {/* BRAND */}
        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold text-slate-900">
            NexBills
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            powered by NexorBizs Technologies
          </p>

        </div>

        {/* TITLE */}
        <h2 className="text-xl font-semibold mb-6 text-center">
          Client Login
        </h2>

        {/* EMAIL */}
        <input
          placeholder="Client Email"
          className="w-full border border-slate-300 p-3 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={e=>setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className="w-full border border-slate-300 p-3 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={e=>setPassword(e.target.value)}
        />

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-semibold transition"
        >
          Login to NexBills
        </button>
        <p
  onClick={goSignup}
  className="text-blue-600 text-sm mt-3 cursor-pointer"
>
  Create Client Account
</p>
      </div>

    </div>
  );
>>>>>>> 479c1c5f3a0fe0426cba61fe2c2eecef4c23e0a9
}