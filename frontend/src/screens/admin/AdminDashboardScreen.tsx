import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { logout } from '../../store/slices/authSlice';

type NavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface DashboardCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, icon, color, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.cardWrapper}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Ionicons name={icon} size={40} color={color} />
          <Text variant="titleMedium" style={styles.cardTitle}>
            {title}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { admin } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    if (Platform.OS === 'web') {
      window.location.href = '/admin/login';
    }
  };

  const menuItems: DashboardCardProps[] = [
    {
      title: 'Gender Management',
      icon: 'transgender',
      color: '#e91e63',
      onPress: () => navigation.navigate('AdminGender'),
    },
    {
      title: 'Category Management',
      icon: 'list',
      color: '#9c27b0',
      onPress: () => navigation.navigate('AdminCategory'),
    },
    {
      title: 'Subcategory Management',
      icon: 'list-circle',
      color: '#673ab7',
      onPress: () => navigation.navigate('AdminSubcategory'),
    },
    {
      title: 'Product Management',
      icon: 'cube',
      color: '#3f51b5',
      onPress: () => navigation.navigate('AdminProduct'),
    },
    {
      title: 'Order Management',
      icon: 'receipt',
      color: '#2196f3',
      onPress: () => navigation.navigate('AdminOrder'),
    },
    {
      title: 'Offer Management',
      icon: 'pricetag',
      color: '#ff9800',
      onPress: () => navigation.navigate('AdminOffer'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text variant="headlineMedium" style={styles.welcomeText}>
            Welcome, Admin
          </Text>
          <Text variant="bodyMedium" style={styles.emailText}>
            {admin?.email}
          </Text>
        </View>
        <Button mode="outlined" onPress={handleLogout} icon="logout">
          Logout
        </Button>
      </View>

      <Divider style={styles.divider} />

      <Text variant="titleLarge" style={styles.sectionTitle}>
        Admin Panel
      </Text>

      <View style={styles.grid}>
        {menuItems.map((item, index) => (
          <DashboardCard key={index} {...item} />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontWeight: 'bold',
  },
  emailText: {
    color: '#666',
    marginTop: 4,
  },
  divider: {
    marginVertical: 8,
  },
  sectionTitle: {
    padding: 16,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  cardWrapper: {
    width: Platform.OS === 'web' ? '33.33%' : '50%',
    padding: 8,
  },
  card: {
    elevation: 2,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  cardTitle: {
    marginTop: 12,
    textAlign: 'center',
  },
});

export default AdminDashboardScreen;
