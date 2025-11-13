
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';

export default function DriverLogin({ navigation }) {
  const [driver, setDriver] = useState('');
  const [bus, setBus] = useState('');

  return (
    <View style={styles.container}>
      <Title>Driver Login</Title>
      <TextInput label="Driver ID" value={driver} onChangeText={setDriver} style={styles.input} />
      <TextInput label="Bus Number" value={bus} onChangeText={setBus} style={styles.input} />
      <Button mode="contained" onPress={() => navigation.replace('DriverDashboard', { driver, bus })} style={styles.btn}>
        Continue
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { marginTop: 12 },
  btn: { marginTop: 20 },
});
