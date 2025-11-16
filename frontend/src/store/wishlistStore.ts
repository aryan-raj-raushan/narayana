import { create } from 'zustand';
import { WishlistItem } from '@/types';
import { wishlistApi } from '@/lib/api';

interface WishlistState {
  items: WishlistItem[];
  count: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWishlist: () => Promise<void>;
  fetchCount: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  checkInWishlist: (productId: string) => Promise<boolean>;
  clearWishlist: () => Promise<void>;
  clearError: () => void;
}

export const useWishlistStore = create<WishlistState>((set) => ({
  items: [],
  count: 0,
  isLoading: false,
  error: null,

  fetchWishlist: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await wishlistApi.get();
      set({ items: response.data, isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to fetch wishlist',
        isLoading: false
      });
    }
  },

  fetchCount: async () => {
    try {
      const response = await wishlistApi.getCount();
      set({ count: response.data.count || 0 });
    } catch {
      // Silently fail for count
    }
  },

  addToWishlist: async (productId: string) => {
    set({ isLoading: true, error: null });
    try {
      await wishlistApi.add(productId);
      const response = await wishlistApi.get();
      const countResponse = await wishlistApi.getCount();
      set({
        items: response.data,
        count: countResponse.data.count || 0,
        isLoading: false
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to add to wishlist',
        isLoading: false
      });
      throw error;
    }
  },

  removeFromWishlist: async (itemId: string) => {
    set({ isLoading: true, error: null });
    try {
      await wishlistApi.remove(itemId);
      const response = await wishlistApi.get();
      const countResponse = await wishlistApi.getCount();
      set({
        items: response.data,
        count: countResponse.data.count || 0,
        isLoading: false
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to remove from wishlist',
        isLoading: false
      });
      throw error;
    }
  },

  checkInWishlist: async (productId: string) => {
    try {
      const response = await wishlistApi.check(productId);
      return response.data.inWishlist || false;
    } catch {
      return false;
    }
  },

  clearWishlist: async () => {
    set({ isLoading: true, error: null });
    try {
      await wishlistApi.clear();
      set({ items: [], count: 0, isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to clear wishlist',
        isLoading: false
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
