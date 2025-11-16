'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { productApi, genderApi, categoryApi, subcategoryApi } from '@/lib/api';
import { Product, Gender, Category, Subcategory, PaginatedResponse } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const { userType } = useAuthStore();
  const { addToCart } = useCartStore();
  const { addToWishlist } = useWishlistStore();

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter options
  const [genders, setGenders] = useState<Gender[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  // Filter state
  const [selectedGender, setSelectedGender] = useState<string>(
    searchParams.get('genderId') || ''
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  // Mobile filter toggle
  const [showFilters, setShowFilters] = useState(false);

  // Loading states for actions
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [addingToWishlist, setAddingToWishlist] = useState<string | null>(null);

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [gendersRes] = await Promise.all([
          genderApi.getAll({ isActive: true }),
        ]);
        setGenders(gendersRes.data.data || gendersRes.data || []);
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch categories when gender changes
  useEffect(() => {
    const fetchCategories = async () => {
      if (selectedGender) {
        try {
          const response = await categoryApi.getByGender(selectedGender);
          setCategories(response.data || []);
          setSelectedCategory('');
          setSelectedSubcategory('');
        } catch (err) {
          console.error('Failed to fetch categories:', err);
        }
      } else {
        setCategories([]);
        setSelectedCategory('');
        setSelectedSubcategory('');
      }
    };

    fetchCategories();
  }, [selectedGender]);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (selectedCategory) {
        try {
          const response = await subcategoryApi.getByCategory(selectedCategory);
          setSubcategories(response.data || []);
          setSelectedSubcategory('');
        } catch (err) {
          console.error('Failed to fetch subcategories:', err);
        }
      } else {
        setSubcategories([]);
        setSelectedSubcategory('');
      }
    };

    fetchSubcategories();
  }, [selectedCategory]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: pagination.limit,
        isActive: true,
      };

      if (selectedGender) params.genderId = selectedGender;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedSubcategory) params.subcategoryId = selectedSubcategory;
      if (minPrice) params.minPrice = Number(minPrice);
      if (maxPrice) params.maxPrice = Number(maxPrice);
      if (searchQuery) params.search = searchQuery;

      const response = await productApi.getAll(params);
      const data = response.data as PaginatedResponse<Product>;

      setProducts(data.data || []);
      setPagination(data.pagination || {
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
      });
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    pagination.limit,
    selectedGender,
    selectedCategory,
    selectedSubcategory,
    minPrice,
    maxPrice,
    searchQuery,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  const handleAddToWishlist = async (productId: string) => {
    if (userType !== 'user') {
      alert('Please login to add items to wishlist');
      return;
    }

    setAddingToWishlist(productId);
    try {
      await addToWishlist(productId);
      alert('Added to wishlist successfully!');
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
      alert('Failed to add to wishlist. Please try again.');
    } finally {
      setAddingToWishlist(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const clearFilters = () => {
    setSelectedGender('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shop</h1>
            <p className="text-sm text-gray-600 mt-1">
              Browse our collection of quality products
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-grow px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm"
              />
              <button type="submit" className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
                Search
              </button>
            </div>
          </form>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden w-full mb-4 px-4 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Filter Sidebar */}
            <aside
              className={`${
                showFilters ? 'block' : 'hidden'
              } md:block w-full md:w-56 flex-shrink-0`}
            >
              <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-24">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Filters</h2>
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-600 hover:text-gray-900 underline"
                  >
                    Clear All
                  </button>
                </div>

                {/* Gender Filter */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    <option value="">All</option>
                    {genders.map((gender) => (
                      <option key={gender._id} value={gender._id}>
                        {gender.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                {categories.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                    >
                      <option value="">All</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Subcategory Filter */}
                {subcategories.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-2">Subcategory</label>
                    <select
                      value={selectedSubcategory}
                      onChange={(e) => setSelectedSubcategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                    >
                      <option value="">All</option>
                      {subcategories.map((subcategory) => (
                        <option key={subcategory._id} value={subcategory._id}>
                          {subcategory.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Price Range */}
                <div className="mb-5">
                  <label className="block text-xs font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                      min="0"
                    />
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                      min="0"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCurrentPage(1);
                    fetchProducts();
                  }}
                  className="w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-grow">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[4/5] bg-gray-100 rounded-lg mb-3"></div>
                      <div className="h-3 bg-gray-100 rounded mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={fetchProducts}
                    className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="w-12 h-12 mx-auto text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p className="text-gray-600 text-sm mb-4">No products found</p>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4 text-xs text-gray-600">
                    Showing {products.length} of {pagination.total} products
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <div key={product._id} className="group">
                        {/* Product Image */}
                        <Link href={`/products/${product._id}`} className="block">
                          <div className="relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden mb-3">
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
                                <svg
                                  className="w-12 h-12"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                            {product.discountPrice && (
                              <span className="absolute top-2 left-2 bg-gray-900 text-white text-xs px-2 py-1 rounded font-medium">
                                -{Math.round(
                                  ((product.price - product.discountPrice) /
                                    product.price) *
                                    100
                                )}%
                              </span>
                            )}
                            {/* Quick Action Buttons */}
                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleAddToWishlist(product._id);
                                }}
                                disabled={addingToWishlist === product._id}
                                className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                                title="Add to Wishlist"
                              >
                                {addingToWishlist === product._id ? (
                                  <svg className="animate-spin h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        </Link>

                        {/* Product Info */}
                        <div>
                          <Link href={`/products/${product._id}`}>
                            <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-gray-600 transition-colors">
                              {product.name}
                            </h3>
                          </Link>

                          {/* Price */}
                          <div className="mb-3">
                            {product.discountPrice ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900">
                                  ₹{product.discountPrice.toFixed(2)}
                                </span>
                                <span className="text-xs text-gray-500 line-through">
                                  ₹{product.price.toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm font-semibold text-gray-900">
                                ₹{product.price.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Add to Cart Button */}
                          <button
                            onClick={() => handleAddToCart(product._id)}
                            disabled={addingToCart === product._id}
                            className="w-full px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                          >
                            {addingToCart === product._id ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-3 w-3" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Adding...
                              </span>
                            ) : (
                              'Add to Cart'
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-10 flex justify-center">
                      <nav className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>

                        {[...Array(pagination.totalPages)].map((_, i) => {
                          const page = i + 1;
                          if (
                            page === 1 ||
                            page === pagination.totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                  currentPage === page
                                    ? 'bg-gray-900 text-white'
                                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <span key={page} className="px-2 text-gray-500">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}

                        <button
                          onClick={() =>
                            setCurrentPage((p) =>
                              Math.min(pagination.totalPages, p + 1)
                            )
                          }
                          disabled={currentPage === pagination.totalPages}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
