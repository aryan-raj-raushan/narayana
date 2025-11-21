import { create } from 'zustand';
import { genderApi, categoryApi, subcategoryApi, productApi, offerApi } from '../lib/api';
import { Gender, Category, Subcategory, Product, Offer } from '../types';

interface DataState {
  // Data
  genders: Gender[];
  allSubcategories: Subcategory[];
  categoriesByGender: Record<string, Category[]>;
  subcategoriesByCategory: Record<string, Subcategory[]>;
  featuredProducts: Product[];
  homepageOffers: Offer[];

  // Loading states
  isLoadingGenders: boolean;
  isLoadingSubcategories: boolean;
  isLoadingCategories: boolean;
  isLoadingProducts: boolean;
  isLoadingOffers: boolean;

  // Error
  error: string | null;

  // Actions
  fetchGenders: () => Promise<Gender[]>;
  fetchAllSubcategories: () => Promise<Subcategory[]>;
  fetchCategoriesByGender: (genderId: string) => Promise<Category[]>;
  fetchSubcategoriesByCategory: (categoryId: string) => Promise<Subcategory[]>;
  fetchFeaturedProducts: (limit?: number) => Promise<Product[]>;
  fetchHomepageOffers: () => Promise<Offer[]>;
  clearError: () => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  // Initial state
  genders: [],
  allSubcategories: [],
  categoriesByGender: {},
  subcategoriesByCategory: {},
  featuredProducts: [],
  homepageOffers: [],

  isLoadingGenders: false,
  isLoadingSubcategories: false,
  isLoadingCategories: false,
  isLoadingProducts: false,
  isLoadingOffers: false,

  error: null,

  // Fetch genders with caching
  fetchGenders: async () => {
    const state = get();
    if (state.genders.length > 0) {
      return state.genders; // Return cached data
    }

    set({ isLoadingGenders: true, error: null });
    try {
      const response = await genderApi.getAll({ isActive: true });
      const genders = response.data.data || response.data;
      set({ genders, isLoadingGenders: false });
      return genders;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch genders';
      set({ error: errorMsg, isLoadingGenders: false });
      throw error;
    }
  },

  // Fetch all subcategories with caching
  fetchAllSubcategories: async () => {
    const state = get();
    if (state.allSubcategories.length > 0) {
      return state.allSubcategories; // Return cached data
    }

    set({ isLoadingSubcategories: true, error: null });
    try {
      const response = await subcategoryApi.getAll({ isActive: true, limit: 100 });
      const subcategories = response.data.data || response.data;
      set({ allSubcategories: subcategories, isLoadingSubcategories: false });
      return subcategories;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch subcategories';
      set({ error: errorMsg, isLoadingSubcategories: false });
      throw error;
    }
  },

  // Fetch categories by gender with caching
  fetchCategoriesByGender: async (genderId: string) => {
    const state = get();
    if (state.categoriesByGender[genderId]) {
      return state.categoriesByGender[genderId]; // Return cached data
    }

    set({ isLoadingCategories: true, error: null });
    try {
      const response = await categoryApi.getByGender(genderId);
      const categories = response.data.data || response.data;
      set({
        categoriesByGender: { ...state.categoriesByGender, [genderId]: categories },
        isLoadingCategories: false,
      });
      return categories;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch categories';
      set({ error: errorMsg, isLoadingCategories: false });
      throw error;
    }
  },

  // Fetch subcategories by category with caching
  fetchSubcategoriesByCategory: async (categoryId: string) => {
    const state = get();
    if (state.subcategoriesByCategory[categoryId]) {
      return state.subcategoriesByCategory[categoryId]; // Return cached data
    }

    set({ isLoadingSubcategories: true, error: null });
    try {
      const response = await subcategoryApi.getByCategory(categoryId);
      const subcategories = response.data.data || response.data;
      set({
        subcategoriesByCategory: { ...state.subcategoriesByCategory, [categoryId]: subcategories },
        isLoadingSubcategories: false,
      });
      return subcategories;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch subcategories';
      set({ error: errorMsg, isLoadingSubcategories: false });
      throw error;
    }
  },

  // Fetch featured products
  fetchFeaturedProducts: async (limit = 8) => {
    set({ isLoadingProducts: true, error: null });
    try {
      const response = await productApi.getFeatured(limit);
      const products = response.data.data || response.data;
      set({ featuredProducts: products, isLoadingProducts: false });
      return products;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch products';
      set({ error: errorMsg, isLoadingProducts: false });
      throw error;
    }
  },

  // Fetch homepage offers
  fetchHomepageOffers: async () => {
    const state = get();
    if (state.homepageOffers.length > 0) {
      return state.homepageOffers; // Return cached data
    }

    set({ isLoadingOffers: true, error: null });
    try {
      const response = await offerApi.getHomepage();
      const offers = response.data.data || response.data;
      set({ homepageOffers: offers, isLoadingOffers: false });
      return offers;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch offers';
      set({ error: errorMsg, isLoadingOffers: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

