import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
let NetInfo: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  NetInfo = require('@react-native-community/netinfo');
} catch {}

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
    if (NetInfo && NetInfo.addEventListener) {
      const unsubscribe = NetInfo.addEventListener((state: any) => {
        const connected = !!(state.isConnected && state.isInternetReachable !== false);
        setIsConnected(connected);
        setLastChangeAt(Date.now());
      });
      return () => unsubscribe();
    }
    // Fallback: poll a lightweight health endpoint to infer connectivity
    let mounted = true;
    const tick = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/health');
        if (!mounted) return;
        setIsConnected(res.ok);
        setLastChangeAt(Date.now());
      } catch {
        if (!mounted) return;
        setIsConnected(false);
        setLastChangeAt(Date.now());
      }
    };
    tick();
    const t = setInterval(tick, 5000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected, lastChangeAt }}>
      {children}
    </NetworkContext.Provider>
  );
}
