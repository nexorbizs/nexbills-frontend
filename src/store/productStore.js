import { create } from "zustand";

export const useProductStore = create((set, get) => ({

  products: [],

  loadProducts: () => {
    const currentUser =
      JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
      set({ products: [] });
      return;
    }

    const allProducts =
      JSON.parse(localStorage.getItem("products")) || [];

    const filtered =
      allProducts.filter(p => p.companyId === currentUser.id);

    set({ products: filtered });
  },

  addProduct: (product) => {
    const all =
      JSON.parse(localStorage.getItem("products")) || [];

    localStorage.setItem(
      "products",
      JSON.stringify([...all, product])
    );

    get().loadProducts();
  },

  deleteProduct: (id) => {
    const all =
      JSON.parse(localStorage.getItem("products")) || [];

    const updated = all.filter(p => p.id !== id);

    localStorage.setItem("products", JSON.stringify(updated));

    get().loadProducts();
  },

  // ⭐ NEW → STOCK STEPPER
  updateStock: (id, change) => {

    const all =
      JSON.parse(localStorage.getItem("products")) || [];

    const updated = all.map(p => {

      if (p.id === id) {

        let newStock = p.stock + change;

        if (newStock < 0)
          newStock = 0;

        return {
          ...p,
          stock: newStock
        };
      }

      return p;
    });

    localStorage.setItem("products", JSON.stringify(updated));

    get().loadProducts();
  },

  // ⭐ USED IN BILLING
  reduceStock: (id, soldQty) => {

    const all =
      JSON.parse(localStorage.getItem("products")) || [];

    const updated = all.map(p => {

      if (p.id === id) {

        if (p.stock < soldQty) {
          alert("Stock not available");
          return p;
        }

        return {
          ...p,
          stock: p.stock - soldQty
        };
      }

      return p;
    });

    localStorage.setItem("products", JSON.stringify(updated));

    get().loadProducts();
  }

}));