import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function DriverLogin({ navigation }: { navigation: any }) {
  const [driver, setDriver] = useState('');
  const [bus, setBus] = useState('');
  const { login } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Login</Text>
      <TextInput
        placeholder="Driver ID"
        value={driver}
        onChangeText={setDriver}
        style={styles.input}
      />
      <TextInput
        placeholder="Bus Number"
        value={bus}
        onChangeText={setBus}
        style={styles.input}
      />
      <TouchableOpacity
        onPress={() => {
          login('driver', {
            id: driver || 'drv1',
            name: 'Driver ' + (driver || '1'),
            bus: bus || 'BUS1',
          });
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
