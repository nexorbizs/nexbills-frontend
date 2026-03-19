import { create } from "zustand";

export const useCartStore = create((set, get) => ({

  cart: [],

  /* ================= INIT ================= */

  initCart: () => {

    const company =
      JSON.parse(localStorage.getItem("company"));

    if (!company) {
      set({ cart: [] });
      return;
    }

    const saved =
      JSON.parse(localStorage.getItem(`billing_cart_${company.id}`)) || [];

    set({ cart: saved });

  },

  /* ================= SAVE ================= */

  saveCart: (cart) => {

    const company =
      JSON.parse(localStorage.getItem("company"));

    if (!company) return;

    localStorage.setItem(
      `billing_cart_${company.id}`,
      JSON.stringify(cart)
    );

    set({ cart });

  },

  /* ================= ADD ================= */

  addToCart: (product) => {

    const cart = get().cart;

    const exists = cart.find(i => i.id === product.id);

    let updated;

    if (exists) {
      updated = cart.map(i =>
        i.id === product.id
          ? { ...i, qty: i.qty + 1 }
          : i
      );
    } else {
      updated = [
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          cgst: Number(product.cgst) || 0,
          sgst: Number(product.sgst) || 0,
          qty: 1
        }
      ];
    }

    get().saveCart(updated);

  },

  /* ================= INCREASE ================= */

  increaseQty: (id) => {

    const updated = get().cart.map(i =>
      i.id === id ? { ...i, qty: i.qty + 1 } : i
    );

    get().saveCart(updated);

  },

  /* ================= DECREASE ================= */

  decreaseQty: (id) => {

    const updated = get().cart
      .map(i =>
        i.id === id
          ? { ...i, qty: i.qty - 1 }
          : i
      )
      .filter(i => i.qty > 0);

    get().saveCart(updated);

  },

  /* ================= CLEAR ================= */

  clearCart: () => {

    const company =
      JSON.parse(localStorage.getItem("company"));

    if (company) {
      localStorage.removeItem(`billing_cart_${company.id}`);
    }

    set({ cart: [] });

  }

}));