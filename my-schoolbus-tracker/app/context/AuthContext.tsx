import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

export type User = {
  role: 'driver' | 'parent';
  id: string;
  name: string;
  phone?: string;
  bus?: string | null;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loginLocal: (role: 'driver' | 'parent', payload: Partial<User>, token?: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const loginLocal = useCallback((role: 'driver' | 'parent', payload: Partial<User>, t?: string | null) => {
    const id = payload.id || `${role}-${Date.now()}`;
    const name = payload.name || (role === 'driver' ? 'Driver' : 'Parent');
    const next: User = { role, id, name, bus: payload.bus ?? null, phone: payload.phone };
    setUser(next);
    if (t) setToken(t);
  }, []);

  const logout = useCallback(() => { setUser(null); setToken(null); }, []);

  return (
    <AuthContext.Provider value={{ user, token, loginLocal, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
