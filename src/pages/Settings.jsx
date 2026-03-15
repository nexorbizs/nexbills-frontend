import { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/tenant";

export default function Settings() {

  const [form, setForm] = useState({
    shop: "",
    gst: "",
    phone: "",
    address: ""
  });

  useEffect(() => {

    const currentUser = getCurrentUser();

    const allConfigs =
      JSON.parse(localStorage.getItem("shopConfig")) || [];

    const config =
      allConfigs.find(c => c.companyId === currentUser?.id) || {};

    setForm({
      shop: config.shop || "",
      gst: config.gst || "",
      phone: config.phone || "",
      address: config.address || ""
    });

  }, []);

  const save = () => {

    const currentUser = getCurrentUser();

    const allConfigs =
      JSON.parse(localStorage.getItem("shopConfig")) || [];

    const existingIndex =
      allConfigs.findIndex(c => c.companyId === currentUser.id);

    const data = {
      companyId: currentUser.id,
      ...form
    };

    if (existingIndex >= 0)
      allConfigs[existingIndex] = data;
    else
      allConfigs.push(data);

    localStorage.setItem("shopConfig", JSON.stringify(allConfigs));

    alert("Settings Saved Successfully ✅");
  };

  return (
    <div className="p-8">

      <h1 className="text-4xl font-bold mb-8">
        Business Settings
      </h1>

      <div className="grid grid-cols-2 gap-8">

        {/* SHOP INFO */}
        <Card title="Business Information">

          <Input
            label="Shop / Company Name"
            value={form.shop}
            onChange={(v)=>setForm({...form, shop:v})}
          />

          <Input
            label="GST Number"
            value={form.gst}
            onChange={(v)=>setForm({...form, gst:v})}
          />

          <Input
            label="Phone Number"
            value={form.phone}
            onChange={(v)=>setForm({...form, phone:v})}
          />

        </Card>

        {/* ADDRESS */}
        <Card title="Business Address">

          <TextArea
            label="Full Address"
            value={form.address}
            onChange={(v)=>setForm({...form, address:v})}
          />

        </Card>

      </div>

      <div className="mt-10">
        <button
          onClick={save}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg"
        >
          Save Settings
        </button>
      </div>

    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl">
      <h2 className="text-xl font-semibold mb-6">
        {title}
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <input
        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <textarea
        rows={5}
        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}