import { create } from 'zustand';
import { User, Admin } from '@/types';
import { authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  admin: Admin | null;
  token: string | null;
  userType: 'user' | 'admin' | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loginAsUser: (email: string, password: string, guestId?: string | null) => Promise<void>;
  loginAsAdmin: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string, guestId?: string | null) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  admin: null,
  token: null,
  userType: null,
  isLoading: false,
  error: null,

  loginAsUser: async (email: string, password: string, guestId?: string | null) => {
    set({ isLoading: true, error: null });
    try {
      const loginData: { email: string; password: string; guestId?: string } = { email, password };
      if (guestId) {
        loginData.guestId = guestId;
      }

      const response = await authApi.userLogin(loginData);
      const { accessToken, user } = response.data;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userType', 'user');

      // Clear guest session after successful login (cart/wishlist merged on backend)
      if (guestId) {
        localStorage.removeItem('guestId');
      }

      set({
        token: accessToken,
        user,
        userType: 'user',
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Login failed',
        isLoading: false
      });
      throw error;
    }
  },

  loginAsAdmin: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.adminLogin({ email, password });
      const { accessToken, admin } = response.data;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(admin));
      localStorage.setItem('userType', 'admin');

      set({
        token: accessToken,
        admin,
        userType: 'admin',
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Login failed',
        isLoading: false
      });
      throw error;
    }
  },

  register: async (name: string, email: string, password: string, phone?: string, guestId?: string | null) => {
    set({ isLoading: true, error: null });
    try {
      const registerData: { name: string; email: string; password: string; phone?: string; guestId?: string } = {
        name,
        email,
        password,
      };
      if (phone) registerData.phone = phone;
      if (guestId) registerData.guestId = guestId;

      const response = await authApi.userRegister(registerData);
      const { accessToken, user } = response.data;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userType', 'user');

      // Clear guest session after successful registration (cart/wishlist merged on backend)
      if (guestId) {
        localStorage.removeItem('guestId');
      }

      set({
        token: accessToken,
        user,
        userType: 'user',
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Registration failed',
        isLoading: false
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    set({
      user: null,
      admin: null,
      token: null,
      userType: null,
      error: null,
    });
  },

  loadFromStorage: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const userType = localStorage.getItem('userType') as 'user' | 'admin' | null;

      if (token && userStr && userType) {
        const userData = JSON.parse(userStr);
        if (userType === 'admin') {
          set({ token, admin: userData, userType });
        } else {
          set({ token, user: userData, userType });
        }
      }
    }
  },

  clearError: () => set({ error: null }),
}));
