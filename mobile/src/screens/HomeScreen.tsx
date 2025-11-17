import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../lib/theme';
import { useDataStore } from '../store/dataStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { ProductCard } from '../components/common/ProductCard';
import { SearchBar } from '../components/common/SearchBar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation }: any) => {
  const { featuredProducts, subcategories, offers, fetchFeaturedProducts, fetchSubcategories, fetchOffers, isLoading } = useDataStore();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const [bestSellers, setBestSellers] = useState<any[]>([]);

  useEffect(() => {
    fetchFeaturedProducts(8);
    fetchSubcategories();
    fetchOffers();
  }, []);

  useEffect(() => {
    if (subcategories.length > 0) {
      setBestSellers(subcategories.slice(0, 10));
    }
  }, [subcategories]);

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

  if (isLoading && featuredProducts.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Narayana Enterprises</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => navigation.navigate('Wishlist')}>
              <Ionicons name="heart-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
              <Ionicons name="cart-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="person-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar onProductSelect={(id) => navigation.navigate('ProductDetail', { productId: id })} />
        </View>

        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroText}>
            Special Offer! Get up to 50% off on selected items. Shop now and save big!
          </Text>
        </View>

        {/* Best Seller Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Best Seller Categories</Text>
          <FlatList
            data={bestSellers}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.categoryCard}
                onPress={() => navigation.navigate('Products', { subcategoryId: item._id })}
              >
                <Image
                  source={{ uri: item.imageUrl || 'https://via.placeholder.com/200x250' }}
                  style={styles.categoryImage}
                />
                <Text style={styles.categoryName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* New Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productGrid}>
            {featuredProducts.slice(0, 4).map((product) => (
              <View key={product._id} style={styles.productItem}>
                <ProductCard
                  product={product}
                  onPress={() => navigation.navigate('ProductDetail', { productId: product._id })}
                  onAddToCart={() => handleAddToCart(product._id)}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Special Offers */}
        {offers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            <FlatList
              data={offers.slice(0, 5)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.offerCard}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.offerImage}
                  />
                  <View style={styles.offerOverlay}>
                    <Text style={styles.offerSubtitle}>{item.subtitle || 'Under'}</Text>
                    <Text style={styles.offerPrice}>₹{item.price || '999'}</Text>
                    <Text style={styles.offerCategory}>{item.category || item.title}</Text>
                  </View>
                </View>
              )}
            />
          </View>
        )}

        {/* Features */}
        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <Ionicons name="ribbon-outline" size={32} color={colors.primary} />
            <Text style={styles.featureTitle}>Quality Products</Text>
            <Text style={styles.featureDesc}>Premium quality guaranteed</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="cash-outline" size={32} color={colors.primary} />
            <Text style={styles.featureTitle}>Best Prices</Text>
            <Text style={styles.featureDesc}>Competitive pricing always</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="bicycle-outline" size={32} color={colors.primary} />
            <Text style={styles.featureTitle}>Fast Delivery</Text>
            <Text style={styles.featureDesc}>Quick and reliable shipping</Text>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  heroBanner: {
    backgroundColor: colors.heroBg,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  heroText: {
    color: colors.heroText,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  viewAll: {
    fontSize: 14,
    color: colors.info,
    fontWeight: '500',
  },
  categoryCard: {
    marginLeft: 16,
    width: 150,
  },
  categoryImage: {
    width: 150,
    height: 187,
    borderRadius: 12,
    backgroundColor: colors.lightBackground,
  },
  categoryName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    textAlign: 'center',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  productItem: {
    width: (width - 48) / 2,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  offerCard: {
    marginLeft: 16,
    width: 280,
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  offerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.lightBackground,
  },
  offerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  offerSubtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  offerPrice: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginVertical: 4,
  },
  offerCategory: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  featuresSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 32,
    gap: 12,
  },
  featureItem: {
    flex: 1,
    backgroundColor: colors.lightBackground,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 8,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 12,
    color: colors.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
