import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function RoleSelect({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select your role</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('DriverLogin')}
        style={styles.buttonPrimary}
      >
        <Text style={styles.buttonText}>I'm a Driver</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('ParentLogin')}
        style={styles.buttonSecondary}
      >
        <Text style={styles.buttonText}>I'm a Parent</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonPrimary: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 12,
  },
  buttonSecondary: {
    backgroundColor: '#6C757D',
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