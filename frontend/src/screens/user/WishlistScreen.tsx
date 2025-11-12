import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserStackParamList } from '../../navigation/UserNavigator';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  fetchWishlist,
  removeFromWishlist,
  clearWishlist,
} from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';

type NavigationProp = NativeStackNavigationProp<UserStackParamList>;

const WishlistScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { wishlist, loading } = useAppSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, []);

  const handleRemoveItem = async (itemId: string) => {
    try {
      await dispatch(removeFromWishlist(itemId)).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  const handleMoveToCart = async (item: any) => {
    const product = item.product;
    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      await dispatch(removeFromWishlist(item._id)).unwrap();
      Alert.alert('Success', 'Item moved to cart!');
    } catch (error) {
      Alert.alert('Error', 'Failed to move item to cart');
    }
  };

  const handleClearWishlist = () => {
    Alert.alert('Clear Wishlist', 'Are you sure you want to clear all items?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(clearWishlist()).unwrap();
          } catch (error) {
            Alert.alert('Error', 'Failed to clear wishlist');
          }
        },
      },
    ]);
  };

  const renderWishlistItem = ({ item }: { item: any }) => {
    const product = item.product;
    return (
      <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => navigation.navigate('ProductDetail', { productId: product._id })}
          >
            {product.images && product.images.length > 0 ? (
              <Image
                source={{ uri: product.images[0] }}
                className="w-28 h-28 rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <View className="w-28 h-28 rounded-lg bg-gray-200 items-center justify-center">
                <Ionicons name="image-outline" size={32} color="#999" />
              </View>
            )}
          </TouchableOpacity>

          <View className="flex-1 ml-4">
            <View className="flex-row justify-between">
              <Text className="text-base font-semibold flex-1 mr-2" numberOfLines={2}>
                {product.name}
              </Text>
              <TouchableOpacity
                className="p-1"
                onPress={() => handleRemoveItem(item._id)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center mt-1">
              <Text className="text-primary font-bold text-xl">₹{product.price}</Text>
              {product.discountedPrice && (
                <Text className="text-gray-400 line-through text-sm ml-2">
                  ₹{product.discountedPrice}
                </Text>
              )}
            </View>

            {product.stock > 0 ? (
              <View className="flex-row items-center mt-2">
                <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
                <Text className="text-green-600 text-sm ml-1">In Stock</Text>
              </View>
            ) : (
              <View className="flex-row items-center mt-2">
                <Ionicons name="close-circle" size={16} color="#f44336" />
                <Text className="text-red-600 text-sm ml-1">Out of Stock</Text>
              </View>
            )}

            {product.stock > 0 && (
              <TouchableOpacity
                className="bg-primary rounded-lg py-2 mt-3 items-center"
                onPress={() => handleMoveToCart(item)}
              >
                <View className="flex-row items-center">
                  <Ionicons name="cart" size={16} color="white" />
                  <Text className="text-white font-semibold text-sm ml-2">Move to Cart</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading && !wishlist) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Loading wishlist...</Text>
      </View>
    );
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Ionicons name="heart-outline" size={80} color="#ccc" />
        <Text className="text-xl font-semibold text-gray-700 mt-4 mb-2">
          Your wishlist is empty
        </Text>
        <Text className="text-gray-500 mb-6">Save your favorite items here</Text>
        <TouchableOpacity
          className="bg-primary rounded-lg px-6 py-3"
          onPress={() => navigation.navigate('Main', { screen: 'Home' })}
        >
          <Text className="text-white font-semibold">Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row justify-between items-center shadow-sm">
        <Text className="text-lg font-bold">My Wishlist ({wishlist.totalItems} items)</Text>
        <TouchableOpacity onPress={handleClearWishlist}>
          <Text className="text-red-500 font-medium">Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Wishlist Items */}
      <FlatList
        data={wishlist.items}
        renderItem={renderWishlistItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

export default WishlistScreen;
