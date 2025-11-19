import React, { useEffect, useRef, useState, useCallback } from 'react';
// Allow require for static HTML asset
declare const require: any;
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Title } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import api from '../../services/api';

interface BusLocation {
  lat: number;
  lng: number;
}

export default function TrackBus() {
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);
  const [schoolLocation] = useState<{ lat: number; lng: number }>({ lat: 13.0827, lng: 80.2707 }); // TODO: replace with real school coords
  const [routePath, setRoutePath] = useState<BusLocation[]>([]);
  // Keep a mutable ref to avoid stale closure inside polling callback.
  const routePathRef = useRef<BusLocation[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const webViewRef = useRef<WebView | null>(null);
  const pollingRef = useRef<number | null>(null);

  const postMessage = (data: any) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(data));
    }
  };

  // Fetch latest bus location
  const fetchLocation = useCallback(async () => {
    try {
      const response = await api.get('/buses');
      const buses = response.data || [];
      if (buses.length > 0 && buses[0].location) {
        const latest = { lat: buses[0].location.lat, lng: buses[0].location.lng };
        setBusLocation(latest);
        setRoutePath((prev: BusLocation[]) => {
          if (prev.length === 0 || prev[prev.length - 1].lat !== latest.lat || prev[prev.length - 1].lng !== latest.lng) {
            const next = [...prev, latest].slice(-200);
            routePathRef.current = next;
            return next;
          }
          routePathRef.current = prev;
          return prev;
        });
        if (mapReady) {
          postMessage({ type: 'UPDATE_BUS', lat: latest.lat, lng: latest.lng });
          if (routePathRef.current.length > 1) {
            postMessage({ type: 'SET_ROUTE', path: routePathRef.current });
          }
        }
      }
    } catch (e) {
      console.error('Error fetching bus location', e);
    }
  }, [mapReady]);

  useEffect(() => {
    fetchLocation();
    pollingRef.current = setInterval(fetchLocation, 5000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [fetchLocation]);

  // Initialize school marker once map ready
  useEffect(() => {
    if (mapReady && schoolLocation) {
      postMessage({ type: 'UPDATE_SCHOOL', lat: schoolLocation.lat, lng: schoolLocation.lng });
    }
  }, [mapReady, schoolLocation]);

  // Handle incoming messages from WebView (optional future use)
  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_READY') {
        setMapReady(true);
        if (busLocation) {
          postMessage({ type: 'UPDATE_BUS', lat: busLocation.lat, lng: busLocation.lng, animate: false });
        }
        if (routePathRef.current.length > 1) {
          postMessage({ type: 'SET_ROUTE', path: routePathRef.current });
        }
      }
    } catch (e) {
      // Ignore
    }
  };

  return (
    <View style={styles.container}>
      <Title>Track Bus</Title>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={() => postMessage({ type: 'CENTER_BUS' })}>
          <Text style={styles.buttonText}>Center Bus</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => postMessage({ type: 'CENTER_SCHOOL' })}>
          <Text style={styles.buttonText}>Center School</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => postMessage({ type: 'FIT_ALL' })}>
          <Text style={styles.buttonText}>Fit All</Text>
        </TouchableOpacity>
      </View>
      <WebView
        ref={webViewRef}
        style={styles.map}
        originWhitelist={["*"]}
        source={require('./map-template.html')}
        onMessage={onMessage}
        // Increase performance for frequent updates
        javaScriptEnabled
        scalesPageToFit
        cacheEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  map: {
    flex: 1,
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden'
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap'
  },
  button: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  }
});