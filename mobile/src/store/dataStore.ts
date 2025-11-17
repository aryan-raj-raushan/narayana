import { create } from 'zustand';
import api from '../lib/api';
import { Gender, Category, Subcategory, Product, Offer } from '../types';

interface DataState {
  genders: Gender[];
  categories: Category[];
  subcategories: Subcategory[];
  featuredProducts: Product[];
  offers: Offer[];
  isLoading: boolean;
  error: string | null;
  fetchGenders: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchSubcategories: () => Promise<void>;
  fetchFeaturedProducts: (limit?: number) => Promise<void>;
  fetchOffers: () => Promise<void>;
  clearError: () => void;
}

export const useDataStore = create<DataState>((set) => ({
  genders: [],
  categories: [],
  subcategories: [],
  featuredProducts: [],
  offers: [],
  isLoading: false,
  error: null,

  fetchGenders: async () => {
    try {
      const response = await api.get('/gender');
      set({ genders: response.data });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch genders' });
    }
  },

  fetchCategories: async () => {
    try {
      const response = await api.get('/category');
      set({ categories: response.data });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch categories' });
    }
  },

  fetchSubcategories: async () => {
    try {
      const response = await api.get('/subcategory');
      set({ subcategories: response.data });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch subcategories' });
    }
  },

  fetchFeaturedProducts: async (limit = 10) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/product?limit=${limit}`);
      set({ featuredProducts: response.data.products || response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch products',
        isLoading: false,
      });
    }
  },

  fetchOffers: async () => {
    try {
      const response = await api.get('/offer');
      set({ offers: response.data });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch offers' });
    }
  },

  clearError: () => set({ error: null }),
}));
