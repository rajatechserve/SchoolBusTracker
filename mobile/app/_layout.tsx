import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider as PaperProvider, DefaultTheme as PaperDefaultTheme } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native-paper';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NetworkProvider } from './context/NetworkContext';

import { useColorScheme } from '../hooks/use-color-scheme';

// Extend the React Navigation theme while also providing a Paper theme.
function useThemes(colorScheme: string | null) {
  const baseNav = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseNav,
    colors: {
      ...baseNav.colors,
      primary: '#4CAF50',
      background: 'transparent',
    },
  };
  const paperTheme = {
    ...PaperDefaultTheme,
    colors: {
      ...PaperDefaultTheme.colors,
      primary: '#4CAF50',
      accent: '#FFC107',
      background: 'transparent',
      surface: '#FFFFFF',
      text: '#212121',
      placeholder: '#757575',
    },
  } as typeof PaperDefaultTheme;
  return { navTheme, paperTheme };
}

export const unstable_settings = {
  anchor: '(tabs)',
};

function InnerLayout() {
  const colorScheme = useColorScheme();
  const { navTheme, paperTheme } = useThemes(colorScheme);
  const segments = useSegments();
  const router = useRouter();
  const { user, hydrated } = useAuth();

  // Route guard: ensure unauthenticated users land on /login, authenticated go to tabs.
  useEffect(() => {
    if (!hydrated) return; // defer until auth is hydrated
    
    const inAuthGroup = segments[0] === '(tabs)';
    
    if (!user && inAuthGroup) {
      // Not logged in but trying to access protected route - redirect to login
      router.replace('/login');
    } else if (user && segments[0] === 'login') {
      // Logged in but on login page - redirect to tabs
      router.replace('/(tabs)');
    }
  }, [user, segments, router, hydrated]);

  // Show loading only until auth is hydrated
  if (!hydrated) {
    return (
      <ThemeProvider value={navTheme}>
        <PaperProvider theme={paperTheme}>
          <ActivityIndicator style={{ marginTop: 64 }} animating size="large" color={paperTheme.colors.primary} />
          <StatusBar style="light" translucent backgroundColor="transparent" />
        </PaperProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={navTheme}>
      <PaperProvider theme={paperTheme}>
        <Stack 
          screenOptions={{ headerShown: false }}
          initialRouteName={user ? '(tabs)' : 'login'}
        >
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
        </Stack>
        <StatusBar style="light" translucent backgroundColor="transparent" />
      </PaperProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NetworkProvider>
        <InnerLayout />
      </NetworkProvider>
    </AuthProvider>
  );
}
