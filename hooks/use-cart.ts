import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { getCurrentCustomer } from '@/lib/get-customer';

export interface CartItem {
  id: string;
  orderId: string;
  variant: {
    id: string;
    name: string;
    price: number;
    images: Array<{ url: string }>;
    product: {
      name: string;
    }
  };
  quantity: number;
}

interface Cart {
  id: string;
  orderItems: CartItem[];
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  customerId: string | null;
  storeId: string | null;
  addItem: (variantId: string | { id: string, [key: string]: any }) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  fetchCart: () => Promise<void>;
}

const useCart = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,
  customerId: null as string | null,
  storeId: null as string | null,

  fetchCart: async () => {
    const currentState = get();
    if (currentState.isLoading) return; // Prevent multiple simultaneous fetches
    
    try {
      set({ isLoading: true });
      
      // Get domain from URL (/store/[domain]/...)
      const pathParts = window.location.pathname.split('/');
      const domain = pathParts[2];
      
      if (!domain) {
        console.error('No domain found in URL');
        return;
      }

      // Get customer information first
      const customer = await getCurrentCustomer(domain);
      console.log('Customer data:', customer); // Debug log
      
      if (!customer) {
        console.log('No customer found - user needs to sign in');
        set({ items: [], customerId: null, storeId: null });
        return;
      }

      if (!customer.storeId) {
        console.error('Customer found but no storeId:', customer);
        set({ items: [], customerId: customer.id, storeId: null });
        return;
      }

      console.log('Setting customer data:', { customerId: customer.id, storeId: customer.storeId });
      set({ customerId: customer.id, storeId: customer.storeId });

      console.log('Using storeId:', customer.storeId); // Debug log
      const response = await axios.get(`/api/storefront/${customer.storeId}/cart`);
      console.log('Cart response:', response.data); // Debug log
      
      console.log('Cart fetch response:', response.data);
      if (response.data?.orderItems) {
        console.log('Setting cart items:', response.data.orderItems);
        set({ 
          items: response.data.orderItems,
          storeId: response.data.storeId,
          customerId: response.data.customerId
        });
      } else {
        console.log('Setting empty cart');
        set({ items: [], storeId: customer?.storeId || null, customerId: customer?.id || null });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Error fetching cart');
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (variantId: string | { id: string, [key: string]: any }) => {
    try {
      set({ isLoading: true });
      const currentState = get();
      if (!currentState.storeId) {
        // Try to get customer info if we don't have it
        const pathParts = window.location.pathname.split('/');
        const domain = pathParts[2];
      const customer = await getCurrentCustomer(domain);
      console.log('Customer data for add:', customer); // Debug log
      
      if (!customer) {
        toast.error('Please sign in to add items to cart');
        console.log('No storeId found for adding item'); // Debug log
          return;
        }
        set({ customerId: customer.id, storeId: customer.storeId });
      }

      const variantToUse = typeof variantId === 'object' ? variantId.id : variantId;
      const response = await axios.post(`/api/storefront/${get().storeId}/cart`, {
        variantId: variantToUse,
        quantity: 1
      });
      console.log('Add item response:', response.data);
      if (response.data?.orderItems) {
        set({
          items: response.data.orderItems,
          storeId: response.data.storeId,
          customerId: response.data.customerId
        });
      } else {
        set({ items: [] });
      }
      toast.success('Item added to cart');
    } catch (error) {
      toast.error('Error adding item to cart');
    } finally {
      set({ isLoading: false });
    }
  },

  removeItem: async (itemId: string) => {
    try {
      set({ isLoading: true });
      const currentState = get();
      if (!currentState.storeId) {
        // Try to get customer info if we don't have it
        const pathParts = window.location.pathname.split('/');
        const domain = pathParts[2];
        const customer = await getCurrentCustomer(domain);
        
        if (!customer) {
          toast.error('Please sign in to remove items from cart');
          return;
        }
        set({ customerId: customer.id, storeId: customer.storeId });
      }

      const response = await axios.delete(`/api/storefront/${get().storeId}/cart?itemId=${itemId}`);
      console.log('Remove item response:', response.data);
      if (response.data?.orderItems) {
        set({
          items: response.data.orderItems,
          storeId: response.data.storeId,
          customerId: response.data.customerId
        });
      } else {
        set({ items: [] });
      }
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Error removing item from cart');
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    try {
      set({ isLoading: true });
      const currentState = get();
      if (!currentState.storeId) {
        // Try to get customer info if we don't have it
        const pathParts = window.location.pathname.split('/');
        const domain = pathParts[2];
        const customer = await getCurrentCustomer(domain);
        
        if (!customer) {
          toast.error('Please sign in to update cart');
          return;
        }
        set({ customerId: customer.id, storeId: customer.storeId });
      }

      const response = await axios.patch(`/api/storefront/${get().storeId}/cart`, {
        itemId,
        quantity
      });
      console.log('Update quantity response:', response.data);
      if (response.data?.orderItems) {
        set({
          items: response.data.orderItems,
          storeId: response.data.storeId,
          customerId: response.data.customerId
        });
      } else {
        set({ items: [] });
      }
      toast.success('Cart updated');
    } catch (error) {
      toast.error('Error updating cart');
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useCart;
