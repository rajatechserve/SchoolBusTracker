
import React from 'react';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: '#2563eb', accent: '#06b6d4' },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}
