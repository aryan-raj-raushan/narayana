import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserStackParamList } from '../../navigation/UserNavigator';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchFeaturedProducts } from '../../store/slices/productSlice';
import { fetchCart } from '../../store/slices/cartSlice';
import { fetchWishlist } from '../../store/slices/wishlistSlice';
import genderService from '../../services/gender.service';
import categoryService from '../../services/category.service';
import { Gender, Category } from '../../types';

type NavigationProp = NativeStackNavigationProp<UserStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { featuredProducts, loading } = useAppSelector((state) => state.product);
  const { cart } = useAppSelector((state) => state.cart);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      dispatch(fetchFeaturedProducts());
      dispatch(fetchCart());
      dispatch(fetchWishlist());
      const [gendersData, categoriesData] = await Promise.all([
        genderService.getAll(),
        categoryService.getAll(),
      ]);
      setGenders(gendersData.filter((g) => g.isActive));
      setCategories(categoriesData.filter((c) => c.isActive));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('ProductList', {});
      // Search will be handled in ProductListScreen
    }
  };

  const handleCategoryPress = (genderId: string, categoryId?: string) => {
    navigation.navigate('ProductList', { genderId, categoryId });
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="bg-primary px-4 pt-12 pb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-2xl font-bold">eCommerce</Text>
          <View className="flex-row">
            <TouchableOpacity className="mr-4">
              <Ionicons name="notifications-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View className="bg-white rounded-lg flex-row items-center px-4 py-2">
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>

      {/* Gender Categories */}
      <View className="px-4 py-6">
        <Text className="text-lg font-bold mb-3">Shop by Gender</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {genders.map((gender) => (
            <TouchableOpacity
              key={gender._id}
              className="mr-4 items-center"
              onPress={() => handleCategoryPress(gender._id)}
            >
              <View className="w-20 h-20 rounded-full bg-purple-100 items-center justify-center mb-2">
                <Ionicons name="person" size={32} color="#6200ee" />
              </View>
              <Text className="text-sm font-medium">{gender.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Categories */}
      <View className="px-4 pb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold">Categories</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProductList', {})}>
            <Text className="text-primary font-medium">View All</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row flex-wrap">
          {categories.slice(0, 6).map((category) => (
            <TouchableOpacity
              key={category._id}
              className="w-[48%] mb-3 mr-[2%] bg-white rounded-lg p-4 shadow-sm"
              onPress={() =>
                handleCategoryPress(
                  typeof category.gender === 'string' ? category.gender : category.gender._id,
                  category._id
                )
              }
            >
              <View className="w-12 h-12 rounded-lg bg-blue-100 items-center justify-center mb-2">
                <Ionicons name="grid" size={24} color="#2196f3" />
              </View>
              <Text className="text-sm font-semibold">{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Featured Products */}
      <View className="px-4 pb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold">Featured Products</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProductList', {})}>
            <Text className="text-primary font-medium">View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text className="text-center py-8 text-gray-500">Loading...</Text>
        ) : (
          <FlatList
            data={featuredProducts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="mr-4 w-40"
                onPress={() => handleProductPress(item._id)}
              >
                <View className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {item.images && item.images.length > 0 ? (
                    <Image
                      source={{ uri: item.images[0] }}
                      className="w-full h-40"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-40 bg-gray-200 items-center justify-center">
                      <Ionicons name="image-outline" size={40} color="#999" />
                    </View>
                  )}
                  <View className="p-3">
                    <Text className="text-sm font-semibold mb-1" numberOfLines={2}>
                      {item.name}
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-primary font-bold text-base">₹{item.price}</Text>
                      {item.discountedPrice && (
                        <Text className="text-gray-400 line-through text-xs ml-2">
                          ₹{item.discountedPrice}
                        </Text>
                      )}
                    </View>
                    {item.stock <= 10 && item.stock > 0 && (
                      <Text className="text-orange-500 text-xs mt-1">
                        Only {item.stock} left!
                      </Text>
                    )}
                    {item.stock === 0 && (
                      <Text className="text-red-500 text-xs mt-1">Out of Stock</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Banner */}
      <View className="mx-4 mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6">
        <Text className="text-white text-xl font-bold mb-2">Special Offer!</Text>
        <Text className="text-white mb-4">Get up to 50% off on selected items</Text>
        <TouchableOpacity
          className="bg-white rounded-lg py-2 px-4 self-start"
          onPress={() => navigation.navigate('ProductList', {})}
        >
          <Text className="text-primary font-semibold">Shop Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
