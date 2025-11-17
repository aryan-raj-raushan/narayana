import { create } from 'zustand';
import { WishlistItem } from '@/types';
import { wishlistApi, guestApi } from '@/lib/api';

interface WishlistState {
  items: WishlistItem[];
  count: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWishlist: (guestId?: string | null) => Promise<void>;
  fetchCount: (guestId?: string | null) => Promise<void>;
  addToWishlist: (productId: string, guestId?: string | null) => Promise<void>;
  removeFromWishlist: (itemId: string, productId?: string, guestId?: string | null) => Promise<void>;
  checkInWishlist: (productId: string, guestId?: string | null) => Promise<boolean>;
  clearWishlist: (guestId?: string | null) => Promise<void>;
  moveToCart: (itemId: string, productId: string, guestId?: string | null) => Promise<void>;
  clearError: () => void;
  resetWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set) => ({
  items: [],
  count: 0,
  isLoading: false,
  error: null,

  fetchWishlist: async (guestId?: string | null) => {
    set({ isLoading: true, error: null });
    try {
      let response;
      if (guestId) {
        response = await guestApi.getWishlist(guestId);
        set({ items: response.data.items || [], isLoading: false });
      } else {
        response = await wishlistApi.get();
        set({ items: response.data, isLoading: false });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to fetch wishlist',
        isLoading: false
      });
    }
  },

  fetchCount: async (guestId?: string | null) => {
    try {
      let response;
      if (guestId) {
        response = await guestApi.getWishlistCount(guestId);
      } else {
        response = await wishlistApi.getCount();
      }
      set({ count: response.data.count || 0 });
    } catch {
      // Silently fail for count
    }
  },

  addToWishlist: async (productId: string, guestId?: string | null) => {
    set({ isLoading: true, error: null });
    try {
      if (guestId) {
        await guestApi.addToWishlist({ guestId, productId });
        const response = await guestApi.getWishlist(guestId);
        const countResponse = await guestApi.getWishlistCount(guestId);
        set({
          items: response.data.items || [],
          count: countResponse.data.count || 0,
          isLoading: false
        });
      } else {
        await wishlistApi.add(productId);
        const response = await wishlistApi.get();
        const countResponse = await wishlistApi.getCount();
        set({
          items: response.data,
          count: countResponse.data.count || 0,
          isLoading: false
        });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to add to wishlist',
        isLoading: false
      });
      throw error;
    }
  },

  removeFromWishlist: async (itemId: string, productId?: string, guestId?: string | null) => {
    set({ isLoading: true, error: null });
    try {
      if (guestId && productId) {
        await guestApi.removeFromWishlist(guestId, productId);
        const response = await guestApi.getWishlist(guestId);
        const countResponse = await guestApi.getWishlistCount(guestId);
        set({
          items: response.data.items || [],
          count: countResponse.data.count || 0,
          isLoading: false
        });
      } else {
        await wishlistApi.remove(itemId);
        const response = await wishlistApi.get();
        const countResponse = await wishlistApi.getCount();
        set({
          items: response.data,
          count: countResponse.data.count || 0,
          isLoading: false
        });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to remove from wishlist',
        isLoading: false
      });
      throw error;
    }
  },

  checkInWishlist: async (productId: string, guestId?: string | null) => {
    try {
      if (guestId) {
        const response = await guestApi.checkInWishlist(guestId, productId);
        return response.data.inWishlist || false;
      } else {
        const response = await wishlistApi.check(productId);
        return response.data.inWishlist || false;
      }
    } catch {
      return false;
    }
  },

  clearWishlist: async (guestId?: string | null) => {
    set({ isLoading: true, error: null });
    try {
      if (guestId) {
        await guestApi.clearWishlist(guestId);
      } else {
        await wishlistApi.clear();
      }
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

  moveToCart: async (itemId: string, productId: string, guestId?: string | null) => {
    set({ isLoading: true, error: null });
    try {
      if (guestId) {
        await guestApi.moveWishlistToCart(guestId, productId);
        const response = await guestApi.getWishlist(guestId);
        const countResponse = await guestApi.getWishlistCount(guestId);
        set({
          items: response.data.items || [],
          count: countResponse.data.count || 0,
          isLoading: false
        });
      } else {
        // For logged-in users, we need to add to cart and remove from wishlist
        throw new Error('Move to cart not implemented for logged-in users');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to move to cart',
        isLoading: false
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  resetWishlist: () => set({ items: [], count: 0, error: null }),
}));
