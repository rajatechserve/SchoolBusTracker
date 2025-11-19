import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

export type User = {
  role: 'driver' | 'parent';
  id: string;
  name: string;
  bus?: string;
};

type AuthContextType = {
  user: User | null;
  login: (role: 'driver' | 'parent', payload: Partial<User>) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((role: 'driver' | 'parent', payload: Partial<User>) => {
    // Ensure required fields; generate a lightweight id if absent.
    const id = payload.id || `${role}-${Date.now()}`;
    const name = payload.name || (role === 'driver' ? 'Driver' : 'Parent');
    const next: User = { role, id, name, bus: payload.bus };
    setUser(next);
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
