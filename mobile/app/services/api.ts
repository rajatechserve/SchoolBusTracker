import axios, { type AxiosResponse, type AxiosError, type AxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { initStorage, setCache, getCache } from './storage';
// Defer type import to avoid RN type requirement in web tooling
// Avoid TS type resolution issues in Expo environment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const globalThis: any;
const DeviceEventEmitter: any = (globalThis?.DeviceEventEmitter) || ({} as any);

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
// Track pending requests to allow cancellation on logout/navigation
const pendingControllers = new Set<AbortController>();

export function attachToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export function cancelAllRequests(reason: string = 'App logout/navigation') {
  try {
    pendingControllers.forEach((c) => { try { c.abort(); } catch {} });
    pendingControllers.clear();
    console.log('⛔ Cancelled all pending API requests:', reason);
  } catch (e) {
    console.warn('Failed to cancel requests', e);
  }
}

let unauthorizedGuard = false;
// Attach Authorization header from storage if not already set
api.interceptors.request.use(async (config: AxiosRequestConfig) => {
  try {
    // If caller already set Authorization, keep it
    if (config.headers && (config.headers as any).Authorization) return config;
    // Else, try to read token from storage
    const authStr = await AsyncStorage.getItem('auth');
    if (authStr) {
      const auth = JSON.parse(authStr);
      const token = auth?.token || auth?.accessToken || auth?.jwt;
      if (token) {
        (config.headers ||= {}) as any;
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }
  } catch {}
  return config;
});
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

// Offline queue support
type QueuedRequest = {
  config: AxiosRequestConfig;
  enqueuedAt: number;
};

const QUEUE_KEY = 'offline_queue_v1';

async function enqueueRequest(config: AxiosRequestConfig) {
  try {
    const current = await AsyncStorage.getItem(QUEUE_KEY);
    const list: QueuedRequest[] = current ? JSON.parse(current) : [];
    list.push({ config, enqueuedAt: Date.now() });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(list));
    console.log('📦 Enqueued offline request:', config.url);
  } catch (e) {
    console.warn('Failed to enqueue offline request', e);
  }
}

async function flushQueue() {
  try {
    const current = await AsyncStorage.getItem(QUEUE_KEY);
    const list: QueuedRequest[] = current ? JSON.parse(current) : [];
    if (!list.length) return;
    console.log(`🔁 Flushing ${list.length} queued request(s)`);
    const remaining: QueuedRequest[] = [];
    let flushed = 0;
    for (const item of list) {
      try {
        await api.request(item.config);
        flushed += 1;
      } catch (e) {
        console.warn('Replay failed, keeping in queue:', (item.config.url || ''), e);
        remaining.push(item);
      }
    }
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    try {
      DeviceEventEmitter.emit && DeviceEventEmitter.emit('offline-queue-flushed', { flushed, remaining: remaining.length });
    } catch {}
  } catch (e) {
    console.warn('Failed to flush offline queue', e);
  }
}

// Simple network watcher using expo-network to flush offline queue when back online
let networkWatcherStarted = false;
async function startNetworkWatcher() {
  if (networkWatcherStarted) return;
  networkWatcherStarted = true;
  // poll every 10s; expo-network has no event listener
  setInterval(async () => {
    try {
      const netType = await Network.getNetworkStateAsync();
      const connected = !!(netType.isConnected && netType.isInternetReachable !== false);
      if (connected) flushQueue();
    } catch {}
  }, 10000);
}
startNetworkWatcher();

export async function request(config: AxiosRequestConfig) {
  const method = (config.method || 'get').toLowerCase();
  const isMutation = method !== 'get';
  const netType = await Network.getNetworkStateAsync();
  const connected = !!(netType.isConnected && netType.isInternetReachable !== false);
  if (!connected && isMutation) {
    await enqueueRequest({ ...config });
    return Promise.resolve({ data: { offline: true }, status: 202, statusText: 'Accepted (offline)', headers: {}, config } as AxiosResponse);
  }
  // Use AbortController to track and cancel if needed
  const controller = new AbortController();
  pendingControllers.add(controller);
  const finalConfig: AxiosRequestConfig = { ...config, signal: controller.signal };
  try {
    // For GET requests, attempt cache read when offline, write when online
    if (!isMutation) {
      // Ensure storage initialized
      initStorage();
      const schoolId = process?.env?.EXPO_PUBLIC_SCHOOL_ID as string | undefined;
      const cacheKey = `${finalConfig.url || ''}|${JSON.stringify(finalConfig.params || {})}`;
      if (!connected && schoolId) {
        const cached = await getCache(schoolId, cacheKey);
        if (cached.value !== null) {
          return { data: cached.value, status: 200, statusText: 'OK (cached)', headers: {}, config: finalConfig } as AxiosResponse;
        }
      }
      const resp = await api.request(finalConfig);
      if (schoolId) {
        try { await setCache(schoolId, cacheKey, resp.data); } catch {}
      }
      return resp;
    } else {
      const resp = await api.request(finalConfig);
      return resp;
    }
  } finally {
    pendingControllers.delete(controller);
  }
}