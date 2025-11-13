import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
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
import { CartItem } from '../../types';

type NavigationProp = NativeStackNavigationProp<UserStackParamList>;

const CartScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { cart, loading } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, []);

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      await dispatch(updateCartQuantity({ itemId, quantity })).unwrap();
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = (itemId: string) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(removeFromCart(itemId)).unwrap();
          } catch (error: any) {
            Alert.alert('Error', error || 'Failed to remove item');
          }
        },
      },
    ]);
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Are you sure you want to clear your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(clearCart()).unwrap();
          } catch (error: any) {
            Alert.alert('Error', error || 'Failed to clear cart');
          }
        },
      },
    ]);
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetail', { productId: item.product._id })}
      >
        {item.product.images && item.product.images.length > 0 ? (
          <Image
            source={{ uri: item.product.images[0] }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="image-outline" size={32} color="#999" />
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.itemDetails}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={styles.productPrice}>₹{item.price} × {item.quantity}</Text>
        {item.appliedOffer && (
          <View style={styles.offerAppliedBadge}>
            <Ionicons name="pricetag" size={12} color="#4caf50" />
            <Text style={styles.offerAppliedText}>{item.appliedOffer.name}</Text>
          </View>
        )}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item._id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Ionicons name="remove" size={20} color={item.quantity <= 1 ? '#ccc' : '#333'} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item._id, item.quantity + 1)}
            disabled={item.quantity >= item.product.stock}
          >
            <Ionicons
              name="add"
              size={20}
              color={item.quantity >= item.product.stock ? '#ccc' : '#333'}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemActions}>
        <Text style={styles.subtotal}>₹{item.itemTotal}</Text>
        {(item.offerDiscount > 0 || item.productDiscount > 0) && (
          <Text style={styles.discountText}>
            - ₹{(item.offerDiscount + item.productDiscount).toFixed(2)}
          </Text>
        )}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item._id)}
        >
          <Ionicons name="trash-outline" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color="#ccc" />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.shopNowButton}
          onPress={() => navigation.navigate('Main', { screen: 'Home' } as any)}
        >
          <Text style={styles.shopNowText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalItems = cart.summary?.totalItems || cart.totalItems || 0;
  const total = cart.summary?.total || cart.totalPrice || 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </Text>
        {cart.items.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={cart.items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.footer}>
        {cart.summary && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>₹{cart.summary.subtotal.toFixed(2)}</Text>
            </View>
            {cart.summary.totalProductDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, styles.discountLabel]}>Product Discounts:</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  - ₹{cart.summary.totalProductDiscount.toFixed(2)}
                </Text>
              </View>
            )}
            {cart.summary.totalOfferDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, styles.offerLabel]}>Offer Savings:</Text>
                <Text style={[styles.summaryValue, styles.offerValue]}>
                  - ₹{cart.summary.totalOfferDiscount.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.divider]} />
          </View>
        )}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  shopNowButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopNowText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  clearText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  offerAppliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 4,
  },
  offerAppliedText: {
    color: '#4caf50',
    fontSize: 11,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
  },
  quantityButton: {
    padding: 6,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 12,
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  subtotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  discountText: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '600',
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  summaryContainer: {
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
  },
  discountLabel: {
    color: '#666',
  },
  discountValue: {
    color: '#f57c00',
    fontWeight: '600',
  },
  offerLabel: {
    color: '#666',
  },
  offerValue: {
    color: '#4caf50',
    fontWeight: '600',
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    color: '#666',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  checkoutButton: {
    backgroundColor: '#6200ee',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  checkoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;
