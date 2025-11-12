import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserStackParamList } from '../../navigation/UserNavigator';
import orderService from '../../services/order.service';
import { Order } from '../../types';

type NavigationProp = NativeStackNavigationProp<UserStackParamList, 'OrderSuccess'>;
type OrderSuccessRouteProp = RouteProp<UserStackParamList, 'OrderSuccess'>;

const OrderSuccessScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OrderSuccessRouteProp>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    try {
      const orderData = await orderService.getById(route.params.orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Loading order details...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        {/* Success Icon */}
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={64} color="#4caf50" />
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Order Placed Successfully!
          </Text>
          <Text className="text-gray-600 text-center">
            Thank you for your order. We'll send you a confirmation email shortly.
          </Text>
        </View>

        {/* Order Details */}
        {order && (
          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-lg font-bold mb-4">Order Details</Text>

            <View className="flex-row justify-between mb-3 pb-3 border-b border-gray-200">
              <Text className="text-gray-600">Order ID:</Text>
              <Text className="font-semibold">{order.orderId}</Text>
            </View>

            <View className="flex-row justify-between mb-3 pb-3 border-b border-gray-200">
              <Text className="text-gray-600">Order Date:</Text>
              <Text className="font-semibold">{formatDate(order.createdAt)}</Text>
            </View>

            <View className="flex-row justify-between mb-3 pb-3 border-b border-gray-200">
              <Text className="text-gray-600">Status:</Text>
              <View className="bg-orange-100 px-3 py-1 rounded">
                <Text className="text-orange-700 font-semibold capitalize">
                  {order.status}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Total Amount:</Text>
              <Text className="text-primary text-xl font-bold">
                ₹{order.totalAmount.toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Shipping Address */}
        {order && (
          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-lg font-bold mb-4">Shipping Address</Text>
            <Text className="font-semibold mb-1">{order.shippingAddress.fullName}</Text>
            <Text className="text-gray-600 mb-1">{order.shippingAddress.phone}</Text>
            <Text className="text-gray-600 mb-1">{order.shippingAddress.addressLine1}</Text>
            {order.shippingAddress.addressLine2 && (
              <Text className="text-gray-600 mb-1">{order.shippingAddress.addressLine2}</Text>
            )}
            <Text className="text-gray-600">
              {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
              {order.shippingAddress.postalCode}
            </Text>
            <Text className="text-gray-600">{order.shippingAddress.country}</Text>
          </View>
        )}

        {/* Order Items */}
        {order && order.items.length > 0 && (
          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-lg font-bold mb-4">Order Items</Text>
            {order.items.map((item, index) => (
              <View
                key={index}
                className="flex-row justify-between py-3 border-b border-gray-200"
              >
                <View className="flex-1">
                  <Text className="font-semibold mb-1">
                    {typeof item.product === 'string' ? 'Product' : item.product.name}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Quantity: {item.quantity} × ₹{item.price}
                  </Text>
                </View>
                <Text className="font-bold">₹{item.subtotal.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Information Box */}
        <View className="bg-blue-50 rounded-lg p-4 mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={24} color="#2196f3" />
            <Text className="text-base font-semibold ml-2">What's Next?</Text>
          </View>
          <Text className="text-sm text-gray-700 mb-2">
            • You will receive an order confirmation email
          </Text>
          <Text className="text-sm text-gray-700 mb-2">
            • We'll notify you when your order is shipped
          </Text>
          <Text className="text-sm text-gray-700">
            • Expected delivery: 3-5 business days
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          className="bg-primary rounded-lg py-4 items-center mb-3"
          onPress={() => navigation.navigate('Main', { screen: 'Home' })}
        >
          <Text className="text-white font-bold text-base">Continue Shopping</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="border border-primary rounded-lg py-4 items-center"
          onPress={() => {
            // Navigate to orders list (to be implemented in future)
            navigation.navigate('Main', { screen: 'Home' });
          }}
        >
          <Text className="text-primary font-bold text-base">View My Orders</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default OrderSuccessScreen;
