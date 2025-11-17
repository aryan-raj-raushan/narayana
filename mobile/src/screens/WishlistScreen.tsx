import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../lib/theme';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const { width } = Dimensions.get('window');

export const WishlistScreen = ({ navigation }: any) => {
  const { items, isLoading, fetchWishlist, removeFromWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const handleMoveToCart = async (productId: string, itemId: string) => {
    try {
      await addToCart(productId, 1);
      await removeFromWishlist(itemId);
    } catch (error) {
      console.error('Error moving to cart:', error);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wishlist</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="person-outline" size={64} color={colors.secondary} />
          <Text style={styles.emptyTitle}>Please Login</Text>
          <Text style={styles.emptyText}>Login to view your wishlist</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading && items.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <View style={{ width: 24 }} />
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color={colors.secondary} />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptyText}>Save items you love for later</Text>
          <TouchableOpacity style={styles.browseButton} onPress={() => navigation.navigate('Products')}>
            <Text style={styles.browseButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.wishlistGrid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => {
            const product = item.product;
            const hasDiscount = product.discountPrice && product.discountPrice < product.price;
            return (
              <View style={styles.wishlistCard}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ProductDetail', { productId: product._id })}
                >
                  <Image source={{ uri: product.images[0] }} style={styles.productImage} />
                </TouchableOpacity>
                <View style={styles.cardContent}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productSku}>SKU: {product.sku}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>
                      ₹{(product.discountPrice || product.price).toFixed(2)}
                    </Text>
                    {hasDiscount && (
                      <Text style={styles.originalPrice}>₹{product.price.toFixed(2)}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.moveToCartButton}
                    onPress={() => handleMoveToCart(product._id, item._id)}
                  >
                    <Ionicons name="cart-outline" size={16} color="#fff" />
                    <Text style={styles.moveToCartText}>Move to Cart</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromWishlist(item._id)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  wishlistGrid: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  wishlistCard: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  productImage: {
    width: '100%',
    aspectRatio: 0.8,
    backgroundColor: colors.lightBackground,
  },
  cardContent: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    lineHeight: 20,
  },
  productSku: {
    fontSize: 11,
    color: colors.secondary,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  originalPrice: {
    fontSize: 12,
    color: colors.secondary,
    textDecorationLine: 'line-through',
  },
  moveToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 12,
    gap: 6,
  },
  moveToCartText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  removeButton: {
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  removeButtonText: {
    color: colors.secondary,
    fontSize: 13,
  },
});
