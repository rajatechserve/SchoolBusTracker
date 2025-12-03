import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider as PaperProvider, DefaultTheme as PaperDefaultTheme, MD3DarkTheme as PaperDarkTheme } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native-paper';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NetworkProvider } from './context/NetworkContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '../hooks/use-color-scheme';

// Extend the React Navigation theme while also providing a Paper theme.
function useThemes(effectiveScheme: string | null) {
  const isDark = effectiveScheme === 'dark';
  const baseNav = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseNav,
    colors: {
      ...baseNav.colors,
      primary: '#4CAF50',
      background: isDark ? '#000000' : '#f5f5f5',
      card: isDark ? '#121212' : baseNav.colors.card,
      text: isDark ? '#f5f5f5' : '#212121',
      border: isDark ? '#2a2a2a' : baseNav.colors.border,
      notification: '#FFC107',
    },
  };
  const lightPaper = {
    ...PaperDefaultTheme,
    colors: {
      ...PaperDefaultTheme.colors,
      primary: '#4CAF50',
      secondary: '#FFC107',
      background: '#f5f5f5',
      surface: '#FFFFFF',
      text: '#212121',
      placeholder: '#757575',
      onSurfaceVariant: '#444',
    },
  };
  const darkPaper = {
    ...PaperDarkTheme,
    colors: {
      ...PaperDarkTheme.colors,
      primary: '#4CAF50',
      secondary: '#FFC107',
      background: '#000000',
      surface: '#121212',
      text: '#f5f5f5',
      placeholder: '#b0b0b0',
      onSurfaceVariant: '#aaa',
    },
  };
  return { navTheme, paperTheme: isDark ? darkPaper : lightPaper };
}

export const unstable_settings = {
  anchor: '(tabs)',
};

function InnerLayout() {
  const systemScheme = useColorScheme();
  const [pref, setPref] = useState<'light' | 'dark' | 'system'>('system');
  const [themeReady, setThemeReady] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('@app_theme');
        if (saved === 'light' || saved === 'dark' || saved === 'system') setPref(saved);
      } catch {}
      setThemeReady(true);
    })();
  }, []);
  const effectiveScheme = pref === 'system' ? systemScheme : pref;
  const { navTheme, paperTheme } = useThemes(effectiveScheme);
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
  if (!hydrated || !themeReady) {
    return (
      <ThemeProvider value={navTheme}>
        <PaperProvider theme={paperTheme}>
          <ActivityIndicator style={{ marginTop: 64 }} animating size="large" color={paperTheme.colors.primary} />
          <StatusBar style={effectiveScheme === 'dark' ? 'light' : 'dark'} translucent={false} />
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
        <StatusBar style={effectiveScheme === 'dark' ? 'light' : 'dark'} translucent={false} />
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
