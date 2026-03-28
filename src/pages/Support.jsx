import { useState } from "react";
import {
  MessageCircle, Ticket, HelpCircle, Mail,
  ChevronDown, ChevronUp, Send, Phone,
  CheckCircle, ExternalLink, Headphones
} from "lucide-react";

const FAQ_DATA = [
  {
    q: "How do I add a new product?",
    a: "Go to Products page → Click 'Add Product' → Fill in name, price, stock → Save. You can also scan barcode using USB or Camera scanner."
  },
  {
    q: "How to create a GST invoice?",
    a: "Go to Billing → Add items to cart → Select customer → Enable GST toggle → Print or Save invoice."
  },
  {
    q: "How do I add staff users?",
    a: "Go to Users page → Add Staff Account → Fill name, email, password → Assign role (Cashier/Manager) → Assign branches → Save."
  },
  {
    q: "How to set up UPI QR on receipt?",
    a: "Go to Settings → Upload your UPI QR image → Save. It will automatically appear on all printed receipts."
  },
  {
    q: "How to enable Thermal Print?",
    a: "Go to Billing page → After adding items → Click Print → Select 58mm or 80mm based on your printer width."
  },
  {
    q: "How to upgrade my plan?",
    a: "Contact our support team via WhatsApp or Email below. We'll process your upgrade within 24 hours."
  },
  {
    q: "I forgot my password. How to reset?",
    a: "On the Login page → Click 'Forgot Password' → Enter your registered email → You'll receive an OTP to reset."
  },
  {
    q: "How to add multiple branches?",
    a: "Go to Branches page → Add Branch → Fill details → Save. Then assign staff to branches in Users page."
  },
];

const WHATSAPP_NUMBER = "918870227879"; // ⭐ Change this
const SUPPORT_EMAIL = "support@nexorbizs.com"; // ⭐ Change this

