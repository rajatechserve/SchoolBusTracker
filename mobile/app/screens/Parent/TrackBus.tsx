import React, { useEffect, useRef, useState, useCallback } from 'react';
// Allow require for static HTML asset
declare const require: any;
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { Title } from 'react-native-paper';
import { WebView } from 'react-native-webview';
// react-native-maps optional: if not installed, WebView fallback is used
let MapView: any, Marker: any, Polyline: any, AnimatedRegion: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const RNMaps = require('react-native-maps');
  MapView = RNMaps.MapView;
  Marker = RNMaps.Marker;
  Polyline = RNMaps.Polyline;
  // AnimatedRegion is under RNMaps.AnimatedRegion
  AnimatedRegion = RNMaps.AnimatedRegion;
} catch {}
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface BusLocation {
  lat: number;
  lng: number;
}

export default function TrackBus() {
  const { user } = useAuth();
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);
  const [schoolLocation] = useState<{ lat: number; lng: number }>({ lat: 13.0827, lng: 80.2707 }); // TODO: replace with real school coords
  const [nextStop, setNextStop] = useState<BusLocation | null>(null);
  const [routePath, setRoutePath] = useState<BusLocation[]>([]);
  // Keep a mutable ref to avoid stale closure inside polling callback.
  const routePathRef = useRef<BusLocation[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const webViewRef = useRef<WebView | null>(null);
  const pollingRef = useRef<number | null>(null);
  const animatedCoordRef = useRef<any | null>(null);
  const [etaText, setEtaText] = useState<string>('');

  const haversineMeters = (a:{lat:number;lng:number}, b:{lat:number;lng:number}) => {
    const toRad = (v:number)=> v*Math.PI/180;
    const R = 6371000;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const sa = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng/2)**2;
    return 2 * R * Math.asin(Math.sqrt(sa));
  };

  const postMessage = (data: any) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(data));
    }
  };

  // Fetch latest bus location
  const fetchLocation = useCallback(async () => {
    try {
      // Prefer public live endpoint for freshest data
      const busId = (user as any)?.bus;
      if (!busId) return;
      const resp = await api.get(`/api/public/bus/${busId}/live`);
      const live = resp?.data || {};
      const loc = live?.location;
      // Fetch route & compute next stop if server provided index/routeId
      let computedNextStop: BusLocation | null = null;
      try {
        const routeId = live?.routeId;
        const nextIdx = typeof live?.currentStopIndex === 'number' ? live.currentStopIndex : null;
        if (routeId) {
          const routesResp = await api.get(`/routes`, { params: { search: '' } });
          const route = Array.isArray(routesResp?.data) ? routesResp.data.find((r: any) => r.id === routeId) : null;
          const stops: any[] = route?.stops || [];
          if (stops && stops.length > 0) {
            if (nextIdx != null && stops[nextIdx] && typeof stops[nextIdx].lat === 'number' && typeof stops[nextIdx].lng === 'number') {
              computedNextStop = { lat: stops[nextIdx].lat, lng: stops[nextIdx].lng };
            } else if (loc) {
              // Fallback: nearest stop to current location
              const current = { lat: loc.lat, lng: loc.lng };
              let best: { s: any; d: number } | null = null;
              for (const s of stops) {
                if (typeof s.lat === 'number' && typeof s.lng === 'number') {
                  const d = haversineMeters(current, { lat: s.lat, lng: s.lng });
                  if (!best || d < best.d) best = { s, d };
                }
              }
              if (best) computedNextStop = { lat: best.s.lat, lng: best.s.lng };
            }
          }
        }
      } catch {}
      setNextStop(computedNextStop);
      if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
        const latest = { lat: loc.lat, lng: loc.lng };
        setBusLocation(latest);
        if (MapView && AnimatedRegion) {
          if (!animatedCoordRef.current) {
            animatedCoordRef.current = new AnimatedRegion({
              latitude: latest.lat,
              longitude: latest.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          } else {
            animatedCoordRef.current.timing({ latitude: latest.lat, longitude: latest.lng, duration: 1000, useNativeDriver: false }).start();
          }
        }
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
          // Compute ETA to next stop if available, else to school
          try {
            const target = nextStop || schoolLocation;
            const distM = haversineMeters(latest, target);
            const kmh = 25; // average speed fallback
            const mins = Math.round((distM/1000) / kmh * 60);
            setEtaText(`${(distM/1000).toFixed(1)} km • ~${mins} min`);
          } catch {}
        }
      }
    } catch (e) {
      console.error('Error fetching live bus status', e);
    }
  }, [mapReady, user]);

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

  const renderMapContent = () => {
    if (MapView) {
      const initial = busLocation || schoolLocation;
      return (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: initial.lat,
            longitude: initial.lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          showsUserLocation={false}
        >
          {busLocation && (
            <Marker.Animated coordinate={animatedCoordRef.current || { latitude: busLocation.lat, longitude: busLocation.lng }}>
              <View style={styles.busMarker}><Text style={styles.busMarkerText}>🚌</Text></View>
            </Marker.Animated>
          )}
          {schoolLocation && (
            <Marker coordinate={{ latitude: schoolLocation.lat, longitude: schoolLocation.lng }}>
              <View style={styles.schoolMarker}><Text style={styles.schoolMarkerText}>🏫</Text></View>
            </Marker>
          )}
          {routePath.length > 1 && (
            <Polyline coordinates={routePath.map(p => ({ latitude: p.lat, longitude: p.lng }))} strokeColor="#007BFF" strokeWidth={4} />
          )}
          {nextStop && (
            <Marker coordinate={{ latitude: nextStop.lat, longitude: nextStop.lng }}>
              <View style={styles.stopMarker}><Text style={styles.stopMarkerText}>⏳ Next Stop</Text></View>
            </Marker>
          )}
        </MapView>
      );
    }
    return (
      <>
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
          javaScriptEnabled
          scalesPageToFit
          cacheEnabled={false}
        />
      </>
    );
  };

  return (
    <View style={styles.container}>
      <Title>Track Bus</Title>
      {etaText ? (
        <View style={styles.etaChip}><Text style={styles.etaText}>ETA: {etaText}</Text></View>
      ) : null}
      {renderMapContent()}
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
  etaChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#00000088',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  etaText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
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
  },
  busMarker: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  busMarkerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  schoolMarker: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  schoolMarkerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  stopMarker: {
    backgroundColor: '#8C6CF7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stopMarkerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700'
  }
});