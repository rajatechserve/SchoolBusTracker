import axios, { type AxiosResponse, type AxiosError } from 'axios';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Provide a loose type for process since Node types are not included in Expo by default.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: any;

export function resolveBaseUrl(): string {
  const fromEnv = process?.env?.EXPO_PUBLIC_API_URL as string | undefined;
  // expoConfig.extra is available in managed workflow if set in app.json or app.config.*
  const fromConfig = (Constants?.expoConfig?.extra as any)?.apiBaseUrl as string | undefined;
  
  // Default to production Heroku API when no env is set
  let defaultUrl = 'https://itech-bustracker-app-b9609b94f375.herokuapp.com/api';
  
  // Try to detect if running on physical device (will need manual IP configuration)
  const deviceName = Constants?.deviceName?.toLowerCase() || '';
  if (!deviceName.includes('emulator') && !deviceName.includes('sdk')) {
    // Running on physical device - you'll need to set EXPO_PUBLIC_API_URL in .env
    // Example: EXPO_PUBLIC_API_URL=http://192.168.1.100:4000/api
    console.warn('⚠️ Running on physical device. Please set EXPO_PUBLIC_API_URL in .env to your computer\'s IP address');
  }
  
  return fromEnv || fromConfig || defaultUrl;
}

export const baseURL = resolveBaseUrl();
console.log('🌐 API Base URL:', baseURL);

const api = axios.create({ baseURL });

export function attachToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

let unauthorizedGuard = false;
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;
    console.warn(`API error${status ? ' ' + status : ''} for ${url || 'unknown URL'}`);
    
    // Handle 401 Unauthorized errors
    if (status === 401) {
      console.log('=== API UNAUTHORIZED ERROR DETECTED ===');
      console.log('Request URL:', url);
      console.log('Clearing auth and redirecting to login...');
      
      // Clear auth data
      try {
        await AsyncStorage.removeItem('auth');
        console.log('Auth data cleared from storage');
      } catch (storageError) {
        console.error('Error clearing auth storage:', storageError);
      }
      
      // Redirect to login
      if (!unauthorizedGuard) {
        unauthorizedGuard = true;
        try {
          router.replace('/login');
          console.log('Redirected to login page');
        } catch (navError) {
          console.error('Navigation error on 401:', navError);
        } finally {
          setTimeout(() => { unauthorizedGuard = false; }, 1500);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;