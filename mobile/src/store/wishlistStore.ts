import { create } from 'zustand';
import api from '../lib/api';
import { WishlistItem } from '../types';

interface WishlistState {
  items: WishlistItem[];
  count: number;
  isLoading: boolean;
  error: string | null;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  fetchCount: () => Promise<void>;
  clearError: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  count: 0,
  isLoading: false,
  error: null,

  fetchWishlist: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/wishlist');
      const items = response.data.items || response.data;
      set({
        items,
        count: items.length,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch wishlist',
        isLoading: false,
      });
    }
  },

  addToWishlist: async (productId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/wishlist', { productId });
      await get().fetchWishlist();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to add to wishlist',
        isLoading: false,
      });
      throw error;
    }
  },

  removeFromWishlist: async (itemId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/wishlist/${itemId}`);
      await get().fetchWishlist();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to remove from wishlist',
        isLoading: false,
      });
    }
  },

  fetchCount: async () => {
    try {
      const response = await api.get('/wishlist');
      const items = response.data.items || response.data;
      set({ count: items.length });
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
