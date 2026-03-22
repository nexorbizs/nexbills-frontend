import { useEffect, useState } from "react";
import API from "../api";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function Settings() {

  const [form, setForm] = useState({
    shopName: "",
    gstNumber: "",
    phone: "",
    address: "",
    upiId: "",
    logoUrl: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false); // ⭐

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const res = await API.get("/settings");
      if (res.data) {
        setForm({
          shopName:  res.data.shopName  || "",
          gstNumber: res.data.gstNumber || "",
          phone:     res.data.phone     || "",
          address:   res.data.address   || "",
          upiId:     res.data.upiId     || "",
          logoUrl:   res.data.logoUrl   || ""
        });
      }
    } catch {
      console.log("No settings yet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey && e.key === "Enter") { e.preventDefault(); save(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [form]);

  // ⭐ CLOUDINARY UPLOAD
  const uploadLogo = async (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024)
      return alert("Image must be under 2MB");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      setUploading(true);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        setForm(prev => ({ ...prev, logoUrl: data.secure_url }));
        alert("Logo uploaded successfully ✅");
      } else {
        alert("Upload failed. Try again.");
      }
    } catch {
      alert("Upload failed. Check your internet connection.");
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    if (!form.shopName.trim()) return alert("Business name required");
    if (form.phone && !/^[6-9][0-9]{9}$/.test(form.phone)) return alert("Invalid phone number");
    if (form.gstNumber && form.gstNumber.length !== 15) return alert("GST must be 15 characters");
    return true;
  };

  const save = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      await API.post("/settings", {
        shopName:  form.shopName.trim(),
        gstNumber: form.gstNumber.trim().toUpperCase(),
        phone:     form.phone.trim(),
        address:   form.address.trim(),
        upiId:     form.upiId.trim(),
        logoUrl:   form.logoUrl.trim()
      });
      window.dispatchEvent(new Event("settingsUpdated"));
      alert("Settings Saved Successfully ✅");
    } catch (err) {
      alert(err.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading Settings...</div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">

      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
        Business Settings
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card title="Business Information">
          <Input label="Shop / Company Name" value={form.shopName}
            onChange={v => setForm({ ...form, shopName: v })} />
          <Input label="GST Number" value={form.gstNumber}
            onChange={v => setForm({ ...form, gstNumber: v.toUpperCase() })} />
          <Input label="Phone Number" value={form.phone}
            onChange={v => setForm({ ...form, phone: v.replace(/\D/g, "") })} />
        </Card>

        <Card title="Business Address">
          <TextArea label="Full Address" value={form.address}
            onChange={v => setForm({ ...form, address: v })} />
        </Card>

        {/* ⭐ PAYMENT & BRANDING */}
        <Card title="Payment & Branding">
          <Input
            label="UPI ID (for QR code on receipt)"
            value={form.upiId}
            onChange={v => setForm({ ...form, upiId: v })}
            placeholder="yourname@upi"
          />

          {/* ⭐ LOGO UPLOAD */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Shop Logo (shown on receipt)</p>
            <div className="flex items-center gap-3 flex-wrap">
              <label className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-semibold text-white transition ${uploading ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
                {uploading ? "Uploading..." : "📁 Upload Logo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={e => uploadLogo(e.target.files[0])}
                />
              </label>
              {form.logoUrl && (
                <button
                  onClick={() => setForm(prev => ({ ...prev, logoUrl: "" }))}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove Logo
                </button>
              )}
            </div>

            {/* Logo preview */}
            {form.logoUrl && (
              <div className="mt-3">
                <p className="text-xs text-slate-400 mb-1">Preview:</p>
                <img
                  src={form.logoUrl}
                  alt="Logo Preview"
                  className="h-16 object-contain border rounded-lg p-1 bg-white"
                  onError={e => { e.target.style.display = "none"; }}
                />
              </div>
            )}

            {!form.logoUrl && (
              <p className="text-xs text-slate-400 mt-2">
                Accepted: JPG, PNG, SVG — Max 2MB
              </p>
            )}
          </div>
        </Card>

        {/* ⭐ RECEIPT PREVIEW */}
        <Card title="Receipt Preview">
          <div className="bg-slate-50 border rounded-lg p-4 font-mono text-xs space-y-1">
            {form.logoUrl && (
              <div className="flex justify-center mb-2">
                <img src={form.logoUrl} alt="Logo"
                  className="h-12 object-contain"
                  onError={e => { e.target.style.display = "none"; }} />
              </div>
            )}
            <p className="text-center font-bold text-sm">{form.shopName || "Your Shop Name"}</p>
            {form.address && <p className="text-center">{form.address}</p>}
            {form.phone && <p className="text-center">Ph: {form.phone}</p>}
            {form.gstNumber && <p className="text-center">GSTIN: {form.gstNumber}</p>}
            <hr className="border-dashed border-slate-300 my-1" />
            <p className="text-center text-slate-400">[ Your items will appear here ]</p>
            <hr className="border-dashed border-slate-300 my-1" />
            {form.upiId && (
              <p className="text-center text-blue-600">UPI: {form.upiId}</p>
            )}
            <p className="text-center text-slate-400">Thank you for your purchase!</p>
          </div>
        </Card>

      </div>

      <div className="mt-8 lg:mt-10 sticky bottom-4 lg:static">
        <button onClick={save} disabled={saving}
          className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg font-semibold">
          {saving ? "Saving..." : "Save Settings (Ctrl + Enter)"}
        </button>
      </div>

    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
      <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <input
        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || ""}
      />
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <textarea rows={5}
        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}