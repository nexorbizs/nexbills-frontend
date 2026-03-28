import { useState } from "react";
import logo from "../assets/NexBills Logo.png";
import API from "../api";

const WHATSAPP_NUMBER = "918870227879"; // ⭐ Change this
const SUPPORT_EMAIL = "support@nexorbizs.com"; // ⭐ Change this

export default function Login({ setIsLoggedIn }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [subError, setSubError] = useState(null);

  const [step, setStep] = useState("login"); // "login" | "forgot" | "otp" | "reset" | "contact"
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // ⭐ Contact form state
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });

  /* ================= RESEND TIMER ================= */

  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  /* ================= SEND OTP ================= */

  const handleSendOtp = async () => {
    if (!forgotEmail.trim()) return alert("Enter your registered email");
    if (!/^\S+@\S+\.\S+$/.test(forgotEmail)) return alert("Invalid email");
    setOtpLoading(true);
    try {
      await API.post("/auth/send-otp", { email: forgotEmail.trim().toLowerCase() });
      alert("OTP sent! Check your email.");
      setStep("otp");
      startResendTimer();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return alert("Enter OTP");
    if (otp.length !== 6) return alert("OTP must be 6 digits");
    setOtpLoading(true);
    try {
      await API.post("/auth/verify-otp", {
        email: forgotEmail.trim().toLowerCase(),
        otp: otp.trim()
      });
      setStep("reset");
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  /* ================= RESET PASSWORD ================= */

  const handleResetPassword = async () => {
    if (!newPassword) return alert("Enter new password");
    if (newPassword.length < 6) return alert("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return alert("Passwords do not match");
    setOtpLoading(true);
    try {
      await API.post("/auth/reset-password", {
        email: forgotEmail.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword
      });
      alert("Password reset successfully! Please login.");
      setStep("login");
      setForgotEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      alert(err.response?.data?.message || "Reset failed");
    } finally {
      setOtpLoading(false);
    }
  };

  /* ================= LOGIN ================= */

  const validate = () => {
    if (!email.trim()) return alert("Email required");
    if (!/^\S+@\S+\.\S+$/.test(email)) return alert("Invalid email");
    if (!password) return alert("Password required");
    if (password.length < 6) return alert("Password must be minimum 6 characters");
    return true;
  };

  const handleLogin = async () => {
    if (loading) return;
    if (!validate()) return;
    setLoading(true);
    setSubError(null);

    try {
      let res;
      try {
        res = await API.post("/auth/login", {
          email: email.trim().toLowerCase(),
          password
        });
      } catch {
        res = await API.post("/users/login", {
          email: email.trim().toLowerCase(),
          password
        });
      }

      const { token, company, subscription, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("company", JSON.stringify(company));
      localStorage.setItem("subscription", JSON.stringify(subscription));
      if (user) localStorage.setItem("user", JSON.stringify(user));

      if (subscription?.daysLeft <= 7 && subscription?.plan !== "lifetime") {
        alert(`⚠️ Subscription expires in ${subscription.daysLeft} day(s)!`);
      }

      setIsLoggedIn(true);

    } catch (err) {
      if (err.response?.data?.subscriptionExpired) {
        setSubError(err.response.data.message);
      } else {
        alert(err.response?.data?.message || "Login Failed");
      }
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  /* ================= SHARED BACKGROUND ================= */

  const bg = (
    <>
      <div className="absolute inset-0">
        {[...Array(60)].map((_, i) => (
          <span key={i} className="absolute bg-white rounded-full opacity-40"
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
      <div className="absolute w-[700px] h-[700px] bg-indigo-500 rounded-full blur-[200px] opacity-20 top-[-200px] left-[-200px]" />
      <div className="absolute w-[600px] h-[600px] bg-purple-500 rounded-full blur-[180px] opacity-20 bottom-[-200px] right-[-200px]" />
    </>
  );

  const logoBlock = (
    <div className="mb-8 flex items-center justify-center gap-3">
      <img src={logo} className="w-14 h-14 bg-white rounded-full p-1" />
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">NexBills</h1>
        <p className="text-xs text-slate-300">powered by NexorBizs Technologies</p>
      </div>
    </div>
  );

  const inputClass = "w-full border border-white/30 bg-white/10 p-3 rounded-xl placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const btnClass = "w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-semibold transition";

  /* ================= STEP: CONTACT ================= */

  if (step === "contact") {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black p-6">
        {bg}
        <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 w-full max-w-md p-8 md:p-10 rounded-3xl shadow-2xl text-white">
          {logoBlock}
          <h2 className="text-lg font-semibold mb-2 text-center">Contact Us</h2>
          <p className="text-slate-400 text-sm text-center mb-6">We'll get back to you via WhatsApp or Email</p>

          <input
            placeholder="Your Name *"
            value={contactForm.name}
            autoFocus
            onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
            className={`${inputClass} mb-3`}
          />
          <input
            placeholder="Your Email"
            value={contactForm.email}
            onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
            className={`${inputClass} mb-3`}
          />
          <textarea
            placeholder="Your Message... *"
            value={contactForm.message}
            onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
            rows={4}
            className={`${inputClass} mb-4 resize-none`}
          />

          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={() => {
                if (!contactForm.name || !contactForm.message) return alert("Name & Message required");
                const msg = encodeURIComponent(
                  `Hi NexBills! 👋\n\nName: ${contactForm.name}\nEmail: ${contactForm.email || "—"}\n\nMessage:\n${contactForm.message}`
                );
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
              }}
              className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl font-semibold transition text-sm"
            >
              📱 WhatsApp
            </button>
            <button
              onClick={() => {
                if (!contactForm.name || !contactForm.message) return alert("Name & Message required");
                const subject = encodeURIComponent(`NexBills Enquiry - ${contactForm.name}`);
                const body = encodeURIComponent(
                  `Name: ${contactForm.name}\nEmail: ${contactForm.email || "—"}\n\nMessage:\n${contactForm.message}`
                );
                window.open(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-semibold transition text-sm"
            >
              ✉️ Email
            </button>
          </div>

          <button onClick={() => setStep("login")} className="w-full text-slate-400 hover:text-white text-sm text-center transition">
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  /* ================= STEP: FORGOT EMAIL ================= */

  if (step === "forgot") {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black p-6">
        {bg}
        <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 w-full max-w-md p-8 md:p-10 rounded-3xl shadow-2xl text-white">
          {logoBlock}
          <h2 className="text-lg font-semibold mb-2 text-center">Forgot Password</h2>
          <p className="text-slate-400 text-sm text-center mb-6">Enter your registered email to receive OTP</p>

          <input
            placeholder="Registered Email"
            value={forgotEmail}
            autoFocus
            onChange={e => setForgotEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSendOtp()}
            className={`${inputClass} mb-4`}
          />

          <button onClick={handleSendOtp} disabled={otpLoading} className={`${btnClass} mb-3`}>
            {otpLoading ? "Sending OTP..." : "Send OTP"}
          </button>

          <button onClick={() => setStep("login")} className="w-full text-slate-400 hover:text-white text-sm text-center transition">
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  /* ================= STEP: ENTER OTP ================= */

  if (step === "otp") {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black p-6">
        {bg}
        <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 w-full max-w-md p-8 md:p-10 rounded-3xl shadow-2xl text-white">
          {logoBlock}
          <h2 className="text-lg font-semibold mb-2 text-center">Enter OTP</h2>
          <p className="text-slate-400 text-sm text-center mb-1">
            OTP sent to <span className="text-white font-semibold">{forgotEmail}</span>
          </p>
          <p className="text-slate-500 text-xs text-center mb-6">Valid for 5 minutes</p>

          <input
            placeholder="6-digit OTP"
            value={otp}
            autoFocus
            maxLength={6}
            onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
            onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
            className={`${inputClass} mb-4 text-center text-2xl font-bold tracking-widest`}
          />

          <button onClick={handleVerifyOtp} disabled={otpLoading} className={`${btnClass} mb-3`}>
            {otpLoading ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="text-center mb-3">
            {resendTimer > 0 ? (
              <p className="text-slate-400 text-sm">Resend OTP in {resendTimer}s</p>
            ) : (
              <button onClick={handleSendOtp} disabled={otpLoading}
                className="text-indigo-400 hover:text-indigo-300 text-sm underline">
                Resend OTP
              </button>
            )}
          </div>

          <button onClick={() => setStep("forgot")} className="w-full text-slate-400 hover:text-white text-sm text-center transition">
            ← Change Email
          </button>
        </div>
      </div>
    );
  }

  /* ================= STEP: RESET PASSWORD ================= */

  if (step === "reset") {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black p-6">
        {bg}
        <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 w-full max-w-md p-8 md:p-10 rounded-3xl shadow-2xl text-white">
          {logoBlock}
          <h2 className="text-lg font-semibold mb-2 text-center">Reset Password</h2>
          <p className="text-slate-400 text-sm text-center mb-6">Enter your new password</p>

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            autoFocus
            onChange={e => setNewPassword(e.target.value)}
            className={`${inputClass} mb-4`}
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleResetPassword()}
            className={`${inputClass} mb-4`}
          />

          {confirmPassword && (
            <p className={`text-xs mb-4 ${newPassword === confirmPassword ? "text-green-400" : "text-red-400"}`}>
              {newPassword === confirmPassword ? "✅ Passwords match" : "❌ Passwords do not match"}
            </p>
          )}

          <button onClick={handleResetPassword} disabled={otpLoading} className={`${btnClass} mb-3`}>
            {otpLoading ? "Resetting..." : "Reset Password"}
          </button>

          <button onClick={() => setStep("login")} className="w-full text-slate-400 hover:text-white text-sm text-center transition">
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  /* ================= STEP: LOGIN ================= */

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black p-6">
      {bg}
      <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 w-full max-w-md p-8 md:p-10 rounded-3xl shadow-2xl text-white">
        {logoBlock}

        <h2 className="text-lg md:text-xl font-semibold mb-6 text-center">Client Login</h2>

        {subError && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-4 text-center">
            <p className="text-red-300 text-sm font-semibold">🚫 Access Blocked</p>
            <p className="text-red-200 text-sm mt-1">{subError}</p>
            <p className="text-red-300 text-xs mt-2">Contact: {SUPPORT_EMAIL}</p>
          </div>
        )}

        <input
          placeholder="Client Email"
          autoFocus
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`${inputClass} mb-4`}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`${inputClass} mb-2`}
        />

        <div className="text-right mb-6">
          <button
            onClick={() => { setStep("forgot"); setForgotEmail(email); }}
            className="text-indigo-300 hover:text-indigo-200 text-sm underline"
          >
            Forgot Password?
          </button>
        </div>

        <button onClick={handleLogin} disabled={loading} className={btnClass}>
          {loading ? "Logging in..." : "Login to NexBills"}
        </button>

        {/* ⭐ Contact Us link */}
        <p className="text-center text-slate-400 text-xs mt-4">
          Need help?{" "}
          <button
            onClick={() => setStep("contact")}
            className="text-indigo-300 hover:text-indigo-200 underline"
          >
            Contact Us
          </button>
        </p>

      </div>
    </div>
  );
}