'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Subcategory, Offer } from '@/types';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore';
import { offerApi } from '@/lib/api';
import OfferCard from '@/components/offers/OfferCard';

// Default images for subcategories (fallback when no image is set)
const defaultSubcategoryImages: Record<string, string> = {
  'Shirts': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=750&fit=crop',
  'T-Shirts': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop',
  'Premium Sweatshirts': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=750&fit=crop',
  'Medium Sweatshirts': 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600&h=750&fit=crop',
  'Tracksuit': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=750&fit=crop',
  'Jeans': 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600&h=750&fit=crop',
  'Shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=750&fit=crop',
  'Sunglasses': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=750&fit=crop',
  'Handbags': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=750&fit=crop',
  'offers': 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=600&h=750&fit=crop',
  'Top category': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=750&fit=crop',
};

// Helper function to get subcategory image with fallback
const getSubcategoryImage = (subcategory: Subcategory): string => {
  if (subcategory.image) return subcategory.image;

  // Direct match
  if (defaultSubcategoryImages[subcategory.name]) {
    return defaultSubcategoryImages[subcategory.name];
  }

  // Case-insensitive match
  const lowerName = subcategory.name.toLowerCase();
  for (const [key, url] of Object.entries(defaultSubcategoryImages)) {
    if (key.toLowerCase() === lowerName) {
      return url;
    }
  }

  // Partial match
  for (const [key, url] of Object.entries(defaultSubcategoryImages)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return url;
    }
  }

  // Default fallback image
  return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=750&fit=crop';
};

export default function HomePage() {
  // Use shared data store to prevent duplicate API calls
  const {
    allSubcategories,
    featuredProducts,
    fetchGenders,
    fetchAllSubcategories,
    fetchFeaturedProducts,
    isLoadingSubcategories,
  } = useDataStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [homepageOffers, setHomepageOffers] = useState<Offer[]>([]);
  const { addToCart } = useCartStore();
  const { userType } = useAuthStore();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch from shared store (cached)
        const [, , , offersResponse] = await Promise.all([
          fetchGenders(),
          fetchFeaturedProducts(8),
          fetchAllSubcategories(),
          offerApi.getHomepage(),
        ]);
        setHomepageOffers(offersResponse.data || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchGenders, fetchFeaturedProducts, fetchAllSubcategories]);

  const handleAddToCart = async (productId: string) => {
    if (userType !== 'user') {
      alert('Please login to add items to cart');
      return;
    }

    setAddingToCart(productId);
    try {
      await addToCart(productId, 1);
      alert('Added to cart successfully!');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-grow">
        {/* Subcategory Navigation */}
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-6 py-3 overflow-x-auto">
              <Link href="/products?category=tshirts" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                T-shirts
              </Link>
              <Link href="/products?category=shirts" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                Shirts
              </Link>
              <Link href="/products?category=handbags" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                Handbags
              </Link>
              <Link href="/products?category=sweatshirts" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                Sweatshirts
              </Link>
              <Link href="/products?category=jeans" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                Jeans
              </Link>
              <Link href="/products?category=shoes" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                Shoes
              </Link>
              <Link href="/products?category=sunglasses" className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
                Sunglasses
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Banner Section - Matching Reference Site */}
        <section className="bg-[#f8d7da] py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-[#dc3545] flex items-center justify-center gap-2">
              <span>🎉</span>
              <span>New Special Offer Live</span>
            </h2>
          </div>
        </section>

        {/* Best Seller Categories Section */}
        <section className="py-12 md:py-16 bg-[#d4e5f7]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 text-center mb-10" style={{ fontFamily: 'Georgia, serif' }}>
              Best Seller Categories
            </h2>

            {isLoading || isLoadingSubcategories ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="text-center text-gray-600">{error}</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {allSubcategories.slice(0, 10).map((subcategory) => {
                  const imageUrl = getSubcategoryImage(subcategory);
                  return (
                    <Link
                      key={subcategory._id}
                      href={`/products?subcategoryId=${subcategory._id}`}
                      className="group block"
                    >
                      <div className="relative aspect-[4/5] bg-white rounded-lg overflow-hidden mb-3 shadow-sm">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={subcategory.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <svg
                              className="w-16 h-16 text-gray-300 group-hover:scale-110 transition-transform duration-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                      </div>
                      <h3 className="text-sm md:text-lg font-bold text-gray-900 text-center uppercase tracking-wide">
                        {subcategory.name}
                      </h3>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* New Products Section */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">
              NEW PRODUCTS
            </h2>

            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {featuredProducts.map((product) => (
                  <div key={product._id} className="group bg-white rounded-lg overflow-hidden">
                    <Link href={`/products/${product._id}`} className="block">
                      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        {product.discountPrice && (
                          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-medium">
                            -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link href={`/products/${product._id}`}>
                        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="mb-3">
                        {product.discountPrice ? (
                          <div className="flex items-center gap-2">
                            <span className="text-base font-semibold text-gray-900">
                              ₹{product.discountPrice.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ₹{product.price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-base font-semibold text-gray-900">
                            ₹{product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        disabled={addingToCart === product._id}
                        className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {addingToCart === product._id ? 'Adding...' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600">No products available</div>
            )}

            <div className="text-center mt-10">
              <Link
                href="/products"
                className="inline-block bg-gray-900 text-white px-8 py-3 text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                View All Products
              </Link>
            </div>
          </div>
        </section>

        {/* Special Offers Section */}
        {homepageOffers.length > 0 && (
          <section className="py-12 md:py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">
                SPECIAL OFFERS
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {homepageOffers.slice(0, 5).map((offer) => (
                  <OfferCard key={offer._id} offer={offer} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
                  <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Quality Products</h3>
                <p className="text-sm text-gray-600">Carefully curated selection of premium products</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
                  <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Best Prices</h3>
                <p className="text-sm text-gray-600">Competitive prices with regular discounts</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
                  <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Fast Delivery</h3>
                <p className="text-sm text-gray-600">Quick and reliable shipping to your doorstep</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
