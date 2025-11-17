'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useDataStore } from '@/store/dataStore';
import { offerApi } from '@/lib/api';
import { Offer } from '@/types';
import SearchDropdown from './SearchDropdown';

export default function Header() {
  const { user, admin, userType, logout, loadFromStorage } = useAuthStore();
  const { count: cartCount, summary: cartSummary, fetchCount: fetchCartCount } = useCartStore();
  const { count: wishlistCount, fetchCount: fetchWishlistCount } = useWishlistStore();

  // Use shared data store
  const {
    genders,
    categoriesByGender,
    subcategoriesByCategory,
    fetchGenders,
    fetchCategoriesByGender,
    fetchSubcategoriesByCategory,
  } = useDataStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showOffersDropdown, setShowOffersDropdown] = useState(false);
  const [navbarOffers, setNavbarOffers] = useState<Offer[]>([]);

  // Navigation state for mobile menu
  const [expandedGender, setExpandedGender] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    loadFromStorage();

    // Fetch genders from shared store (cached)
    fetchGenders();

    // Fetch navbar offers
    offerApi.getNavbar().then((response) => {
      setNavbarOffers(response.data || []);
    }).catch(console.error);
  }, [loadFromStorage, fetchGenders]);

  useEffect(() => {
    if (mounted && userType === 'user' && user) {
      fetchCartCount();
      fetchWishlistCount();
    }
  }, [mounted, userType, user, fetchCartCount, fetchWishlistCount]);

  // Fetch categories when gender is expanded (from shared cache)
  const handleGenderExpand = async (genderId: string) => {
    if (expandedGender === genderId) {
      setExpandedGender(null);
      setExpandedCategory(null);
      return;
    }

    setExpandedGender(genderId);
    setExpandedCategory(null);

    // Fetch from shared store (cached)
    await fetchCategoriesByGender(genderId);
  };

  // Fetch subcategories when category is expanded (from shared cache)
  const handleCategoryExpand = async (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
      return;
    }

    setExpandedCategory(categoryId);

    // Fetch from shared store (cached)
    await fetchSubcategoriesByCategory(categoryId);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  // Get gender IDs for navigation links
  const getMenGenderId = () => {
    const menGender = genders.find(g => g.name.toLowerCase() === 'men' || g.name.toLowerCase() === 'male');
    return menGender?._id || '';
  };

  const getWomenGenderId = () => {
    const womenGender = genders.find(g => g.name.toLowerCase() === 'women' || g.name.toLowerCase() === 'female');
    return womenGender?._id || '';
  };

  const isLoggedIn = mounted && (user || admin);
  const isAdmin = mounted && userType === 'admin' && admin;
  const isUser = mounted && userType === 'user' && user;

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-200">
      {/* Top Bar - Desktop */}
      <div className="hidden md:block bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10 text-xs">
            <div className="text-gray-600">
              Welcome to Narayan Enterprises
            </div>
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              )}
              {isLoggedIn ? (
                <button onClick={handleLogout} className="text-gray-600 hover:text-gray-900">
                  Logout
                </button>
              ) : (
                <Link href="/login" className="text-gray-600 hover:text-gray-900">
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-lg md:text-xl font-bold text-gray-900">
              Narayan Enterprises
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-700 hover:text-gray-900 font-medium text-sm">
              Shop
            </Link>
            <Link
              href={getMenGenderId() ? `/products?genderId=${getMenGenderId()}` : '/products'}
              className="text-gray-700 hover:text-gray-900 font-medium text-sm"
            >
              Men
            </Link>
            <Link
              href={getWomenGenderId() ? `/products?genderId=${getWomenGenderId()}` : '/products'}
              className="text-gray-700 hover:text-gray-900 font-medium text-sm"
            >
              Women
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-gray-900 font-medium text-sm">
              New Arrivals
            </Link>
            {/* Offers Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowOffersDropdown(true)}
              onMouseLeave={() => setShowOffersDropdown(false)}
            >
              <button className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center py-2">
                Offers
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showOffersDropdown && navbarOffers.length > 0 && (
                <div className="absolute left-0 top-full pt-2 w-80 z-50">
                  <div className="bg-white rounded-lg shadow-xl border border-gray-200">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900">Special Offers</h4>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {navbarOffers
                        .filter((offer) => offer.productIds && offer.productIds.length > 0)
                        .map((offer) => {
                          // Build proper URL with productIds
                          const params = new URLSearchParams();
                          params.set('productIds', offer.productIds.join(','));
                          params.set('offerId', offer._id);
                          const href = `/products?${params.toString()}`;

                          return (
                            <Link
                              key={offer._id}
                              href={href}
                              className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                              onClick={() => setShowOffersDropdown(false)}
                            >
                              <div className="text-sm font-medium text-gray-900">{offer.name}</div>
                              {offer.description && (
                                <div className="text-xs text-gray-500 mt-1">{offer.description}</div>
                              )}
                            </Link>
                          );
                        })}
                    </div>
                    <div className="border-t border-gray-100 px-4 py-2">
                      <Link
                        href="/products?offers=true"
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                        onClick={() => setShowOffersDropdown(false)}
                      >
                        View All Offers →
                      </Link>
                    </div>
                  </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Search Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSearchDropdown(!showSearchDropdown)}
                className="p-2 text-gray-700 hover:text-gray-900"
                aria-label="Open search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Search Dropdown - Positioned below button */}
              <SearchDropdown isOpen={showSearchDropdown} onClose={() => setShowSearchDropdown(false)} />
            </div>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative p-2 text-gray-700 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {mounted ? wishlistCount : 0}
              </span>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="flex items-center space-x-1 p-2 text-gray-700 hover:text-gray-900">
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {mounted ? cartCount : 0}
                </span>
              </div>
              <span className="hidden md:inline text-sm font-medium">
                ₹{mounted && cartSummary?.total ? cartSummary.total.toFixed(2) : '0.00'}
              </span>
            </Link>

            {/* User Menu (Desktop) */}
            {isUser && mounted && (
              <div className="hidden md:block relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="p-2 text-gray-700 hover:text-gray-900"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    </div>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Track Order
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu - Zara Style */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <span className="text-lg font-semibold">Menu</span>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setExpandedGender(null);
                setExpandedCategory(null);
              }}
              className="p-2 text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Menu Content */}
          <div className="h-[calc(100vh-64px)] overflow-y-auto">
            <nav className="py-2">
              {/* Shop All */}
              <Link
                href="/products"
                className="flex items-center justify-between px-4 py-3 text-gray-900 font-medium hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>SHOP ALL</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Dynamic Gender → Category → Subcategory Navigation */}
              {genders.map((gender) => (
                <div key={gender._id} className="border-t border-gray-100">
                  <button
                    onClick={() => handleGenderExpand(gender._id)}
                    className="flex items-center justify-between w-full px-4 py-3 text-gray-900 font-medium hover:bg-gray-50"
                  >
                    <span className="uppercase">{gender.name}</span>
                    <svg
                      className={`w-4 h-4 transform transition-transform ${expandedGender === gender._id ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Categories for this gender */}
                  {expandedGender === gender._id && (
                    <div className="bg-gray-50">
                      <Link
                        href={`/products?genderId=${gender._id}`}
                        className="block px-6 py-2 text-sm text-gray-600 hover:text-gray-900"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        View All {gender.name}
                      </Link>

                      {categoriesByGender[gender._id]?.map((category) => (
                        <div key={category._id}>
                          <button
                            onClick={() => handleCategoryExpand(category._id)}
                            className="flex items-center justify-between w-full px-6 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <span>{category.name}</span>
                            <svg
                              className={`w-3 h-3 transform transition-transform ${expandedCategory === category._id ? 'rotate-90' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>

                          {/* Subcategories for this category */}
                          {expandedCategory === category._id && (
                            <div className="bg-white">
                              <Link
                                href={`/products?categoryId=${category._id}`}
                                className="block px-8 py-2 text-xs text-gray-500 hover:text-gray-900"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                View All {category.name}
                              </Link>

                              {subcategoriesByCategory[category._id]?.map((subcategory) => (
                                <Link
                                  key={subcategory._id}
                                  href={`/products?subcategoryId=${subcategory._id}`}
                                  className="block px-8 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  {subcategory.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Offers */}
              <Link
                href="/products?offers=true"
                className="flex items-center justify-between px-4 py-3 text-red-600 font-medium hover:bg-gray-50 border-t border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>OFFERS</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* User Section */}
              <div className="border-t border-gray-200 mt-4 pt-4">
                {isUser && (
                  <Link
                    href="/orders"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Track Orders</span>
                  </Link>
                )}

                {!isLoggedIn && (
                  <Link
                    href="/login"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Login / Register</span>
                  </Link>
                )}

                {isLoggedIn && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
