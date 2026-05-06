import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  add: (product: Product, size?: string) => void;
  remove: (id: string, size: string) => void;
  setQty: (id: string, size: string, qty: number) => void;
  clear: () => void;
  toggle: (open?: boolean) => void;
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      add: (product, size = "M") =>
        set((s) => {
          const existing = s.items.find((i) => i.product.id === product.id && i.size === size);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i === existing ? { ...i, quantity: i.quantity + 1 } : i
              ),
              isOpen: true,
            };
          }
          return { items: [...s.items, { product, quantity: 1, size }], isOpen: true };
        }),
      remove: (id, size) =>
        set((s) => ({ items: s.items.filter((i) => !(i.product.id === id && i.size === size)) })),
      setQty: (id, size, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.product.id === id && i.size === size ? { ...i, quantity: qty } : i))
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      toggle: (open) => set((s) => ({ isOpen: open ?? !s.isOpen })),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
      subtotal: () => get().items.reduce((n, i) => n + i.quantity * i.product.price, 0),
    }),
    { name: "atelier-cart" }
  )
);
