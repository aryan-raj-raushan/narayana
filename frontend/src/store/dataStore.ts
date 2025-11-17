import { create } from 'zustand';
import { Gender, Category, Subcategory, Product } from '@/types';
import { genderApi, categoryApi, subcategoryApi, productApi } from '@/lib/api';

interface DataStore {
  // Data
  genders: Gender[];
  allSubcategories: Subcategory[];
  featuredProducts: Product[];
  categoriesByGender: Record<string, Category[]>;
  subcategoriesByCategory: Record<string, Subcategory[]>;

  // Loading states
  isLoadingGenders: boolean;
  isLoadingSubcategories: boolean;
  isLoadingProducts: boolean;

  // Timestamps for cache invalidation
  lastFetchTime: Record<string, number>;

  // Actions
  fetchGenders: () => Promise<Gender[]>;
  fetchAllSubcategories: () => Promise<Subcategory[]>;
  fetchFeaturedProducts: (limit?: number) => Promise<Product[]>;
  fetchCategoriesByGender: (genderId: string) => Promise<Category[]>;
  fetchSubcategoriesByCategory: (categoryId: string) => Promise<Subcategory[]>;

  // Preload all essential data
  preloadEssentialData: () => Promise<void>;

  // Clear cache
  clearCache: () => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

export const useDataStore = create<DataStore>((set, get) => ({
  // Initial state
  genders: [],
  allSubcategories: [],
  featuredProducts: [],
  categoriesByGender: {},
  subcategoriesByCategory: {},

  isLoadingGenders: false,
  isLoadingSubcategories: false,
  isLoadingProducts: false,

  lastFetchTime: {},

  fetchGenders: async () => {
    const state = get();
    const cacheKey = 'genders';
    const now = Date.now();

    // Return cached data if fresh
    if (
      state.genders.length > 0 &&
      state.lastFetchTime[cacheKey] &&
      now - state.lastFetchTime[cacheKey] < CACHE_TTL
    ) {
      return state.genders;
    }

    // Prevent duplicate fetches
    if (state.isLoadingGenders) {
      // Wait for existing fetch to complete
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          const currentState = get();
          if (!currentState.isLoadingGenders) {
            clearInterval(checkInterval);
            resolve(currentState.genders);
          }
        }, 50);
      });
    }

    set({ isLoadingGenders: true });

    try {
      const response = await genderApi.getAll({ isActive: true });
      const data = response.data.data || response.data || [];

      set({
        genders: data,
        isLoadingGenders: false,
        lastFetchTime: { ...get().lastFetchTime, [cacheKey]: now },
      });

      return data;
    } catch (error) {
      console.error('Failed to fetch genders:', error);
      set({ isLoadingGenders: false });
      return state.genders;
    }
  },

  fetchAllSubcategories: async () => {
    const state = get();
    const cacheKey = 'allSubcategories';
    const now = Date.now();

    // Return cached data if fresh
    if (
      state.allSubcategories.length > 0 &&
      state.lastFetchTime[cacheKey] &&
      now - state.lastFetchTime[cacheKey] < CACHE_TTL
    ) {
      return state.allSubcategories;
    }

    // Prevent duplicate fetches
    if (state.isLoadingSubcategories) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          const currentState = get();
          if (!currentState.isLoadingSubcategories) {
            clearInterval(checkInterval);
            resolve(currentState.allSubcategories);
          }
        }, 50);
      });
    }

    set({ isLoadingSubcategories: true });

    try {
      const response = await subcategoryApi.getAll({ isActive: true, limit: 100 });
      const data = response.data.data || response.data || [];

      set({
        allSubcategories: data,
        isLoadingSubcategories: false,
        lastFetchTime: { ...get().lastFetchTime, [cacheKey]: now },
      });

      return data;
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
      set({ isLoadingSubcategories: false });
      return state.allSubcategories;
    }
  },

  fetchFeaturedProducts: async (limit = 8) => {
    const state = get();
    const cacheKey = `featuredProducts:${limit}`;
    const now = Date.now();

    // Return cached data if fresh
    if (
      state.featuredProducts.length > 0 &&
      state.lastFetchTime[cacheKey] &&
      now - state.lastFetchTime[cacheKey] < CACHE_TTL
    ) {
      return state.featuredProducts;
    }

    // Prevent duplicate fetches
    if (state.isLoadingProducts) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          const currentState = get();
          if (!currentState.isLoadingProducts) {
            clearInterval(checkInterval);
            resolve(currentState.featuredProducts);
          }
        }, 50);
      });
    }

    set({ isLoadingProducts: true });

    try {
      const response = await productApi.getAll({ limit, isActive: true });
      const data = response.data.data || response.data || [];

      set({
        featuredProducts: data,
        isLoadingProducts: false,
        lastFetchTime: { ...get().lastFetchTime, [cacheKey]: now },
      });

      return data;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      set({ isLoadingProducts: false });
      return state.featuredProducts;
    }
  },

  fetchCategoriesByGender: async (genderId: string) => {
    const state = get();
    const cacheKey = `categories:${genderId}`;
    const now = Date.now();

    // Return cached data if fresh
    if (
      state.categoriesByGender[genderId] &&
      state.lastFetchTime[cacheKey] &&
      now - state.lastFetchTime[cacheKey] < CACHE_TTL
    ) {
      return state.categoriesByGender[genderId];
    }

    try {
      const response = await categoryApi.getByGender(genderId);
      const data = response.data || [];

      set({
        categoriesByGender: {
          ...get().categoriesByGender,
          [genderId]: data,
        },
        lastFetchTime: { ...get().lastFetchTime, [cacheKey]: now },
      });

      return data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return state.categoriesByGender[genderId] || [];
    }
  },

  fetchSubcategoriesByCategory: async (categoryId: string) => {
    const state = get();
    const cacheKey = `subcategories:${categoryId}`;
    const now = Date.now();

    // Return cached data if fresh
    if (
      state.subcategoriesByCategory[categoryId] &&
      state.lastFetchTime[cacheKey] &&
      now - state.lastFetchTime[cacheKey] < CACHE_TTL
    ) {
      return state.subcategoriesByCategory[categoryId];
    }

    try {
      const response = await subcategoryApi.getByCategory(categoryId);
      const data = response.data || [];

      set({
        subcategoriesByCategory: {
          ...get().subcategoriesByCategory,
          [categoryId]: data,
        },
        lastFetchTime: { ...get().lastFetchTime, [cacheKey]: now },
      });

      return data;
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
      return state.subcategoriesByCategory[categoryId] || [];
    }
  },

  preloadEssentialData: async () => {
    const state = get();

    // Only preload if not already loaded
    const promises: Promise<unknown>[] = [];

    if (state.genders.length === 0) {
      promises.push(get().fetchGenders());
    }

    if (state.allSubcategories.length === 0) {
      promises.push(get().fetchAllSubcategories());
    }

    if (state.featuredProducts.length === 0) {
      promises.push(get().fetchFeaturedProducts());
    }

    await Promise.all(promises);
  },

  clearCache: () => {
    set({
      genders: [],
      allSubcategories: [],
      featuredProducts: [],
      categoriesByGender: {},
      subcategoriesByCategory: {},
      lastFetchTime: {},
    });
  },
}));
