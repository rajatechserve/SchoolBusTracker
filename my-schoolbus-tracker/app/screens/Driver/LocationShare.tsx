import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function LocationShare() {
  const { user } = useAuth();
  const [sharing, setSharing] = useState(false);
  const ref = useRef<NodeJS.Timeout | null>(null);

  const start = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { alert('Permission denied'); return; }
    setSharing(true);
    ref.current = setInterval(async () => {
      const l = await Location.getCurrentPositionAsync({});
      try { await api.post(`/buses/${user?.bus || user?.id}/location`, { lat: l.coords.latitude, lng: l.coords.longitude }); } catch(e) { console.log('err', e?.message); }
    }, 8000);
  };

  const stop = () => { if (ref.current) clearInterval(ref.current); setSharing(false); };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sharing location for bus {user?.bus}</Text>
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
