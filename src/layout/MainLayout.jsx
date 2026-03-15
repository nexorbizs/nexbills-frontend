<<<<<<< HEAD
import { useState } from "react";
import Sidebar from "./Sidebar";

import Dashboard from "../pages/Dashboard";
import Billing from "../pages/Billing";
import Products from "../pages/Products";
import Customers from "../pages/Customers";
import Sales from "../pages/Sales";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";

export default function MainLayout() {

  const [page, setPage] = useState("dashboard");

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
    <div className="flex bg-slate-100 min-h-screen">

      <Sidebar setPage={setPage} />

      <div className="flex-1 flex flex-col w-full">

        {/* HEADER */}
        <div className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8 shadow-sm">

          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800">
              NexBills
            </h1>
            <p className="text-[10px] md:text-xs text-slate-400">
              powered by NexorBizs Technologies
            </p>
          </div>

          <div className="text-xs md:text-sm text-slate-500">
            GST Billing System
          </div>

        </div>

        {/* PAGE */}
        <div className="p-3 md:p-6 lg:p-8">
          {renderPage()}
        </div>

      </div>

    </div>
  );
=======
import { useState } from "react";
import Sidebar from "./Sidebar";

import Dashboard from "../pages/Dashboard";
import Billing from "../pages/Billing";
import Products from "../pages/Products";
import Customers from "../pages/Customers";
import Sales from "../pages/Sales";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";

export default function MainLayout() {

  const [page, setPage] = useState("dashboard");

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
    <div className="flex bg-slate-100 min-h-screen">

      <Sidebar setPage={setPage} />

      <div className="flex-1 flex flex-col w-full">

        {/* HEADER */}
        <div className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8 shadow-sm">

          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800">
              NexBills
            </h1>
            <p className="text-[10px] md:text-xs text-slate-400">
              powered by NexorBizs Technologies
            </p>
          </div>

          <div className="text-xs md:text-sm text-slate-500">
            GST Billing System
          </div>

        </div>

        {/* PAGE */}
        <div className="p-3 md:p-6 lg:p-8">
          {renderPage()}
        </div>

      </div>

    </div>
  );
>>>>>>> 479c1c5f3a0fe0426cba61fe2c2eecef4c23e0a9
}