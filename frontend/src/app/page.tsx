'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { productApi, genderApi, categoryApi } from '@/lib/api';
import { Gender, Product, Category } from '@/types';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
  const [genders, setGenders] = useState<Gender[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCartStore();
  const { userType } = useAuthStore();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gendersRes, productsRes] = await Promise.all([
          genderApi.getAll({ isActive: true }),
          productApi.getAll({ limit: 8, isActive: true }),
        ]);
        setGenders(gendersRes.data.data || gendersRes.data || []);
        const productsData = productsRes.data.data || productsRes.data || [];
        setNewProducts(Array.isArray(productsData) ? productsData : []);

        // Fetch categories for first gender if available
        const gendersData = gendersRes.data.data || gendersRes.data || [];
        if (gendersData.length > 0) {
          const categoriesRes = await categoryApi.getByGender(gendersData[0]._id);
          setCategories(categoriesRes.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

        {/* Hero Banner Section */}
        <section className="bg-gray-50 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block bg-white px-4 py-2 rounded-full mb-6 shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-900">
                New Special Offer Live
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Up to 90% off
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Best-Selling items at unbeatable prices
            </p>
            <Link
              href="/products"
              className="inline-block bg-gray-900 text-white px-10 py-4 text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </section>

        {/* Best Seller Categories Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">
              Best Seller Categories
            </h2>

            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="text-center text-gray-600">{error}</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {genders.map((gender) => (
                  <Link
                    key={gender._id}
                    href={`/products?genderId=${gender._id}`}
                    className="group block"
                  >
                    <div className="relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden mb-3">
                      <div className="absolute inset-0 flex items-center justify-center">
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300"></div>
                    </div>
                    <h3 className="text-sm md:text-base font-medium text-gray-900 text-center group-hover:text-gray-600 transition-colors">
                      {gender.name}
                    </h3>
                  </Link>
                ))}

                {/* Additional Category Cards */}
                {categories.slice(0, Math.max(0, 5 - genders.length)).map((category) => (
                  <Link
                    key={category._id}
                    href={`/products?categoryId=${category._id}`}
                    className="group block"
                  >
                    <div className="relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden mb-3">
                      <div className="absolute inset-0 flex items-center justify-center">
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
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300"></div>
                    </div>
                    <h3 className="text-sm md:text-base font-medium text-gray-900 text-center group-hover:text-gray-600 transition-colors">
                      {category.name}
                    </h3>
                  </Link>
                ))}
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

            {newProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {newProducts.map((product) => (
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

        {/* Men Pick From Low Price Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">
              Men Pick From Low Price
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {newProducts.slice(0, 4).map((product) => (
                <div key={`men-${product._id}`} className="group bg-white border border-gray-200 rounded-lg overflow-hidden">
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
                          SALE
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/products/${product._id}`}>
                      <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <div>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

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
