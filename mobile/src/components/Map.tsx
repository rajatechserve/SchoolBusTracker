import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getBusLocations } from '../services/api';

const Map = () => {
  const [busLocations, setBusLocations] = useState([]);

  useEffect(() => {
    const fetchBusLocations = async () => {
      const locations = await getBusLocations();
      setBusLocations(locations);
    };

    fetchBusLocations();
  }, []);

  return (
    <View style={styles.container}>
      <MapView style={styles.map}>
        {busLocations.map((bus, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
            title={bus.name}
            description={`Bus ID: ${bus.id}`}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default Map;