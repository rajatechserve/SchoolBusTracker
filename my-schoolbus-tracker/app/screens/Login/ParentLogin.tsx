import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api, { attachToken } from '../../services/api';
import { router } from 'expo-router';

export default function ParentLogin() {
  const [phone, setPhone] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginLocal } = useAuth();
  const valid = /^\+?\d{7,15}$/.test(phone.trim());

  const submit = async () => {
    if (!valid || loading) return;
    setLoading(true);
    try {
      const resp = await api.post('/auth/parent-login', { phone: phone.trim(), studentId: studentId.trim() || undefined });
      const token = resp.data?.token;
      if (token) attachToken(token);
      const busId = resp.data?.parent?.bus || null;
      loginLocal('parent', { id: phone.trim(), name: resp.data?.parent?.name || `Parent ${phone.slice(-4)}`, phone: phone.trim(), bus: busId }, token);
      router.replace('/(tabs)');
    } catch(e:any){ console.warn('Parent login failed', e?.message); } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parent Login</Text>
      <TextInput placeholder="Mobile (+123...)" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
      <TextInput placeholder="Student ID (optional)" value={studentId} onChangeText={setStudentId} style={styles.input} />
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
