'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

export default function Header() {
  const { user, admin, userType, logout, loadFromStorage } = useAuthStore();
  const { count: cartCount, fetchCount: fetchCartCount } = useCartStore();
  const { count: wishlistCount, fetchCount: fetchWishlistCount } = useWishlistStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (mounted && userType === 'user' && user) {
      fetchCartCount();
      fetchWishlistCount();
    }
  }, [mounted, userType, user, fetchCartCount, fetchWishlistCount]);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  const isLoggedIn = mounted && (user || admin);
  const isAdmin = mounted && userType === 'admin' && admin;
  const isUser = mounted && userType === 'user' && user;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl md:text-2xl font-bold text-gray-900">
              Narayan Enterprises
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-800 hover:text-gray-600 transition-colors font-medium text-sm uppercase tracking-wide"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-gray-800 hover:text-gray-600 transition-colors font-medium text-sm uppercase tracking-wide"
            >
              Shop
            </Link>
            <Link
              href="/products?gender=men"
              className="text-gray-800 hover:text-gray-600 transition-colors font-medium text-sm uppercase tracking-wide"
            >
              Men
            </Link>
            <Link
              href="/products?gender=women"
              className="text-gray-800 hover:text-gray-600 transition-colors font-medium text-sm uppercase tracking-wide"
            >
              Women
            </Link>
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-2">
            {!mounted ? (
              <div className="w-20 h-8 bg-gray-100 animate-pulse rounded"></div>
            ) : isLoggedIn ? (
              <>
                {isUser && (
                  <>
                    {/* Wishlist */}
                    <Link
                      href="/wishlist"
                      className="relative p-2.5 text-gray-700 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-50"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      {wishlistCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-gray-900 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-medium">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>

                    {/* Cart */}
                    <Link
                      href="/cart"
                      className="relative p-2.5 text-gray-700 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-50"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      {cartCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-gray-900 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-medium">
                          {cartCount}
                        </span>
                      )}
                    </Link>

                    {/* Profile Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center space-x-2 p-2.5 text-gray-700 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-50"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </button>
                      {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          </div>
                          <Link
                            href="/orders"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            My Orders
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
                  </>
                )}

                {isAdmin && (
                  <>
                    <Link
                      href="/admin"
                      className="text-gray-700 hover:text-gray-900 transition-colors font-medium text-sm"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="ml-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                )}
              </>
            ) : (
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 transition-colors font-medium text-sm"
              >
                Login / Register
              </Link>
            )}
          </div>

          {/* Mobile Right Section */}
          <div className="flex md:hidden items-center space-x-1">
            {isUser && mounted && (
              <>
                <Link
                  href="/wishlist"
                  className="relative p-2 text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-gray-900 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/cart"
                  className="relative p-2 text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-gray-900 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 bg-white">
            <nav className="flex flex-col space-y-1">
              <Link
                href="/"
                className="px-3 py-2.5 text-gray-800 hover:bg-gray-50 rounded-md font-medium text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="px-3 py-2.5 text-gray-800 hover:bg-gray-50 rounded-md font-medium text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop All
              </Link>
              <Link
                href="/products?gender=men"
                className="px-3 py-2.5 text-gray-800 hover:bg-gray-50 rounded-md font-medium text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Men
              </Link>
              <Link
                href="/products?gender=women"
                className="px-3 py-2.5 text-gray-800 hover:bg-gray-50 rounded-md font-medium text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Women
              </Link>

              <div className="border-t border-gray-100 my-2"></div>

              {isUser && (
                <>
                  <Link
                    href="/orders"
                    className="px-3 py-2.5 text-gray-800 hover:bg-gray-50 rounded-md font-medium text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-2.5 text-gray-800 hover:bg-gray-50 rounded-md font-medium text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}

              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="text-left px-3 py-2.5 text-gray-800 hover:bg-gray-50 rounded-md font-medium text-sm"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-2.5 text-gray-800 hover:bg-gray-50 rounded-md font-medium text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login / Register
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
