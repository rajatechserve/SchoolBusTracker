import React, { createContext, useState, useContext, ReactNode } from 'react';

type User = {
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

  const login = (role: 'driver' | 'parent', payload: Partial<User>) => {
    setUser({ role, ...payload } as User);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
