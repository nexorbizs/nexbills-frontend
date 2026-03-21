import { useState, useEffect } from "react";
import API from "../api";
import { countries } from "../utils/countries";

export default function Customers() {

  const [customers, setCustomers] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    code: "+91"
  });

  const [search, setSearch] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await API.get("/customers");
      setCustomers(res.data);
    } catch {
      alert("Failed to load customers");
    }
  };

  /* ================= KEYBOARD CONTROL ================= */

  useEffect(() => {

    const handleKey = (e) => {

      if(filtered.length === 0) return;

      if(e.key === "ArrowDown"){
        e.preventDefault();
        setActiveIndex(i =>
          i < filtered.length - 1 ? i + 1 : 0
        );
      }

      if(e.key === "ArrowUp"){
        e.preventDefault();
        setActiveIndex(i =>
          i > 0 ? i - 1 : filtered.length - 1
        );
      }

      if(e.key === "Delete"){
        deleteCustomer(filtered[activeIndex].id);
      }

      if(e.key === "Enter"){
        addCustomer();
      }

    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);

  }, [customers, activeIndex, form, search]);

  /* ================= VALIDATION ================= */

  const validate = () => {

    if (!form.name.trim())
      return alert("Customer name required");
  
    if (form.phone.length < 6 || form.phone.length > 15)
      return alert("Invalid mobile number");
  
    if (form.address.trim().length < 3)
      return alert("Invalid address");
  
    // ⭐ DUPLICATE CHECK
    const fullPhone = form.code + " " + form.phone;
    const duplicate = customers.find(c => c.phone === fullPhone);
    if (duplicate)
      return alert(`Phone number already exists for customer: ${duplicate.name}`);
  
    return true;
  };

  /* ================= ADD CUSTOMER ================= */

  const addCustomer = async () => {

    if (!validate()) return;

    try {

      await API.post("/customers", {
        name: form.name.trim(),
        phone: form.code + " " + form.phone,
        address: form.address.trim()
      });

      setForm({
        name: "",
        phone: "",
        address: "",
        code: "+91"
      });

      loadCustomers();

    } catch (err) {
      alert(err.response?.data?.error || "Add failed");
    }
  };

  /* ================= DELETE ================= */

  const deleteCustomer = async (id) => {

    try {
      await API.delete(`/customers/${id}`);
      loadCustomers();
    } catch {
      alert("Delete failed");
    }
  };

  /* ================= SEARCH ================= */

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.address || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">

      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Customers
      </h1>

      {/* ADD FORM */}
      <div className="bg-white shadow rounded-xl p-4 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <input
            placeholder="Customer Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="border p-3 rounded-lg w-full"
          />

          <div className="grid grid-cols-3 gap-2">

            <select
              value={form.code}
              onChange={e =>
                setForm({ ...form, code: e.target.value })
              }
              className="border p-3 rounded-lg w-full col-span-1"
            >
              {countries.map(c => (
                <option key={c.key} value={c.dial}>
                  {c.key.toUpperCase()} {c.dial}
                </option>
              ))}
            </select>

            <input
              placeholder="Phone"
              value={form.phone}
              maxLength={10}
              onChange={e =>
                setForm({
                  ...form,
                  phone: e.target.value.replace(/\D/g, "")
                })
              }
              className="border p-3 rounded-lg w-full col-span-2"
            />

          </div>

        </div>

        <div className="mt-4">
          <input
            placeholder="Customer Address"
            value={form.address}
            onChange={e =>
              setForm({ ...form, address: e.target.value })
            }
            className="border p-3 rounded-lg w-full"
          />
        </div>

        <div className="mt-4">
          <button
            onClick={addCustomer}
            className="bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold w-full p-3"
          >
            Add Customer (Enter)
          </button>
        </div>

      </div>

      {/* SEARCH */}
      <input
        placeholder="Search Customer"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="border p-3 rounded-lg w-full mb-4"
      />

      {/* TABLE */}
      <div className="bg-white shadow rounded-xl overflow-x-auto">

        <table className="min-w-[700px] w-full text-sm">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Address</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>

            {filtered.length === 0 && (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-400">
                  No customers found
                </td>
              </tr>
            )}

            {filtered.map((c,index) => (
              <tr key={c.id}
                className={`border-t hover:bg-gray-50 ${
                  index === activeIndex ? "bg-blue-50" : ""
                }`}>
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{c.address}</td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => deleteCustomer(c.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete (Del)
                  </button>
                </td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}