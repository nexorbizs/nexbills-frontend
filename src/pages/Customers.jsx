import { useState, useEffect } from "react";
import { getTenantData } from "../utils/tenant";
import { countries } from "../utils/countries";

export default function Customers() {

  const [customers, setCustomers] = useState([]);

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

  const loadCustomers = () => {
    const tenantCustomers = getTenantData("customers");
    setCustomers(tenantCustomers);
  };

  const validate = () => {

    const cleanName = form.name.trim();

    if(!/^[A-Za-z]+( [A-Za-z]+)*$/.test(cleanName)){
      alert("Customer name must contain alphabets only");
      return false;
    }

    if(!/^[6-9][0-9]{9}$/.test(form.phone)){
      alert("Enter valid 10 digit mobile starting with 6,7,8,9");
      return false;
    }

    if(form.address.trim().length < 5){
      alert("Enter valid address");
      return false;
    }

    const fullPhone = form.code + " " + form.phone;

    const exists = customers.find(c => c.phone === fullPhone);

    if(exists){
      alert("Customer with this phone already exists");
      return false;
    }

    return true;
  };

  const addCustomer = () => {

    if(!validate()) return;

    const currentUser =
      JSON.parse(localStorage.getItem("currentUser"));

    const newCustomer = {
      id: Date.now(),
      companyId: currentUser.id,
      name: form.name.trim(),
      phone: form.code + " " + form.phone,
      address: form.address.trim()
    };

    const existing = getTenantData("customers");

    localStorage.setItem(
      `customers_${currentUser.id}`,
      JSON.stringify([...existing, newCustomer])
    );

    loadCustomers();

    setForm({
      name: "",
      phone: "",
      address: "",
      code: "+91"
    });
  };

  const deleteCustomer = (id) => {

    const currentUser =
      JSON.parse(localStorage.getItem("currentUser"));

    const existing = getTenantData("customers");

    const updated = existing.filter(c => c.id !== id);

    localStorage.setItem(
      `customers_${currentUser.id}`,
      JSON.stringify(updated)
    );

    loadCustomers();
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.address || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">Customers</h1>

      {/* ADD FORM */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">

        <div className="grid grid-cols-4 gap-3">

          <input
            placeholder="Customer Name"
            value={form.name}
            onChange={e =>
              setForm({...form, name: e.target.value})
            }
            className="border p-2 rounded"
          />

          <div className="flex gap-2">

            <select
              value={form.code}
              onChange={e =>
                setForm({...form, code: e.target.value})
              }
              className="border p-2 rounded w-40"
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
                  phone: e.target.value.replace(/\D/g,"")
                })
              }
              className="border p-2 rounded flex-1"
            />

          </div>

          <input
            placeholder="Customer Address"
            value={form.address}
            onChange={e =>
              setForm({...form, address: e.target.value})
            }
            className="border p-2 rounded"
          />

          <button
            onClick={addCustomer}
            className="bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add
          </button>

        </div>

      </div>

      {/* SEARCH */}
      <input
        placeholder="Search Customer"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg overflow-hidden">

        <table className="w-full text-sm">

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

            {filtered.map(c => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{c.address}</td>

                <td className="p-3 text-center">
                  <button
                    onClick={()=>deleteCustomer(c.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
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