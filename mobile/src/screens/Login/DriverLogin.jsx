
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export default function DriverLogin({ navigation }) {
  const [driver, setDriver] = useState('');
  const [bus, setBus] = useState('');
  const { login } = useAuth();

  return (
    <View style={styles.container}>
      <Title>Driver Login</Title>
      <TextInput label="Driver ID" value={driver} onChangeText={setDriver} style={styles.input} />
      <TextInput label="Bus Number" value={bus} onChangeText={setBus} style={styles.input} />
      <Button mode="contained" onPress={() => { login('driver', { id: driver || 'drv1', name: 'Driver ' + (driver || '1') , bus: bus || 'BUS1' }); }} style={styles.btn}>
        Continue
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex:1, justifyContent:'center', padding:20 }, input: { marginTop:12 }, btn: { marginTop:20 } });
