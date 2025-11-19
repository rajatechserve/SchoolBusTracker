import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function LocationShare() {
  const { user } = useAuth();
  const [sharing, setSharing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRequestingRef = useRef(false);

  const pushLocation = useCallback(async () => {
    if (!user) return;
    try {
      const position = await Location.getCurrentPositionAsync({});
      await api.post(`/buses/${user.bus || user.id}/location`, {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    } catch (e: any) {
      console.warn('Location post failed', e?.message);
    }
  }, [user]);

  const start = useCallback(async () => {
    if (isRequestingRef.current) return; // prevent double taps
    isRequestingRef.current = true;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to share.');
        return;
      }
      setSharing(true);
    } finally {
      isRequestingRef.current = false;
    }
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setSharing(false);
  }, []);

  // Manage interval lifecycle tied to `sharing` state.
  useEffect(() => {
    if (sharing) {
      // Immediately push one location before interval tick.
      pushLocation();
      intervalRef.current = setInterval(pushLocation, 8000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sharing, pushLocation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sharing location for bus {user?.bus || 'n/a'}</Text>
      <TouchableOpacity onPress={sharing ? stop : start} style={styles.button}>
        <Text style={styles.buttonText}>{sharing ? 'Stop' : 'Start'} Sharing</Text>
      </TouchableOpacity>
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
  text: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});
