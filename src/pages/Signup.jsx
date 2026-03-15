import { useState } from "react";

export default function Signup({goLogin}) {

  // ⭐ CHANGE THIS SECRET CODE
  const SECRET_CODE = "2002";

  const [codeInput, setCodeInput] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const [form, setForm] = useState({
    company: "",
    email: "",
    password: ""
  });

  const checkCode = () => {

    if (codeInput === SECRET_CODE) {
      setAuthorized(true);
    } else {
      alert("Invalid Secret Code");
    }

  };

  const handleSignup = () => {

    if (!form.company || !form.email || !form.password) {
      alert("Fill all fields");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.find(u => u.email === form.email);

    if (exists) {
      alert("Client already exists");
      return;
    }

    const newUser = {
      id: Date.now(),
      company: form.company,
      email: form.email,
      password: form.password
    };

    localStorage.setItem("users", JSON.stringify([...users, newUser]));

    alert("Client account created ✅");

    setForm({
      company: "",
      email: "",
      password: ""
    });
  };

  // ⭐ SECRET CODE SCREEN
  if (!authorized) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100">

        <div className="bg-white shadow-xl rounded-2xl p-10 w-[420px]">

          <h1 className="text-2xl font-bold mb-4">
            NexBills Admin Access
          </h1>

          <p className="text-gray-500 mb-6">
            Enter secure onboarding code
          </p>

          <input
            type="password"
            placeholder="Secret Code"
            value={codeInput}
            onChange={e =>
              setCodeInput(e.target.value.replace(/\D/g, ""))
            }
            className="border p-3 w-full mb-6 rounded-lg"
          />

          <button
            onClick={checkCode}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full p-3 rounded-lg font-semibold"
          >
            Verify Code
          </button>

        </div>

      </div>
    );
  }

  // ⭐ CLIENT ONBOARDING SCREEN
  return (
    <div className="h-screen flex bg-slate-100">

      {/* LEFT BRAND */}
      <div className="w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col justify-center p-16">

        <h1 className="text-4xl font-bold mb-2">
          NexBills
        </h1>

        <p className="text-slate-400 mb-6">
          powered by NexorBizs Technologies
        </p>

        <p className="text-slate-300 text-lg max-w-md">
          Internal client onboarding console.
          Create new business accounts securely.
        </p>

      </div>

      {/* FORM */}
      <div className="flex-1 flex items-center justify-center">

        <div className="bg-white shadow-xl rounded-2xl p-10 w-[420px]">

          <h2 className="text-2xl font-bold mb-6">
            Create Client Account
          </h2>

          <input
            placeholder="Company Name"
            className="border p-3 w-full mb-4 rounded-lg"
            value={form.company}
            onChange={e=>setForm({...form,company:e.target.value})}
          />

          <input
            placeholder="Client Email"
            className="border p-3 w-full mb-4 rounded-lg"
            value={form.email}
            onChange={e=>setForm({...form,email:e.target.value})}
          />

          <input
            type="password"
            placeholder="Password"
            className="border p-3 w-full mb-6 rounded-lg"
            value={form.password}
            onChange={e=>setForm({...form,password:e.target.value})}
          />

          <button
            onClick={handleSignup}
            className="bg-green-600 hover:bg-green-700 text-white w-full p-3 rounded-lg font-semibold"
          >
            Create Client
          </button>
          <p
  onClick={goLogin}
  className="text-blue-600 text-sm mt-3 cursor-pointer"
>
  Back to Login
</p>
        </div>

      </div>

    </div>
  );
}