export default function Support() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const company = JSON.parse(localStorage.getItem("company") || "{}");
  const subscription = JSON.parse(localStorage.getItem("subscription") || "null");

  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState("faq");
  const [submitted, setSubmitted] = useState(false);

  const [ticket, setTicket] = useState({
    subject: "",
    category: "billing",
    message: "",
  });

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hi NexBills Support! 👋\n\nCompany: ${company?.name || "—"}\nPlan: ${subscription?.plan?.toUpperCase() || "—"}\nUser: ${user?.name || user?.email || "—"}\n\nIssue: `
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`NexBills Support - ${company?.name || "Customer"}`);
    const body = encodeURIComponent(
      `Hi Support Team,\n\nCompany: ${company?.name || "—"}\nPlan: ${subscription?.plan?.toUpperCase() || "—"}\nUser: ${user?.name || user?.email || "—"}\n\nIssue Description:\n`
    );
    window.open(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
  };

  const handleTicketSubmit = () => {
    if (!ticket.subject || !ticket.message) return;
    const msg = encodeURIComponent(
      `Hi NexBills Support! 🎫\n\nTicket Details:\nCompany: ${company?.name || "—"}\nPlan: ${subscription?.plan?.toUpperCase() || "—"}\nUser: ${user?.name || user?.email || "—"}\nCategory: ${ticket.category.toUpperCase()}\nSubject: ${ticket.subject}\n\nMessage:\n${ticket.message}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTicket({ subject: "", category: "billing", message: "" });
    }, 3000);
  };

  const tabs = [
    { key: "faq",     label: "FAQ",            icon: HelpCircle },
    { key: "ticket",  label: "Raise Ticket",   icon: Ticket },
    { key: "contact", label: "Contact Us",     icon: Headphones },
  ];

  return (
    <div className="max-w-4xl mx-auto">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Support Center</h1>
        <p className="text-slate-500 text-sm">We're here to help you with NexBills</p>
      </div>

      {/* QUICK CONTACT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <button
          onClick={handleWhatsApp}
          className="flex items-center gap-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl p-4 text-left transition-all group"
        >
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Phone size={22} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-green-800">WhatsApp Support</p>
            <p className="text-sm text-green-600">Fastest response · Usually within 1hr</p>
          </div>
          <ExternalLink size={16} className="ml-auto text-green-400 group-hover:text-green-600" />
        </button>

        <button
          onClick={handleEmail}
          className="flex items-center gap-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 text-left transition-all group"
        >
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Mail size={22} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-blue-800">Email Support</p>
            <p className="text-sm text-blue-600">{SUPPORT_EMAIL}</p>
          </div>
          <ExternalLink size={16} className="ml-auto text-blue-400 group-hover:text-blue-600" />
        </button>
      </div>

      {/* TABS */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="flex border-b">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all
                  ${activeTab === tab.key
                    ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">

          {/* ── FAQ TAB ── */}
          {activeTab === "faq" && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500 mb-4">
                Find quick answers to common questions below.
              </p>
              {FAQ_DATA.map((item, i) => (
                <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition"
                  >
                    <span className="font-medium text-slate-800 text-sm pr-4">{item.q}</span>
                    {openFaq === i
                      ? <ChevronUp size={16} className="text-blue-500 flex-shrink-0" />
                      : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 text-sm text-slate-600 border-t border-slate-100 pt-3 bg-slate-50">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                Can't find your answer? <button onClick={() => setActiveTab("ticket")} className="font-semibold underline">Raise a ticket</button> or <button onClick={handleWhatsApp} className="font-semibold underline">chat on WhatsApp</button>.
              </div>
            </div>
          )}

          {/* ── TICKET TAB ── */}
          {activeTab === "ticket" && (
            <div>
              <p className="text-sm text-slate-500 mb-5">
                Describe your issue and we'll get back to you ASAP via WhatsApp.
              </p>
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <CheckCircle size={48} className="text-green-500" />
                  <p className="text-lg font-semibold text-green-700">Ticket Sent!</p>
                  <p className="text-sm text-slate-500">We'll respond via WhatsApp shortly.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Category</label>
                      <select
                        value={ticket.category}
                        onChange={e => setTicket({ ...ticket, category: e.target.value })}
                        className="border border-slate-200 rounded-lg p-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="billing">Billing / Invoice</option>
                        <option value="products">Products / Stock</option>
                        <option value="account">Account / Login</option>
                        <option value="subscription">Subscription / Plan</option>
                        <option value="branch">Branches / Users</option>
                        <option value="reports">Reports</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Subject *</label>
                      <input
                        placeholder="Brief description of issue"
                        value={ticket.subject}
                        onChange={e => setTicket({ ...ticket, subject: e.target.value })}
                        className="border border-slate-200 rounded-lg p-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Message *</label>
                    <textarea
                      placeholder="Describe your issue in detail..."
                      value={ticket.message}
                      onChange={e => setTicket({ ...ticket, message: e.target.value })}
                      rows={5}
                      className="border border-slate-200 rounded-lg p-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500">
                    📋 Auto-filled: <span className="font-medium text-slate-700">{company?.name}</span> • {subscription?.plan?.toUpperCase()} plan • {user?.name || user?.email}
                  </div>
                  <button
                    onClick={handleTicketSubmit}
                    disabled={!ticket.subject || !ticket.message}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition"
                  >
                    <Send size={16} />
                    Send via WhatsApp
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── CONTACT TAB ── */}
          {activeTab === "contact" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 mb-2">
                Reach us through your preferred channel.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone size={18} className="text-green-600" />
                    </div>
                    <p className="font-semibold text-slate-800">WhatsApp</p>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">Best for quick queries & urgent issues.</p>
                  <button onClick={handleWhatsApp} className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2">
                    <ExternalLink size={14} /> Open WhatsApp
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail size={18} className="text-blue-600" />
                    </div>
                    <p className="font-semibold text-slate-800">Email</p>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">For detailed queries or billing issues.</p>
                  <button onClick={handleEmail} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2">
                    <ExternalLink size={14} /> Send Email
                  </button>
                </div>
              </div>

              {/* Support Hours */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="font-semibold text-slate-700 mb-2 text-sm">🕐 Support Hours</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <span>Mon – Sat</span><span className="font-medium">9:00 AM – 7:00 PM</span>
                  <span>Sunday</span><span className="font-medium text-slate-400">Closed</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-800">
                ⚡ For faster support, use the <strong>Raise Ticket</strong> tab — it auto-fills your company & plan details!
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}