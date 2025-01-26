'use client';

import { create } from 'zustand';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  storeId?: string;
}

interface AuthStore {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  signOut: async () => {
    try {
      const currentUser = useAuth.getState().user;
      
      if (currentUser?.role === 'admin') {
        await axios.post('/api/auth/signout');
        set({ user: null });
        window.location.href = '/signin';
      } else if (currentUser?.role === 'customer') {
        // Get domain from current URL for customer signout
        const domain = window.location.hostname;
        await axios.post(`/api/auth/customer/signout?domain=${domain}`);
        set({ user: null });
        window.location.href = `/store/${domain}/signin`;
      }
    } catch (error) {
      toast.error('Error signing out');
    }
  },
}));

// Hook for checking auth state on component mount
export function useAuthCheck() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/session');
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    }
  };

  return { user, checkAuth };
}

// Hook for customer auth state
export function useCustomerAuth(storeId: string) {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const checkCustomerAuth = async () => {
    try {
      const response = await axios.get(`/api/auth/customer/session?storeId=${storeId}`);
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    }
  };

  return { user, checkCustomerAuth };
}