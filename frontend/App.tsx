import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <ReduxProvider store={store}>
      <RootNavigator />
      <StatusBar style="auto" />
    </ReduxProvider>
  );
}
