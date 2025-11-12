import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserStackParamList } from '../../navigation/UserNavigator';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchProducts, searchProducts } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist } from '../../store/slices/wishlistSlice';
import genderService from '../../services/gender.service';
import categoryService from '../../services/category.service';
import subcategoryService from '../../services/subcategory.service';
import { Gender, Category, Subcategory, ProductFilters } from '../../types';

type NavigationProp = NativeStackNavigationProp<UserStackParamList, 'ProductList'>;
type ProductListRouteProp = RouteProp<UserStackParamList, 'ProductList'>;

const ProductListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProductListRouteProp>();
  const dispatch = useAppDispatch();

  const { products, loading } = useAppSelector((state) => state.product);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [filters, setFilters] = useState<ProductFilters>({
    gender: route.params?.genderId,
    category: route.params?.categoryId,
    subcategory: route.params?.subcategoryId,
    minPrice: undefined,
    maxPrice: undefined,
    inStock: true,
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    loadTaxonomy();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const loadTaxonomy = async () => {
    try {
      const [gendersData, categoriesData, subcategoriesData] = await Promise.all([
        genderService.getAll(),
        categoryService.getAll(),
        subcategoryService.getAll(),
      ]);
      setGenders(gendersData.filter((g) => g.isActive));
      setCategories(categoriesData.filter((c) => c.isActive));
      setSubcategories(subcategoriesData.filter((s) => s.isActive));
    } catch (error) {
      console.error('Error loading taxonomy:', error);
    }
  };

  const applyFilters = () => {
    if (searchQuery.trim()) {
      dispatch(searchProducts({ query: searchQuery, filters }));
    } else {
      dispatch(fetchProducts(filters));
    }
  };

  const handleSearch = () => {
    applyFilters();
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      alert('Added to cart!');
    } catch (error) {
      alert('Failed to add to cart');
    }
  };

  const handleAddToWishlist = async (productId: string) => {
    try {
      await dispatch(addToWishlist(productId)).unwrap();
      alert('Added to wishlist!');
    } catch (error) {
      alert('Failed to add to wishlist');
    }
  };

  const getBreadcrumb = (): string => {
    const parts: string[] = [];
    if (filters.gender) {
      const gender = genders.find((g) => g._id === filters.gender);
      if (gender) parts.push(gender.name);
    }
    if (filters.category) {
      const category = categories.find((c) => c._id === filters.category);
      if (category) parts.push(category.name);
    }
    if (filters.subcategory) {
      const subcategory = subcategories.find((s) => s._id === filters.subcategory);
      if (subcategory) parts.push(subcategory.name);
    }
    return parts.join(' > ') || 'All Products';
  };

  const renderProduct = ({ item }: { item: any }) => (
    <View className="w-[48%] mb-4 bg-white rounded-lg shadow-sm overflow-hidden">
      <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}>
        {item.images && item.images.length > 0 ? (
          <Image source={{ uri: item.images[0] }} className="w-full h-48" resizeMode="cover" />
        ) : (
          <View className="w-full h-48 bg-gray-200 items-center justify-center">
            <Ionicons name="image-outline" size={40} color="#999" />
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="absolute top-2 right-2 bg-white rounded-full p-2"
        onPress={() => handleAddToWishlist(item._id)}
      >
        <Ionicons name="heart-outline" size={20} color="#e91e63" />
      </TouchableOpacity>

      <View className="p-3">
        <Text className="text-sm font-semibold mb-1" numberOfLines={2}>
          {item.name}
        </Text>
        <View className="flex-row items-center mb-2">
          <Text className="text-primary font-bold text-base">₹{item.price}</Text>
          {item.discountedPrice && (
            <Text className="text-gray-400 line-through text-xs ml-2">
              ₹{item.discountedPrice}
            </Text>
          )}
        </View>
        {item.stock <= 10 && item.stock > 0 && (
          <Text className="text-orange-500 text-xs mb-2">Only {item.stock} left!</Text>
        )}
        {item.stock === 0 && (
          <Text className="text-red-500 text-xs mb-2">Out of Stock</Text>
        )}
        <TouchableOpacity
          className="bg-primary rounded-lg py-2 items-center"
          onPress={() => handleAddToCart(item._id)}
          disabled={item.stock === 0}
        >
          <Text className="text-white font-semibold text-sm">Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search & Filter Header */}
      <View className="bg-white px-4 py-3 shadow-sm">
        <View className="flex-row items-center mb-2">
          <View className="flex-1 bg-gray-100 rounded-lg flex-row items-center px-3 py-2">
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              className="flex-1 ml-2"
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity
            className="ml-2 bg-primary rounded-lg p-2"
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Breadcrumb */}
        <Text className="text-sm text-gray-600">{getBreadcrumb()}</Text>
      </View>

      {/* Products List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={{ padding: 8 }}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 8 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="cube-outline" size={64} color="#ccc" />
              <Text className="text-gray-500 mt-4">No products found</Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Filters</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Gender Filter */}
              <Text className="text-base font-semibold mb-2">Gender</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                <TouchableOpacity
                  className={`mr-2 px-4 py-2 rounded-full ${!filters.gender ? 'bg-primary' : 'bg-gray-200'}`}
                  onPress={() => setFilters({ ...filters, gender: undefined })}
                >
                  <Text className={!filters.gender ? 'text-white' : 'text-gray-700'}>All</Text>
                </TouchableOpacity>
                {genders.map((gender) => (
                  <TouchableOpacity
                    key={gender._id}
                    className={`mr-2 px-4 py-2 rounded-full ${filters.gender === gender._id ? 'bg-primary' : 'bg-gray-200'}`}
                    onPress={() => setFilters({ ...filters, gender: gender._id, category: undefined, subcategory: undefined })}
                  >
                    <Text className={filters.gender === gender._id ? 'text-white' : 'text-gray-700'}>
                      {gender.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Category Filter */}
              <Text className="text-base font-semibold mb-2">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                <TouchableOpacity
                  className={`mr-2 px-4 py-2 rounded-full ${!filters.category ? 'bg-primary' : 'bg-gray-200'}`}
                  onPress={() => setFilters({ ...filters, category: undefined, subcategory: undefined })}
                >
                  <Text className={!filters.category ? 'text-white' : 'text-gray-700'}>All</Text>
                </TouchableOpacity>
                {categories
                  .filter((c) => !filters.gender || (typeof c.gender === 'string' ? c.gender === filters.gender : c.gender._id === filters.gender))
                  .map((category) => (
                    <TouchableOpacity
                      key={category._id}
                      className={`mr-2 px-4 py-2 rounded-full ${filters.category === category._id ? 'bg-primary' : 'bg-gray-200'}`}
                      onPress={() => setFilters({ ...filters, category: category._id, subcategory: undefined })}
                    >
                      <Text className={filters.category === category._id ? 'text-white' : 'text-gray-700'}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>

              {/* Subcategory Filter */}
              {filters.category && (
                <>
                  <Text className="text-base font-semibold mb-2">Subcategory</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                    <TouchableOpacity
                      className={`mr-2 px-4 py-2 rounded-full ${!filters.subcategory ? 'bg-primary' : 'bg-gray-200'}`}
                      onPress={() => setFilters({ ...filters, subcategory: undefined })}
                    >
                      <Text className={!filters.subcategory ? 'text-white' : 'text-gray-700'}>All</Text>
                    </TouchableOpacity>
                    {subcategories
                      .filter((s) => typeof s.category === 'string' ? s.category === filters.category : s.category._id === filters.category)
                      .map((subcategory) => (
                        <TouchableOpacity
                          key={subcategory._id}
                          className={`mr-2 px-4 py-2 rounded-full ${filters.subcategory === subcategory._id ? 'bg-primary' : 'bg-gray-200'}`}
                          onPress={() => setFilters({ ...filters, subcategory: subcategory._id })}
                        >
                          <Text className={filters.subcategory === subcategory._id ? 'text-white' : 'text-gray-700'}>
                            {subcategory.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                </>
              )}

              {/* Price Range */}
              <Text className="text-base font-semibold mb-2">Price Range</Text>
              <View className="flex-row mb-4">
                <TextInput
                  className="flex-1 bg-gray-100 rounded-lg px-3 py-2 mr-2"
                  placeholder="Min Price"
                  keyboardType="numeric"
                  value={filters.minPrice?.toString() || ''}
                  onChangeText={(text) => setFilters({ ...filters, minPrice: parseFloat(text) || undefined })}
                />
                <TextInput
                  className="flex-1 bg-gray-100 rounded-lg px-3 py-2"
                  placeholder="Max Price"
                  keyboardType="numeric"
                  value={filters.maxPrice?.toString() || ''}
                  onChangeText={(text) => setFilters({ ...filters, maxPrice: parseFloat(text) || undefined })}
                />
              </View>

              {/* Stock Filter */}
              <TouchableOpacity
                className="flex-row items-center mb-6"
                onPress={() => setFilters({ ...filters, inStock: !filters.inStock })}
              >
                <View className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${filters.inStock ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                  {filters.inStock && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text className="text-base">In Stock Only</Text>
              </TouchableOpacity>

              {/* Apply Button */}
              <TouchableOpacity
                className="bg-primary rounded-lg py-4 items-center"
                onPress={() => {
                  applyFilters();
                  setFilterModalVisible(false);
                }}
              >
                <Text className="text-white font-bold text-base">Apply Filters</Text>
              </TouchableOpacity>

              {/* Clear Filters */}
              <TouchableOpacity
                className="mt-3 py-3 items-center"
                onPress={() => {
                  setFilters({
                    gender: undefined,
                    category: undefined,
                    subcategory: undefined,
                    minPrice: undefined,
                    maxPrice: undefined,
                    inStock: true,
                    page: 1,
                    limit: 20,
                  });
                  setSearchQuery('');
                }}
              >
                <Text className="text-primary font-semibold">Clear All Filters</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProductListScreen;
