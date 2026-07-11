import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, ProductVariation } from '../types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, variation?: ProductVariation, quantity?: number) => void;
  removeItem: (productId: string, variationId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variationId?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, variation, quantity = 1) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (item) =>
            item.product.id === product.id &&
            item.variation?.id === variation?.id
        );

        if (existingIndex > -1) {
          const newItems = [...items];
          newItems[existingIndex].quantity += quantity;
          set({ items: newItems });
        } else {
          set({ items: [...items, { product, variation, quantity }] });
        }
      },

      removeItem: (productId, variationId) => {
        const { items } = get();
        set({
          items: items.filter(
            (item) =>
              !(
                item.product.id === productId &&
                item.variation?.id === variationId
              )
          ),
        });
      },

      updateQuantity: (productId, quantity, variationId) => {
        const { items } = get();
        if (quantity <= 0) {
          get().removeItem(productId, variationId);
          return;
        }

        const newItems = items.map((item) =>
          item.product.id === productId && item.variation?.id === variationId
            ? { ...item, quantity }
            : item
        );
        set({ items: newItems });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price =
            item.variation?.price_override ?? item.product.price;
          return total + price * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
