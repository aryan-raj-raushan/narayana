import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../lib/theme';
import api from '../lib/api';
import { Product, Gender, Category, Subcategory } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { SearchBar } from '../components/common/SearchBar';
import { CustomBottomSheet } from '../components/common/CustomBottomSheet';
import { CustomDropdown } from '../components/common/CustomDropdown';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';

const { width } = Dimensions.get('window');

export const ProductsScreen = ({ navigation, route }: any) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState(route.params?.subcategoryId || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const { genders, categories, subcategories, fetchGenders, fetchCategories, fetchSubcategories } = useDataStore();
  const { addToCart } = useCartStore();
  const { addToWishlist } = useWishlistStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchGenders();
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchProducts = useCallback(async (pageNum = 1) => {
    setIsLoading(pageNum === 1);
    try {
      let url = `/product?page=${pageNum}&limit=10`;
      if (selectedGender) url += `&genderId=${selectedGender}`;
      if (selectedCategory) url += `&categoryId=${selectedCategory}`;
      if (selectedSubcategory) url += `&subcategoryId=${selectedSubcategory}`;
      if (minPrice) url += `&minPrice=${minPrice}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;

      const response = await api.get(url);
      const data = response.data;

      if (pageNum === 1) {
        setProducts(data.products || data);
      } else {
        setProducts((prev) => [...prev, ...(data.products || data)]);
      }
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [selectedGender, selectedCategory, selectedSubcategory, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts(1);
    setPage(1);
  }, [selectedGender, selectedCategory, selectedSubcategory, minPrice, maxPrice]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchProducts(1);
  };

  const handleLoadMore = () => {
    if (page < totalPages && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleAddToWishlist = async (productId: string) => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    try {
      await addToWishlist(productId);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const clearFilters = () => {
    setSelectedGender('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setMinPrice('');
    setMaxPrice('');
  };

  const genderOptions = [
    { label: 'All Genders', value: '' },
    ...genders.map((g) => ({ label: g.name, value: g._id })),
  ];

  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...categories
      .filter((c) => !selectedGender || c.genderId === selectedGender)
      .map((c) => ({ label: c.name, value: c._id })),
  ];

  const subcategoryOptions = [
    { label: 'All Subcategories', value: '' },
    ...subcategories
      .filter((s) => {
        const catId = typeof s.categoryId === 'string' ? s.categoryId : s.categoryId._id;
        return !selectedCategory || catId === selectedCategory;
      })
      .map((s) => ({ label: s.name, value: s._id })),
  ];

  if (isLoading && products.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Products</Text>
        <TouchableOpacity onPress={() => setShowFilters(true)}>
          <Ionicons name="filter-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchBar onProductSelect={(id) => navigation.navigate('ProductDetail', { productId: id })} />
      </View>

      {/* Quick Filters */}
      <View style={styles.quickFilters}>
        <TouchableOpacity
          style={[styles.quickFilterChip, !selectedSubcategory && styles.activeChip]}
          onPress={() => setSelectedSubcategory('')}
        >
          <Text style={[styles.chipText, !selectedSubcategory && styles.activeChipText]}>All</Text>
        </TouchableOpacity>
        {subcategories.slice(0, 4).map((sub) => (
          <TouchableOpacity
            key={sub._id}
            style={[styles.quickFilterChip, selectedSubcategory === sub._id && styles.activeChip]}
            onPress={() => setSelectedSubcategory(sub._id)}
          >
            <Text style={[styles.chipText, selectedSubcategory === sub._id && styles.activeChipText]}>
              {sub.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Products Grid */}
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.productList}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
              onAddToCart={() => handleAddToCart(item._id)}
              onAddToWishlist={() => handleAddToWishlist(item._id)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.secondary} />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />

      {/* Filter Bottom Sheet */}
      <CustomBottomSheet visible={showFilters} onClose={() => setShowFilters(false)} title="Filters">
        <View style={styles.filterContent}>
          <CustomDropdown
            label="Gender"
            options={genderOptions}
            selectedValue={selectedGender}
            onSelect={setSelectedGender}
            placeholder="Select Gender"
          />
          <CustomDropdown
            label="Category"
            options={categoryOptions}
            selectedValue={selectedCategory}
            onSelect={setSelectedCategory}
            placeholder="Select Category"
          />
          <CustomDropdown
            label="Subcategory"
            options={subcategoryOptions}
            selectedValue={selectedSubcategory}
            onSelect={setSelectedSubcategory}
            placeholder="Select Subcategory"
          />

          <TouchableOpacity style={styles.applyButton} onPress={() => setShowFilters(false)}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      </CustomBottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quickFilters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  quickFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.lightBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  activeChipText: {
    color: '#fff',
  },
  productList: {
    paddingHorizontal: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productItem: {
    width: (width - 48) / 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.secondary,
  },
  filterContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  clearButtonText: {
    color: colors.secondary,
    fontSize: 16,
  },
});
