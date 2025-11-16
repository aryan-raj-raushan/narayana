import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Absolute minimal app - no expo components
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Minimal Test App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
