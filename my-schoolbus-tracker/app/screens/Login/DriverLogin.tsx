import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api, { attachToken } from '../../services/api';
import { router } from 'expo-router';

export default function DriverLogin() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginLocal } = useAuth();
  const valid = /^\+?\d{7,15}$/.test(phone.trim());

  const submit = async () => {
    if (!valid || loading) return;
    setLoading(true);
    try {
      const resp = await api.post('/auth/driver-login', { phone: phone.trim() });
      const token = resp.data?.token;
      if (token) attachToken(token);
      const busNumber = resp.data?.driver?.bus || null;
      loginLocal('driver', { id: phone.trim(), name: resp.data?.driver?.name || `Driver ${phone.slice(-4)}`, phone: phone.trim(), bus: busNumber }, token);
      router.replace('/(tabs)');
    } catch(e:any){ console.warn('Driver login failed', e?.message); } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Login</Text>
      <TextInput placeholder="Mobile (+123...)" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
      <TouchableOpacity disabled={!valid || loading} onPress={submit} style={[styles.button, (!valid||loading)&&styles.buttonDisabled]}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
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
