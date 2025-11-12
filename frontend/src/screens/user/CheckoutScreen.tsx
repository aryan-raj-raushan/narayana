import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserStackParamList } from '../../navigation/UserNavigator';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchCart } from '../../store/slices/cartSlice';
import orderService from '../../services/order.service';
import { CreateOrderDto } from '../../types';

type NavigationProp = NativeStackNavigationProp<UserStackParamList>;

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector((state) => state.cart);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateOrderDto>({
    user: {
      email: '',
      name: '',
    },
    shippingAddress: {
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
  });

  useEffect(() => {
    dispatch(fetchCart());
  }, []);

  const handlePlaceOrder = async () => {
    // Validation
    if (!formData.user.name.trim() || !formData.user.email.trim()) {
      Alert.alert('Error', 'Please enter your name and email');
      return;
    }
    if (!formData.shippingAddress.fullName.trim() || !formData.shippingAddress.phone.trim()) {
      Alert.alert('Error', 'Please enter recipient name and phone');
      return;
    }
    if (!formData.shippingAddress.addressLine1.trim()) {
      Alert.alert('Error', 'Please enter address');
      return;
    }
    if (!formData.shippingAddress.city.trim() || !formData.shippingAddress.state.trim()) {
      Alert.alert('Error', 'Please enter city and state');
      return;
    }
    if (!formData.shippingAddress.postalCode.trim()) {
      Alert.alert('Error', 'Please enter postal code');
      return;
    }

    try {
      setLoading(true);
      const order = await orderService.create(formData);
      Alert.alert('Success', 'Order placed successfully!');
      navigation.replace('OrderSuccess', { orderId: order._id });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Ionicons name="cart-outline" size={80} color="#ccc" />
        <Text className="text-xl font-semibold text-gray-700 mt-4">
          Your cart is empty
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-lg px-6 py-3 mt-4"
          onPress={() => navigation.navigate('Main', { screen: 'Home' })}
        >
          <Text className="text-white font-semibold">Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Customer Information */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-bold mb-4">Customer Information</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 mb-3"
            placeholder="Full Name *"
            value={formData.user.name}
            onChangeText={(text) => setFormData({ ...formData, user: { ...formData.user, name: text } })}
          />
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3"
            placeholder="Email Address *"
            keyboardType="email-address"
            value={formData.user.email}
            onChangeText={(text) => setFormData({ ...formData, user: { ...formData.user, email: text } })}
          />
        </View>

        {/* Shipping Address */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-bold mb-4">Shipping Address</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 mb-3"
            placeholder="Recipient Name *"
            value={formData.shippingAddress.fullName}
            onChangeText={(text) => setFormData({
              ...formData,
              shippingAddress: { ...formData.shippingAddress, fullName: text },
            })}
          />
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 mb-3"
            placeholder="Phone Number *"
            keyboardType="phone-pad"
            value={formData.shippingAddress.phone}
            onChangeText={(text) => setFormData({
              ...formData,
              shippingAddress: { ...formData.shippingAddress, phone: text },
            })}
          />
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 mb-3"
            placeholder="Address Line 1 *"
            value={formData.shippingAddress.addressLine1}
            onChangeText={(text) => setFormData({
              ...formData,
              shippingAddress: { ...formData.shippingAddress, addressLine1: text },
            })}
          />
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 mb-3"
            placeholder="Address Line 2 (Optional)"
            value={formData.shippingAddress.addressLine2}
            onChangeText={(text) => setFormData({
              ...formData,
              shippingAddress: { ...formData.shippingAddress, addressLine2: text },
            })}
          />
          <View className="flex-row mb-3">
            <TextInput
              className="flex-1 bg-gray-100 rounded-lg px-4 py-3 mr-2"
              placeholder="City *"
              value={formData.shippingAddress.city}
              onChangeText={(text) => setFormData({
                ...formData,
                shippingAddress: { ...formData.shippingAddress, city: text },
              })}
            />
            <TextInput
              className="flex-1 bg-gray-100 rounded-lg px-4 py-3"
              placeholder="State *"
              value={formData.shippingAddress.state}
              onChangeText={(text) => setFormData({
                ...formData,
                shippingAddress: { ...formData.shippingAddress, state: text },
              })}
            />
          </View>
          <View className="flex-row">
            <TextInput
              className="flex-1 bg-gray-100 rounded-lg px-4 py-3 mr-2"
              placeholder="Postal Code *"
              keyboardType="numeric"
              value={formData.shippingAddress.postalCode}
              onChangeText={(text) => setFormData({
                ...formData,
                shippingAddress: { ...formData.shippingAddress, postalCode: text },
              })}
            />
            <TextInput
              className="flex-1 bg-gray-100 rounded-lg px-4 py-3"
              placeholder="Country"
              value={formData.shippingAddress.country}
              onChangeText={(text) => setFormData({
                ...formData,
                shippingAddress: { ...formData.shippingAddress, country: text },
              })}
            />
          </View>
        </View>

        {/* Order Summary */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-bold mb-4">Order Summary</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Total Items:</Text>
            <Text className="font-semibold">{cart.totalItems}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Subtotal:</Text>
            <Text className="font-semibold">₹{cart.totalPrice.toFixed(2)}</Text>
          </View>
          <View className="border-t border-gray-200 mt-2 pt-2 flex-row justify-between">
            <Text className="text-lg font-bold">Total:</Text>
            <Text className="text-primary text-xl font-bold">
              ₹{cart.totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Payment Note */}
        <View className="bg-blue-50 rounded-lg p-4 mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={24} color="#2196f3" />
            <Text className="text-base font-semibold ml-2">Payment Information</Text>
          </View>
          <Text className="text-sm text-gray-600">
            Payment gateway integration is coming soon. Your order will be placed
            without payment for now.
          </Text>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View className="bg-white border-t border-gray-200 p-4">
        <TouchableOpacity
          className="bg-primary rounded-lg py-4 items-center"
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <Text className="text-white font-bold text-base">
            {loading ? 'Placing Order...' : 'Place Order'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CheckoutScreen;
