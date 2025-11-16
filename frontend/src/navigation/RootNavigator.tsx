import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../store/store';
import { checkAuth } from '../store/slices/authSlice';
import AdminNavigator from './AdminNavigator';
import UserNavigator from './UserNavigator';
import LoginScreen from '../screens/common/LoginScreen';

const Stack = createNativeStackNavigator();

const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [userType, setUserType] = React.useState<'admin' | 'user' | null>(null);

  useEffect(() => {
    // Check authentication status on app load
    const checkAuthStatus = async () => {
      try {
        // Check if user is logged in and what type
        const storedUserType = await AsyncStorage.getItem('userType');
        setUserType(storedUserType as 'admin' | 'user' | null);

        // If admin user, verify token is still valid
        if (storedUserType === 'admin') {
          try {
            await dispatch(checkAuth()).unwrap();
          } catch (error) {
            console.error('Admin auth check failed:', error);
            // Clear stored data
            await AsyncStorage.removeItem('userType');
            await AsyncStorage.removeItem('adminToken');
            setUserType(null);
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

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  // Determine what to show
  const shouldShowAdmin = isAuthenticated && userType === 'admin';
  const needsLogin = userType === 'admin' && !isAuthenticated;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {shouldShowAdmin ? (
          <Stack.Screen name="Admin" component={AdminNavigator} />
        ) : needsLogin ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="User" component={UserNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default RootNavigator;
