import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DriverDashboard from '../screens/Driver/DriverDashboard';
import ParentDashboard from '../screens/Parent/ParentDashboard';
import { View, Text, StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const globalThis: any;
import { useNetwork } from '../context/NetworkContext';

export default function HomeScreen() {
  const { user } = useAuth();
  const { isConnected } = useNetwork();
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  useEffect(() => {
    const emitter = globalThis?.DeviceEventEmitter;
    if (!emitter || !emitter.addListener) return;
    const sub = emitter.addListener('offline-queue-flushed', (payload: { flushed: number; remaining: number }) => {
      if (payload?.flushed) {
        setSnackMsg(`Synced ${payload.flushed} change(s)`);
        setSnackVisible(true);
      }
    });
    return () => { try { sub?.remove?.(); } catch {} };
  }, []);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Not logged in</Text>
        <Snackbar visible={snackVisible} onDismiss={() => setSnackVisible(false)} duration={2500}>
          {snackMsg}
        </Snackbar>
      </View>
    );
  }

  // Show appropriate dashboard based on user role
  if (user.role === 'driver') {
    return <DriverDashboard />;
  }

  if (user.role === 'parent') {
    return <ParentDashboard />;
  }

  return (
    <View style={styles.container}>
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Network disconnected</Text>
        </View>
      )}
      <Text style={styles.errorText}>Unknown user role</Text>
      <Snackbar visible={snackVisible} onDismiss={() => setSnackVisible(false)} duration={2500}>
        {snackMsg}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
  offlineBanner: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
  },
  offlineText: {
    color: '#991b1b',
    fontWeight: '600',
    textAlign: 'center',
  },
});
