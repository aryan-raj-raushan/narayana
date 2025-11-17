import { create } from 'zustand';
import { guestApi } from '@/lib/api';

interface GuestStore {
  guestId: string | null;
  isLoading: boolean;

  // Actions
  initGuestSession: () => Promise<string>;
  getGuestId: () => string | null;
  clearGuestSession: () => void;
  loadFromStorage: () => void;
}

export const useGuestStore = create<GuestStore>((set, get) => ({
  guestId: null,
  isLoading: false,

  initGuestSession: async () => {
    // Check if we already have a guestId
    let guestId = get().guestId;

    if (!guestId && typeof window !== 'undefined') {
      guestId = localStorage.getItem('guestId');
      if (guestId) {
        set({ guestId });
        return guestId;
      }
    }

    if (guestId) {
      return guestId;
    }

    // Generate new guest session
    set({ isLoading: true });
    try {
      const response = await guestApi.generateSession();
      const newGuestId = response.data.guestId;

      if (typeof window !== 'undefined') {
        localStorage.setItem('guestId', newGuestId);
      }

      set({ guestId: newGuestId, isLoading: false });
      return newGuestId;
    } catch (error) {
      console.error('Failed to generate guest session:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  getGuestId: () => {
    const state = get();
    if (state.guestId) return state.guestId;

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('guestId');
      if (stored) {
        set({ guestId: stored });
        return stored;
      }
    }
    return null;
  },

  clearGuestSession: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guestId');
    }
    set({ guestId: null });
  },

  loadFromStorage: () => {
    if (typeof window !== 'undefined') {
      const guestId = localStorage.getItem('guestId');
      if (guestId) {
        set({ guestId });
      }
    }
  },
}));
