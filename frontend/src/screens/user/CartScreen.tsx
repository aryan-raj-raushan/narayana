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
  fetchCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} from '../../store/slices/cartSlice';

type NavigationProp = NativeStackNavigationProp<UserStackParamList>;

const CartScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { cart, loading } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, []);

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await dispatch(updateCartQuantity({ itemId, quantity })).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(removeFromCart(itemId)).unwrap();
          } catch (error) {
            Alert.alert('Error', 'Failed to remove item');
          }
        },
      },
    ]);
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Are you sure you want to clear all items?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(clearCart()).unwrap();
          } catch (error) {
            Alert.alert('Error', 'Failed to clear cart');
          }
        },
      },
    ]);
  };

  const renderCartItem = ({ item }: { item: any }) => {
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
                className="w-24 h-24 rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <View className="w-24 h-24 rounded-lg bg-gray-200 items-center justify-center">
                <Ionicons name="image-outline" size={32} color="#999" />
              </View>
            )}
          </TouchableOpacity>

          <View className="flex-1 ml-4">
            <Text className="text-base font-semibold mb-1" numberOfLines={2}>
              {product.name}
            </Text>
            <Text className="text-primary font-bold text-lg mb-2">₹{item.price}</Text>

            <View className="flex-row justify-between items-center">
              {/* Quantity Controls */}
              <View className="flex-row items-center border border-gray-300 rounded-lg">
                <TouchableOpacity
                  className="px-3 py-1"
                  onPress={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Ionicons
                    name="remove"
                    size={18}
                    color={item.quantity <= 1 ? '#ccc' : '#000'}
                  />
                </TouchableOpacity>
                <Text className="px-3 font-semibold">{item.quantity}</Text>
                <TouchableOpacity
                  className="px-3 py-1"
                  onPress={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                  disabled={item.quantity >= product.stock}
                >
                  <Ionicons
                    name="add"
                    size={18}
                    color={item.quantity >= product.stock ? '#ccc' : '#000'}
                  />
                </TouchableOpacity>
              </View>

              {/* Remove Button */}
              <TouchableOpacity
                className="p-2"
                onPress={() => handleRemoveItem(item._id)}
              >
                <Ionicons name="trash-outline" size={20} color="#f44336" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-gray-600 mt-2">
              Subtotal: ₹{item.subtotal.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !cart) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Loading cart...</Text>
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Ionicons name="cart-outline" size={80} color="#ccc" />
        <Text className="text-xl font-semibold text-gray-700 mt-4 mb-2">
          Your cart is empty
        </Text>
        <Text className="text-gray-500 mb-6">Add some products to get started</Text>
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
        <Text className="text-lg font-bold">My Cart ({cart.totalItems} items)</Text>
        <TouchableOpacity onPress={handleClearCart}>
          <Text className="text-red-500 font-medium">Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cart.items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* Bottom Summary */}
      <View className="bg-white border-t border-gray-200 p-4">
        <View className="flex-row justify-between mb-3">
          <Text className="text-base text-gray-600">Total Items:</Text>
          <Text className="text-base font-semibold">{cart.totalItems}</Text>
        </View>
        <View className="flex-row justify-between mb-4">
          <Text className="text-lg font-bold">Total Price:</Text>
          <Text className="text-primary text-2xl font-bold">
            ₹{cart.totalPrice.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          className="bg-primary rounded-lg py-4 items-center"
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text className="text-white font-bold text-base">Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartScreen;
