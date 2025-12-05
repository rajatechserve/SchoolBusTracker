import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Network from 'expo-network';

type NetworkContextType = {
  isConnected: boolean;
  lastChangeAt: number | null;
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error('useNetwork must be used within NetworkProvider');
  return ctx;
}

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [lastChangeAt, setLastChangeAt] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        if (!alive) return;
        const connected = !!(state.isConnected && state.isInternetReachable !== false);
        setIsConnected(connected);
        setLastChangeAt(Date.now());
      } catch {
        if (!alive) return;
        setIsConnected(false);
        setLastChangeAt(Date.now());
      }
    };
    check();
    const t = setInterval(check, 5000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected, lastChangeAt }}>
      {children}
    </NetworkContext.Provider>
  );
}
