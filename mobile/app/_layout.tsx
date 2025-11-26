import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider as PaperProvider, DefaultTheme as PaperDefaultTheme } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native-paper';
import { AuthProvider, useAuth } from './context/AuthContext';

import { useColorScheme } from '../hooks/use-color-scheme';

// Extend the React Navigation theme while also providing a Paper theme.
function useThemes(colorScheme: string | null) {
  const baseNav = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseNav,
    colors: {
      ...baseNav.colors,
      primary: '#4CAF50',
    },
  };
  const paperTheme = {
    ...PaperDefaultTheme,
    colors: {
      ...PaperDefaultTheme.colors,
      primary: '#4CAF50',
      accent: '#FFC107',
      background: '#F5F5F5',
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
  const [navReady, setNavReady] = useState(false);

  // Mark navigation ready once segments resolve (empty array -> resolving, non-empty -> ready)
  useEffect(() => {
    if (!navReady && segments.length > 0) {
      setNavReady(true);
    }
  }, [segments, navReady]);

  // Route guard: ensure unauthenticated users land on /login, authenticated go to tabs.
  useEffect(() => {
    if (!hydrated || !navReady) return; // defer until auth is hydrated and navigation is ready
    
    if (!user) {
      // Not logged in - always go to login
      router.replace('/login');
    } else {
      // Logged in - go to tabs if on login page
      const first = segments[0];
      if (first === 'login') {
        router.replace('/(tabs)');
      }
    }
  }, [user, segments, router, navReady, hydrated]);

  // Optional: simple loading state until navigation segments resolve
  if (!navReady || !hydrated) {
    return (
      <ThemeProvider value={navTheme}>
        <PaperProvider theme={paperTheme}>
          <ActivityIndicator style={{ marginTop: 64 }} animating size="large" color={paperTheme.colors.primary} />
          <StatusBar style="auto" />
        </PaperProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={navTheme}>
      <PaperProvider theme={paperTheme}>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </PaperProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InnerLayout />
    </AuthProvider>
  );
}
