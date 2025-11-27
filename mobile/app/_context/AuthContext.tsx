import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { attachToken } from '../services/api';

export type User = {
  role: 'driver' | 'parent';
  id: string;
  name: string;
  phone?: string;
  schoolId?: string;
  bus?: string | null;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  loginLocal: (role: 'driver' | 'parent', payload: Partial<User>, token?: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate persisted auth state
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('auth');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.user) setUser(parsed.user);
          if (parsed.token) {
            setToken(parsed.token);
            attachToken(parsed.token); // Attach token to API headers
          }
        }
      } catch (e) {
        // swallow – persistence is best-effort
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const loginLocal = useCallback((role: 'driver' | 'parent', payload: Partial<User>, t?: string | null) => {
    console.log('=== AUTH CONTEXT: loginLocal called ===');
    console.log('Role:', role);
    console.log('Payload:', payload);
    console.log('Token:', t ? 'Token provided' : 'No token');
    
    const id = payload.id || `${role}-${Date.now()}`;
    const name = payload.name || (role === 'driver' ? 'Driver' : 'Parent');
    const next: User = { 
      role, 
      id, 
      name, 
      bus: payload.bus ?? null, 
      phone: payload.phone,
      schoolId: payload.schoolId
    };
    
    console.log('Setting user:', next);
    setUser(next);
    
    if (t) {
      console.log('Setting token and attaching to API headers');
      setToken(t);
      attachToken(t); // Attach token to API headers immediately after login
      console.log('Token attached successfully');
    } else {
      console.warn('No token provided to loginLocal!');
    }
    
    // persist
    AsyncStorage.setItem('auth', JSON.stringify({ user: next, token: t || null })).catch(() => {});
  }, []);

  const logout = useCallback(async () => {
    // Clear school-related cache to ensure fresh data on next login
    if (user?.schoolId) {
      try {
        await AsyncStorage.removeItem(`schoolData_${user.schoolId}`);
        await AsyncStorage.removeItem(`schoolBanner_${user.schoolId}`);
        console.log('School cache cleared for schoolId:', user.schoolId);
      } catch (e) {
        console.error('Failed to clear school cache:', e);
      }
    }
    
    setUser(null);
    setToken(null);
    attachToken(null); // Clear token from API headers
    AsyncStorage.removeItem('auth').catch(() => {});
  }, [user?.schoolId]);

  return (
    <AuthContext.Provider value={{ user, token, hydrated, loginLocal, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
