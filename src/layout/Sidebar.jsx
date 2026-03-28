import logo from "../assets/NexBills Logo.png";
import { LayoutDashboard, ShoppingCart, Package, Users, Receipt, BarChart3, Settings, LogOut, X, Truck, ShoppingBag, Crown, UserCog, Building2, Activity, Lock, Headphones } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import API from "../api";


const PLAN_FEATURES = {
  trial:      { purchases: true,  suppliers: true,  branches: true,  reports: true,  activity: true,  staffUsers: true },
  basic:      { purchases: false, suppliers: false, branches: false, reports: false, activity: false, staffUsers: false },
  pro:        { purchases: false, suppliers: false, branches: true,  reports: true,  activity: true,  staffUsers: true },
  enterprise: { purchases: true,  suppliers: true,  branches: true,  reports: true,  activity: true,  staffUsers: true },
  lifetime:   { purchases: true,  suppliers: true,  branches: true,  reports: true,  activity: true,  staffUsers: true },
};

export default function Sidebar({ setPage, sidebarOpen, setSidebarOpen, role = "OWNER" }) {

  const company = JSON.parse(localStorage.getItem("company") || "{}");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { clearCart } = useCartStore();
  const [active, setActive] = useState("dashboard");

  const [subscription, setSubscription] = useState(
    JSON.parse(localStorage.getItem("subscription") || "null")
  );

  // ⭐ Always fetch fresh plan from backend on load
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await API.get("/subscriptions/my-plan");
        const fresh = res.data;

        const updated = {
          plan: fresh.plan,
          status: fresh.status,
          maxUsers: fresh.features?.maxUsers,
          maxBranches: fresh.features?.maxBranches,
          daysLeft: subscription?.daysLeft ?? null,
          features: fresh.features,
        };

        localStorage.setItem("subscription", JSON.stringify(updated));
        setSubscription(updated);
      } catch (err) {
        console.error("Failed to fetch plan", err);
      }
    };
    fetchPlan();
  }, []);

  const plan = subscription?.plan || "basic";
  const savedFeatures = subscription?.features;
  const access = savedFeatures || PLAN_FEATURES[plan] || PLAN_FEATURES["basic"];

  const handleLogout = () => {
    clearCart();
    localStorage.removeItem("token");
    localStorage.removeItem("company");
    localStorage.removeItem("subscription");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const allMenu = [
    { name: "Dashboard",  icon: LayoutDashboard, key: "dashboard", roles: ["OWNER", "MANAGER", "CASHIER"], feature: null },
    { name: "Billing",    icon: ShoppingCart,    key: "billing",   roles: ["OWNER", "MANAGER", "CASHIER"], feature: null },
    { name: "Customers",  icon: Users,           key: "customers", roles: ["OWNER", "MANAGER", "CASHIER"], feature: null },
    { name: "Products",   icon: Package,         key: "products",  roles: ["OWNER", "MANAGER"],            feature: null },
    { name: "Sales",      icon: Receipt,         key: "sales",     roles: ["OWNER", "MANAGER"],            feature: null },
    { name: "Reports",    icon: BarChart3,  key: "reports",   roles: ["OWNER", "MANAGER"], feature: "reports" },
    { name: "Suppliers",  icon: Truck,      key: "suppliers", roles: ["OWNER", "MANAGER"], feature: "supplier_management" },
    { name: "Purchases",  icon: ShoppingBag,key: "purchases", roles: ["OWNER", "MANAGER"], feature: "purchase_management" },
    { name: "Activity",   icon: Activity,   key: "activity",  roles: ["OWNER"],            feature: "activity_log" },
    { name: "Users",      icon: UserCog,    key: "users",     roles: ["OWNER"],            feature: "staff_role_management" },
    { name: "Branches",   icon: Building2,  key: "branches",  roles: ["OWNER"],            feature: "multi_branch" },
    { name: "Settings",   icon: Settings,        key: "settings",  roles: ["OWNER"],                       feature: null },
    { name: "Support", icon: Headphones, key: "support", roles: ["OWNER", "MANAGER", "CASHIER"], feature: null },
  ];

  const menu = allMenu.filter(item => item.roles.includes(role));

  const planColors = {
    trial:      "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    basic:      "bg-blue-500/20 text-blue-300 border-blue-500/30",
    pro:        "bg-purple-500/20 text-purple-300 border-purple-500/30",
    enterprise: "bg-green-500/20 text-green-300 border-green-500/30",
    lifetime:   "bg-slate-500/20 text-slate-300 border-slate-500/30"
  };
  const planColor = planColors[subscription?.plan] || planColors.trial;

  const handleMenuClick = (item) => {
    const isLocked = item.feature ? !access[item.feature] : false;
    if (isLocked) {
      toast.error(`Upgrade your plan to access ${item.name}!`, {
        icon: "🔒",
        style: { background: "#1e293b", color: "#f8fafc", border: "1px solid #334155" }
      });
      return;
    }
    setPage(item.key);
    setActive(item.key);
    setSidebarOpen(false);
  };

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

<div className={`fixed z-50 top-0 left-0 w-72 bg-gradient-to-b from-slate-950 to-slate-900 text-white flex flex-col overflow-hidden transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`} style={{ height: '100dvh' }}>

        {/* CLOSE BUTTON - mobile */}
        <div className="md:hidden p-4 flex justify-end flex-shrink-0">
          <button onClick={() => setSidebarOpen(false)}><X size={24} /></button>
        </div>

        {/* HEADER */}
        <div className="p-6 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <img src={logo} alt="NexBills" className="w-10 h-10 rounded-full bg-white p-1" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{company?.name || "NexBills"}</h1>
              <p className="text-[10px] text-slate-400">powered by NexorBizs Technologies</p>
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-300 bg-slate-800 px-3 py-2 rounded-lg inline-block">
            {user?.name || company?.name} • {role}
          </div>
          {subscription && (
            <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold ${planColor}`}>
              <Crown size={12} />
              <span>{subscription.plan?.toUpperCase()} PLAN</span>
              <span className="ml-auto">
                {subscription.plan === "lifetime"
                  ? "♾️ Permanent"
                  : subscription.daysLeft > 0
                    ? `${subscription.daysLeft}d left`
                    : "Expired"}
              </span>
            </div>
          )}
          {subscription?.plan !== "lifetime" && subscription?.daysLeft <= 7 && subscription?.daysLeft > 0 && (
            <div className="mt-2 bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-2 text-xs text-red-300">
              ⚠️ Subscription expiring soon!
            </div>
          )}
        </div>

        {/* MENU */}
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto min-h-0">
          {menu.map(item => {
            const Icon = item.icon;
            const isActive = active === item.key;
            const isLocked = item.feature ? !access[item.feature] : false;
            return (
              <button
                key={item.key}
                onClick={() => handleMenuClick(item)}
                className={`relative w-full flex items-center gap-4 px-5 py-3 rounded-xl text-left transition-all duration-200
                  ${isActive ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg" : "hover:bg-slate-800 text-slate-300"}
                  ${isLocked ? "opacity-50" : ""}`}
              >
                {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-white rounded-r" />}
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
                {isLocked && <Lock size={13} className="ml-auto text-slate-400" />}
              </button>
            );
          })}
        </div>

        {/* LOGOUT */}
        <div className="p-6 border-t border-slate-800 flex-shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 py-3 rounded-xl font-semibold transition">
            <LogOut size={18} /> Logout
          </button>
        </div>

      </div>
    </>
  );
}