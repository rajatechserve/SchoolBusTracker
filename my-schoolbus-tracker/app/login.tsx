import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function LoginRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Role</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/screens/Login/DriverLogin')}>
        <Text style={styles.buttonText}>Driver Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/screens/Login/ParentLogin')}>
        <Text style={styles.buttonText}>Parent Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 32 },
  button: { backgroundColor: '#007BFF', paddingVertical: 14, borderRadius: 6, marginBottom: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});