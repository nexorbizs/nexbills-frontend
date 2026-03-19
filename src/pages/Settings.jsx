import { useEffect, useState } from "react";
import API from "../api";

export default function Settings() {

  const [form, setForm] = useState({
    shopName: "",
    gstNumber: "",
    phone: "",
    address: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= LOAD ================= */

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {

      const res = await API.get("/settings");

      if (res.data) {
        setForm({
          shopName: res.data.shopName || "",
          gstNumber: res.data.gstNumber || "",
          phone: res.data.phone || "",
          address: res.data.address || ""
        });
      }

    } catch {
      console.log("No settings yet");
    } finally {
      setLoading(false);
    }
  };

  /* ================= KEYBOARD SAVE ================= */

  useEffect(() => {

    const handleKey = (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        save();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);

  }, [form]);

  /* ================= VALIDATION ================= */

  const validate = () => {

    if (!form.shopName.trim())
      return alert("Business name required");

    if (form.phone && !/^[6-9][0-9]{9}$/.test(form.phone))
      return alert("Invalid phone number");

    if (form.gstNumber && form.gstNumber.length !== 15)
      return alert("GST must be 15 characters");

    return true;
  };

  /* ================= SAVE ================= */

  const save = async () => {

    if (!validate()) return;

    try {

      setSaving(true);

      await API.post("/settings", {
        shopName: form.shopName.trim(),
        gstNumber: form.gstNumber.trim().toUpperCase(),
        phone: form.phone.trim(),
        address: form.address.trim()
      });

      window.dispatchEvent(new Event("settingsUpdated"));

      alert("Settings Saved Successfully ✅");

    } catch (err) {

      alert(err.response?.data?.error || "Save failed");

    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */

  if (loading)
    return <div className="p-6">Loading Settings...</div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">

      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
        Business Settings
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card title="Business Information">

          <Input
            label="Shop / Company Name"
            value={form.shopName}
            onChange={(v)=>setForm({...form, shopName:v})}
          />

          <Input
            label="GST Number"
            value={form.gstNumber}
            onChange={(v)=>setForm({...form, gstNumber:v.toUpperCase()})}
          />

          <Input
            label="Phone Number"
            value={form.phone}
            onChange={(v)=>{
              const val = v.replace(/\D/g,"");
              setForm({...form, phone:val});
            }}
          />

        </Card>

        <Card title="Business Address">

          <TextArea
            label="Full Address"
            value={form.address}
            onChange={(v)=>setForm({...form, address:v})}
          />

        </Card>

      </div>

      <div className="mt-8 lg:mt-10 sticky bottom-4 lg:static">
        <button
          onClick={save}
          disabled={saving}
          className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg font-semibold"
        >
          {saving ? "Saving..." : "Save Settings (Ctrl + Enter)"}
        </button>
      </div>

    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Card({ title, children }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
      <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">
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
        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}