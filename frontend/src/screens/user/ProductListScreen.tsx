import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProductListScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Product List Screen - To be implemented with StyleSheet</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  text: { fontSize: 16, color: '#333' },
});

export default ProductListScreen;
