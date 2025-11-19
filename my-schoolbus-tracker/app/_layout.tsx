import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider as PaperProvider, DefaultTheme as PaperDefaultTheme } from 'react-native-paper';

import { useColorScheme } from '@/hooks/use-color-scheme';

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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { navTheme, paperTheme } = useThemes(colorScheme);

  return (
    <ThemeProvider value={navTheme}>
      <PaperProvider theme={paperTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </PaperProvider>
    </ThemeProvider>
  );
}
