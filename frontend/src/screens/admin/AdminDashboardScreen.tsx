import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AdminDashboardScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Admin Dashboard - To be implemented with StyleSheet</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  text: { fontSize: 16, color: '#333' },
});

export default AdminDashboardScreen;
