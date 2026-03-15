import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Receipt,
  BarChart3,
  Settings,
  LogOut
} from "lucide-react";

import { useCartStore } from "../store/cartStore";
import { useProductStore } from "../store/productStore";
import { useState } from "react";

export default function Sidebar({ setPage }) {

  const currentUser =
    JSON.parse(localStorage.getItem("currentUser"));

  const { clearCart } = useCartStore();
  const { loadProducts } = useProductStore();

  const [active, setActive] = useState("dashboard");

  const handleLogout = () => {
    clearCart();
    localStorage.removeItem("currentUser");
    loadProducts();
    window.location.reload();
  };

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
    { name: "Billing", icon: ShoppingCart, key: "billing" },
    { name: "Products", icon: Package, key: "products" },
    { name: "Customers", icon: Users, key: "customers" },
    { name: "Sales", icon: Receipt, key: "sales" },
    { name: "Reports", icon: BarChart3, key: "reports" },
    { name: "Settings", icon: Settings, key: "settings" },
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-slate-950 to-slate-900 text-white min-h-screen flex flex-col">

      {/* BRAND */}
      <div className="p-8 border-b border-slate-800">

        <h1 className="text-3xl font-bold tracking-tight">
          NexBills
        </h1>

        <p className="text-xs text-slate-400 mt-1">
          powered by NexorBizs Technologies
        </p>

        <div className="mt-4 text-sm text-slate-300 bg-slate-800 px-3 py-2 rounded-lg inline-block">
          {currentUser?.company}
        </div>

      </div>

      {/* MENU */}
      <div className="flex-1 px-4 py-6 space-y-2">

        {menu.map(item => {

          const Icon = item.icon;
          const isActive = active === item.key;

          return (
            <button
              key={item.key}
              onClick={() => {
                setPage(item.key);
                setActive(item.key);
              }}
              className={`relative w-full flex items-center gap-4 px-5 py-3 rounded-xl text-left transition-all duration-200
                ${
                  isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg"
                  : "hover:bg-slate-800 text-slate-300"
                }`}
            >

              {/* ACTIVE BAR */}
              {isActive && (
                <div className="absolute left-0 top-0 h-full w-1 bg-white rounded-r" />
              )}

              <Icon size={20} />

              <span className="font-medium">
                {item.name}
              </span>

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
  );
}