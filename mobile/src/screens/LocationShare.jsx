
import React, { useState, useRef } from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import * as Location from 'expo-location';
import api from '../services/api';

export default function LocationShare({ route }) {
  const { bus } = route.params || {};
  const [sharing, setSharing] = useState(false);
  const ref = useRef(null);

  const start = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission denied');
      return;
    }
    setSharing(true);
    ref.current = setInterval(async () => {
      const l = await Location.getCurrentPositionAsync({});
      const { latitude: lat, longitude: lng } = l.coords;
      try {
        await api.post(`/buses/${bus}/location`, { lat, lng });
      } catch (e) {
        console.log('Location post failed');
      }
    }, 8000);
  };

  const stop = () => {
    if (ref.current) clearInterval(ref.current);
    setSharing(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text>Sharing location for bus {bus}</Text>
      <Button mode="contained" onPress={sharing ? stop : start} style={{ marginTop: 20 }}>
        {sharing ? 'Stop' : 'Start'} Sharing
      </Button>
    </View>
  );
}
