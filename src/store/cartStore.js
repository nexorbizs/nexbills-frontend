import { create } from "zustand";

export const useCartStore = create((set, get) => ({

  cart: [],
  companyId: null,

  // ⭐ Initialize cart for tenant
  initCart: () => {
    const currentUser =
      JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
      set({ cart: [], companyId: null });
      return;
    }

    if (get().companyId !== currentUser.id) {
      set({
        cart: [],
        companyId: currentUser.id
      });
    }
  },

  addToCart: (product) => {

    get().initCart();

    const existing = get().cart.find(i => i.id === product.id);

    if (existing) {
      set({
        cart: get().cart.map(i =>
          i.id === product.id
            ? { ...i, qty: i.qty + 1 }
            : i
        )
      });
    } else {
      set({
        cart: [...get().cart, { ...product, qty: 1 }]
      });
    }
  },

  increaseQty: (id) => {
    set({
      cart: get().cart.map(i =>
        i.id === id ? { ...i, qty: i.qty + 1 } : i
      )
    });
  },

  decreaseQty: (id) => {
    const item = get().cart.find(i => i.id === id);

    if (item.qty === 1) {
      set({
        cart: get().cart.filter(i => i.id !== id)
      });
    } else {
      set({
        cart: get().cart.map(i =>
          i.id === id ? { ...i, qty: i.qty - 1 } : i
        )
      });
    }
  },

  clearCart: () => set({ cart: [] })

}));