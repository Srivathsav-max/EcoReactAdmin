import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (data: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const useCart = create(
  persist<CartStore>((set, get) => ({
    items: [],
    addItem: (data: CartItem) => {
      const currentItems = get().items;
      const existingItem = currentItems.find((item) => item.id === data.id);
      
      if (existingItem) {
        const updatedItems = currentItems.map((item) => {
          if (item.id === data.id) {
            return {
              ...item,
              quantity: item.quantity + 1
            };
          }
          return item;
        });
        set({ items: updatedItems });
        toast.success('Item quantity updated in cart');
      } else {
        set({ items: [...currentItems, { ...data, quantity: 1 }] });
        toast.success('Item added to cart');
      }
    },
    removeItem: (id: string) => {
      set({ items: get().items.filter((item) => item.id !== id) });
      toast.success('Item removed from cart');
    },
    updateQuantity: (id: string, quantity: number) => {
      if (quantity < 1) {
        return;
      }
      set({
        items: get().items.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              quantity
            };
          }
          return item;
        })
      });
    },
    clearCart: () => set({ items: [] })
  }), {
    name: 'cart-storage',
    storage: createJSONStorage(() => localStorage)
  })
);

export default useCart;
