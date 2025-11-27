import axios, { type AxiosResponse, type AxiosError } from 'axios';
import Constants from 'expo-constants';

// Provide a loose type for process since Node types are not included in Expo by default.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: any;

function resolveBaseUrl(): string {
  const fromEnv = process?.env?.EXPO_PUBLIC_API_URL as string | undefined;
  // expoConfig.extra is available in managed workflow if set in app.json or app.config.*
  const fromConfig = (Constants?.expoConfig?.extra as any)?.apiBaseUrl as string | undefined;
  return fromEnv || fromConfig || 'http://localhost:4000/api';
}

const api = axios.create({ baseURL: resolveBaseUrl() });

export function attachToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;
    console.warn(`API error${status ? ' ' + status : ''} for ${url || 'unknown URL'}`);
    return Promise.reject(error);
  }
);

export default api;