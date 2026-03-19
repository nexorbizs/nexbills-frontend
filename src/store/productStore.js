import { create } from "zustand";
import API from "../api";

export const useProductStore = create((set, get) => ({

  products: [],
  loading: false,
  error: null,

  /* ================= LOAD PRODUCTS ================= */
  loadProducts: async () => {
    try {
      set({ loading: true });

      const res = await API.get("/products");

      set({
        products: res.data || [],
        loading: false
      });

    } catch (err) {

      set({
        error: err.response?.data?.error || "Load failed",
        loading: false
      });

    }
  },

  /* ================= ADD PRODUCT ================= */
  addProduct: async (data) => {

    try {

      const res = await API.post("/products", data);

      set(state => ({
        products: [res.data, ...state.products]
      }));

      window.dispatchEvent(new Event("productUpdated"));

    } catch (err) {

      alert(err.response?.data?.error || "Add failed");

    }
  },

  /* ================= DELETE PRODUCT ================= */
  deleteProduct: async (id) => {

    const prev = get().products;

    set({
      products: prev.filter(p => p.id !== id)
    });

    try {

      await API.delete(`/products/${id}`);

      window.dispatchEvent(new Event("productUpdated"));

    } catch (err) {

      alert("Delete failed");

      set({ products: prev }); // rollback

    }
  },

  /* ================= UPDATE STOCK ================= */
  updateStock: async (id, change) => {

    const products = get().products;

    const target = products.find(p => p.id === id);

    if (!target) return;

    if (target.stock + change < 0) {
      alert("Stock cannot be negative");
      return;
    }

    const updated = products.map(p =>
      p.id === id
        ? { ...p, stock: p.stock + change }
        : p
    );

    set({ products: updated });

    try {

      await API.put(`/products/stock/${id}`, {
        change
      });

      window.dispatchEvent(new Event("productUpdated"));

    } catch {

      alert("Stock update failed");

      set({ products }); // rollback

    }
  }

}));