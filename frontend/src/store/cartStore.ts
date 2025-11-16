import { create } from 'zustand';
import { CartItem } from '@/types';
import { cartApi } from '@/lib/api';

interface CartState {
  items: CartItem[];
  count: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  fetchCount: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  clearError: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  count: 0,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartApi.get();
      set({ items: response.data, isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to fetch cart',
        isLoading: false
      });
    }
  },

  fetchCount: async () => {
    try {
      const response = await cartApi.getCount();
      set({ count: response.data.count || 0 });
    } catch {
      // Silently fail for count
    }
  },

  addToCart: async (productId: string, quantity: number = 1) => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.add({ productId, quantity });
      const response = await cartApi.get();
      const countResponse = await cartApi.getCount();
      set({
        items: response.data,
        count: countResponse.data.count || 0,
        isLoading: false
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to add to cart',
        isLoading: false
      });
      throw error;
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.update(itemId, quantity);
      const response = await cartApi.get();
      set({ items: response.data, isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to update cart',
        isLoading: false
      });
      throw error;
    }
  },

  removeFromCart: async (itemId: string) => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.remove(itemId);
      const response = await cartApi.get();
      const countResponse = await cartApi.getCount();
      set({
        items: response.data,
        count: countResponse.data.count || 0,
        isLoading: false
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to remove from cart',
        isLoading: false
      });
      throw error;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.clear();
      set({ items: [], count: 0, isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to clear cart',
        isLoading: false
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
