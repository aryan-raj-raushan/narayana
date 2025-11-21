import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../lib/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/user/login', { email, password });
      const { accessToken, user } = response.data;

      await SecureStore.setItemAsync('token', accessToken);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      set({ user, token: accessToken, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (name: string, email: string, password: string, phone?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/user/register', {
        name,
        email,
        password,
        phone,
      });
      const { accessToken, user } = response.data;

      await SecureStore.setItemAsync('token', accessToken);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      set({ user, token: accessToken, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
    set({ user: null, token: null });
  },

  loadFromStorage: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync('token');
      const userStr = await SecureStore.getItemAsync('user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ user, token, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
