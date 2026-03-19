import { useState } from "react";
import Sidebar from "./Sidebar";
import logo from "../assets/NexBills Logo.png";

import Dashboard from "../pages/Dashboard";
import Billing from "../pages/Billing";
import Products from "../pages/products";
import Customers from "../pages/Customers";
import Sales from "../pages/Sales";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";

export default function MainLayout() {

  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard />;
      case "billing": return <Billing />;
      case "products": return <Products />;
      case "customers": return <Customers />;
      case "sales": return <Sales />;
      case "reports": return <Reports />;
      case "settings": return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex bg-slate-100 min-h-screen relative">

      {/* SIDEBAR */}
      <Sidebar
        setPage={(p)=>{
          setPage(p);
          setSidebarOpen(false);
        }}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col w-full">

        {/* HEADER */}
        <div className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8 shadow-sm">

          {/* LEFT */}
          <div className="flex items-center gap-3">

            {/* MOBILE MENU */}
            <button
              className="md:hidden text-2xl text-slate-700"
              onClick={()=>setSidebarOpen(true)}
            >
              ☰
            </button>

            <img
              src={logo}
              alt="NexBills"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white p-1 shadow"
            />

            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-800">
                NexBills
              </h1>

              <p className="text-[10px] md:text-xs text-slate-400">
                powered by NexorBizs Technologies
              </p>
            </div>

          </div>

          {/* RIGHT */}
          <div className="text-xs md:text-sm text-slate-500">
            GST Billing System
          </div>

        </div>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          {renderPage()}
        </div>

      </div>

    </div>
  );
}