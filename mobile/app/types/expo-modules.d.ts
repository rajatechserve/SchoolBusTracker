declare module 'expo-sqlite' {
  export type SQLiteDatabase = {
    transaction: (cb: (tx: any) => void) => void;
  };
  export function openDatabase(name?: string): SQLiteDatabase;
}

declare module 'expo-network' {
  export type NetworkState = { isConnected?: boolean; isInternetReachable?: boolean };
  export function getNetworkStateAsync(): Promise<NetworkState>;
}