import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../store/store';
import { checkAuth } from '../store/slices/authSlice';
import AdminNavigator from './AdminNavigator';
import UserNavigator from './UserNavigator';
import LoginScreen from '../screens/common/LoginScreen';

const Stack = createNativeStackNavigator();

// Linking configuration for React Native Web
const linking = {
  prefixes: [
    'http://localhost:19006',
    'http://localhost:3000',
    'https://narayana-qm1hbxpxc-saurabhs-projects-2660e0f6.vercel.app',
    'https://naryana-ui-n2rys.ondigitalocean.app',
  ],
  config: {
    screens: {
      Login: 'login',
      Admin: {
        path: 'admin',
        screens: {
          AdminDashboard: 'dashboard',
          AdminGender: 'genders',
          AdminCategory: 'categories',
          AdminSubcategory: 'subcategories',
          AdminProduct: 'products',
          AdminOrder: 'orders',
          AdminOffer: 'offers',
        },
      },
      User: {
        path: '',
        screens: {
          Main: {
            path: '',
            screens: {
              Home: '',
              Cart: 'cart',
              Wishlist: 'wishlist',
              Profile: 'profile',
            },
          },
          ProductList: 'products',
          ProductDetail: 'product/:productId',
          Checkout: 'checkout',
          OrderSuccess: 'order-success/:orderId',
          UserRegister: 'register',
          AddAddress: 'address/add',
          ChangePassword: 'change-password',
        },
      },
    },
  },
};

const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [userType, setUserType] = React.useState<'admin' | 'user' | null>(null);

  useEffect(() => {
    // Check authentication status on app load
    const checkAuthStatus = async () => {
      try {
        // Check if user is logged in and what type
        const storedUserType = await AsyncStorage.getItem('userType');
        setUserType(storedUserType as 'admin' | 'user' | null);

        if (Platform.OS === 'web') {
          const path = window.location.pathname;

          // If user type is admin and on admin route, check admin auth
          if (storedUserType === 'admin' && path.startsWith('/admin')) {
            try {
              await dispatch(checkAuth()).unwrap();
            } catch (error) {
              console.error('Admin auth check failed:', error);
              // Clear stored data and redirect to login
              await AsyncStorage.removeItem('userType');
              await AsyncStorage.removeItem('adminToken');
              setUserType(null);
              window.location.href = '/login';
            }
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  // Redirect after successful login based on user type
  useEffect(() => {
    if (Platform.OS === 'web' && !isCheckingAuth) {
      const path = window.location.pathname;

      // If admin is authenticated and on login page, redirect to dashboard
      if (isAuthenticated && userType === 'admin' && path === '/login') {
        window.location.href = '/admin/dashboard';
      }
    }
  }, [isAuthenticated, userType, isCheckingAuth]);

  // Check if we're on admin route (for web)
  const isAdminRoute = Platform.OS === 'web'
    ? window.location.pathname.startsWith('/admin')
    : false;

  // Determine what to show
  const shouldShowAdmin = isAdminRoute || (isAuthenticated && userType === 'admin');
  const needsLogin = (isAdminRoute || shouldShowAdmin) && !isAuthenticated;

  // Show loading while checking auth
  if (isCheckingAuth && Platform.OS === 'web' && isAdminRoute) {
    return null; // or a loading spinner
  }

  return (
    <NavigationContainer linking={Platform.OS === 'web' ? linking : undefined}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {shouldShowAdmin ? (
          <>
            {needsLogin ? (
              <Stack.Screen name="Login" component={LoginScreen} />
            ) : (
              <Stack.Screen name="Admin" component={AdminNavigator} />
            )}
          </>
        ) : (
          <Stack.Screen name="User" component={UserNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
