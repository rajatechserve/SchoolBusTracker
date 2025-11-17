import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Title } from 'react-native-paper';
import api from '../../services/api';

interface BusLocation {
  lat: number;
  lng: number;
}

export default function TrackBus() {
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await api.get('/buses');
        const buses = response.data || [];
        if (buses.length > 0 && buses[0].location) {
          setBusLocation({
            lat: buses[0].location.lat,
            lng: buses[0].location.lng,
          });
        }
      } catch (error) {
        console.error('Error fetching bus location:', error);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Title>Track Bus</Title>
      {busLocation ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: busLocation.lat,
            longitude: busLocation.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: busLocation.lat,
              longitude: busLocation.lng,
            }}
            title="Bus Location"
          />
        </MapView>
      ) : (
        <Title>Loading bus location...</Title>
      )}
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
    marginTop: 16,
  },
});