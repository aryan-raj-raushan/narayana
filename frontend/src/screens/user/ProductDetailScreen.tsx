import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserStackParamList } from '../../navigation/UserNavigator';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchProductById } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';

type NavigationProp = NativeStackNavigationProp<UserStackParamList, 'ProductDetail'>;
type ProductDetailRouteProp = RouteProp<UserStackParamList, 'ProductDetail'>;

const { width } = Dimensions.get('window');

const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProductDetailRouteProp>();
  const dispatch = useAppDispatch();

  const { currentProduct, loading } = useAppSelector((state) => state.product);
  const { wishlist } = useAppSelector((state) => state.wishlist);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const isInWishlist = wishlist?.items.some(
    (item) =>
      (typeof item.product === 'string' ? item.product : item.product._id) ===
      route.params.productId
  );

  useEffect(() => {
    dispatch(fetchProductById(route.params.productId));
  }, [route.params.productId]);

  const handleAddToCart = async () => {
    if (!currentProduct) return;
    try {
      await dispatch(addToCart({ productId: currentProduct._id, quantity })).unwrap();
      alert('Added to cart successfully!');
    } catch (error) {
      alert('Failed to add to cart');
    }
  };

  const handleToggleWishlist = async () => {
    if (!currentProduct) return;
    try {
      if (isInWishlist) {
        const wishlistItem = wishlist?.items.find(
          (item) =>
            (typeof item.product === 'string' ? item.product : item.product._id) ===
            currentProduct._id
        );
        if (wishlistItem) {
          await dispatch(removeFromWishlist(wishlistItem._id)).unwrap();
          alert('Removed from wishlist');
        }
      } else {
        await dispatch(addToWishlist(currentProduct._id)).unwrap();
        alert('Added to wishlist!');
      }
    } catch (error) {
      alert('Failed to update wishlist');
    }
  };

  const increaseQuantity = () => {
    if (currentProduct && quantity < currentProduct.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading || !currentProduct) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        {/* Image Gallery */}
        <View className="relative">
          {currentProduct.images && currentProduct.images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const index = Math.floor(event.nativeEvent.contentOffset.x / width);
                  setSelectedImageIndex(index);
                }}
              >
                {currentProduct.images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={{ width, height: width }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              {currentProduct.images.length > 1 && (
                <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
                  {currentProduct.images.map((_, index) => (
                    <View
                      key={index}
                      className={`w-2 h-2 rounded-full mx-1 ${
                        index === selectedImageIndex ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View
              style={{ width, height: width }}
              className="bg-gray-200 items-center justify-center"
            >
              <Ionicons name="image-outline" size={80} color="#999" />
            </View>
          )}

          {/* Wishlist Button */}
          <TouchableOpacity
            className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg"
            onPress={handleToggleWishlist}
          >
            <Ionicons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={24}
              color={isInWishlist ? '#e91e63' : '#000'}
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View className="p-4">
          <Text className="text-2xl font-bold mb-2">{currentProduct.name}</Text>

          {/* Price */}
          <View className="flex-row items-center mb-4">
            <Text className="text-primary font-bold text-3xl">₹{currentProduct.price}</Text>
            {currentProduct.discountedPrice && (
              <>
                <Text className="text-gray-400 line-through text-xl ml-3">
                  ₹{currentProduct.discountedPrice}
                </Text>
                <View className="bg-green-100 px-2 py-1 rounded ml-2">
                  <Text className="text-green-700 font-semibold text-sm">
                    {Math.round(
                      ((currentProduct.discountedPrice - currentProduct.price) /
                        currentProduct.discountedPrice) *
                        100
                    )}
                    % OFF
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Stock Status */}
          {currentProduct.stock > 0 ? (
            <View className="flex-row items-center mb-4">
              <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
              <Text className="text-green-600 ml-2 font-medium">
                In Stock ({currentProduct.stock} available)
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center mb-4">
              <Ionicons name="close-circle" size={20} color="#f44336" />
              <Text className="text-red-600 ml-2 font-medium">Out of Stock</Text>
            </View>
          )}

          {/* Description */}
          <View className="mb-4">
            <Text className="text-lg font-semibold mb-2">Description</Text>
            <Text className="text-gray-700 leading-6">{currentProduct.description}</Text>
          </View>

          {/* Tags */}
          {currentProduct.tags && currentProduct.tags.length > 0 && (
            <View className="mb-4">
              <Text className="text-lg font-semibold mb-2">Tags</Text>
              <View className="flex-row flex-wrap">
                {currentProduct.tags.map((tag, index) => (
                  <View key={index} className="bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2">
                    <Text className="text-gray-700 text-sm">{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Attributes */}
          {currentProduct.attributes && Object.keys(currentProduct.attributes).length > 0 && (
            <View className="mb-4">
              <Text className="text-lg font-semibold mb-2">Specifications</Text>
              {Object.entries(currentProduct.attributes).map(([key, value]) => (
                <View key={key} className="flex-row justify-between py-2 border-b border-gray-200">
                  <Text className="text-gray-600 capitalize">{key}</Text>
                  <Text className="font-medium">{String(value)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* SKU */}
          <View className="mb-4">
            <Text className="text-sm text-gray-500">SKU: {currentProduct.sku}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      {currentProduct.stock > 0 && (
        <View className="border-t border-gray-200 p-4 flex-row items-center">
          {/* Quantity Selector */}
          <View className="flex-row items-center border border-gray-300 rounded-lg mr-3">
            <TouchableOpacity
              className="px-4 py-2"
              onPress={decreaseQuantity}
              disabled={quantity <= 1}
            >
              <Ionicons
                name="remove"
                size={20}
                color={quantity <= 1 ? '#ccc' : '#000'}
              />
            </TouchableOpacity>
            <Text className="px-4 font-semibold">{quantity}</Text>
            <TouchableOpacity
              className="px-4 py-2"
              onPress={increaseQuantity}
              disabled={quantity >= currentProduct.stock}
            >
              <Ionicons
                name="add"
                size={20}
                color={quantity >= currentProduct.stock ? '#ccc' : '#000'}
              />
            </TouchableOpacity>
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            className="flex-1 bg-primary rounded-lg py-3 items-center"
            onPress={handleAddToCart}
          >
            <View className="flex-row items-center">
              <Ionicons name="cart" size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">Add to Cart</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ProductDetailScreen;
