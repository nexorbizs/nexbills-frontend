import logo from "../assets/NexBills Logo.png";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  X,
  Truck,
  ShoppingBag,
  Crown
} from "lucide-react";

import { useCartStore } from "../store/cartStore";
import { useState } from "react";

export default function Sidebar({ setPage, sidebarOpen, setSidebarOpen }) {

  const company = JSON.parse(localStorage.getItem("company") || "{}");
  const subscription = JSON.parse(localStorage.getItem("subscription") || "null");

  const { clearCart } = useCartStore();
  const [active, setActive] = useState("dashboard");

  const handleLogout = () => {
    clearCart();
    localStorage.removeItem("token");
    localStorage.removeItem("company");
    localStorage.removeItem("subscription");
    window.location.href = "/";
  };

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
    { name: "Billing", icon: ShoppingCart, key: "billing" },
    { name: "Products", icon: Package, key: "products" },
    { name: "Customers", icon: Users, key: "customers" },
    { name: "Sales", icon: Receipt, key: "sales" },
    { name: "Reports", icon: BarChart3, key: "reports" },
    { name: "Suppliers", icon: Truck, key: "suppliers" },
    { name: "Purchases", icon: ShoppingBag, key: "purchases" },
    { name: "Settings", icon: Settings, key: "settings" },
  ];

  // ⭐ SUBSCRIPTION BADGE COLOR
  const planColors = {
    trial: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    basic: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    pro: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    enterprise: "bg-green-500/20 text-green-300 border-green-500/30"
  };

  const planColor = planColors[subscription?.plan] || planColors.trial;

  return (
    <>
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`
        fixed md:relative z-50 top-0 left-0
        w-72 bg-gradient-to-b from-slate-950 to-slate-900 text-white
        min-h-screen flex flex-col overflow-y-auto transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>

        {/* CLOSE BUTTON MOBILE */}
        <div className="md:hidden p-4 flex justify-end">
          <button onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* BRAND */}
        <div className="p-6 border-b border-slate-800">

          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="NexBills"
              className="w-10 h-10 rounded-full bg-white p-1"
            />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {company?.name || "NexBills"}
              </h1>
              <p className="text-[10px] text-slate-400">
                powered by NexorBizs Technologies
              </p>
            </div>
          </div>

          <div className="mt-4 text-sm text-slate-300 bg-slate-800 px-3 py-2 rounded-lg inline-block">
            {company?.name}
          </div>

          {/* ⭐ SUBSCRIPTION BADGE */}
          {subscription && (
            <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold ${planColor}`}>
              <Crown size={12} />
              <span>{subscription.plan?.toUpperCase()} PLAN</span>
              <span className="ml-auto">
                {subscription.daysLeft > 0
                  ? `${subscription.daysLeft}d left`
                  : "Expired"
                }
              </span>
            </div>
          )}

          {/* ⭐ EXPIRY WARNING */}
          {subscription?.daysLeft <= 7 && subscription?.daysLeft > 0 && (
            <div className="mt-2 bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-2 text-xs text-red-300">
              ⚠️ Subscription expiring soon! Contact support.
            </div>
          )}

        </div>

        {/* MENU */}
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menu.map(item => {
            const Icon = item.icon;
            const isActive = active === item.key;

            return (
              <button
                key={item.key}
                onClick={() => {
                  setPage(item.key);
                  setActive(item.key);
                  setSidebarOpen(false);
                }}
                className={`relative w-full flex items-center gap-4 px-5 py-3 rounded-xl text-left transition-all duration-200
                  ${isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg"
                    : "hover:bg-slate-800 text-slate-300"
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-white rounded-r" />
                )}
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* LOGOUT */}
        <div className="p-6 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 py-3 rounded-xl font-semibold transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

      </div>
    </>
  );
}