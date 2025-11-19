import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api, { attachToken } from '../../services/api';
import { router } from 'expo-router';

type Role = 'driver' | 'parent';

export default function UnifiedLogin() {
  const { loginLocal } = useAuth();
  const [role, setRole] = useState<Role>('driver');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const phoneValid = /^\+?\d{7,15}$/.test(phone.trim());
  const nameValid = name.trim().length >= 2;
  const driverValid = nameValid && phoneValid && busNumber.trim().length >= 2;
  const parentValid = nameValid && phoneValid;
  const canSubmit = useMemo(() => (role === 'driver' ? driverValid : parentValid), [role, driverValid, parentValid]);

  const submit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      if (role === 'driver') {
        const resp = await api.post('/auth/driver-login', { phone: phone.trim(), name: name.trim(), bus: busNumber.trim() });
        const token = resp.data?.token;
        if (token) attachToken(token);
        loginLocal('driver', { id: phone.trim(), name: name.trim(), bus: busNumber.trim(), phone: phone.trim() }, token);
      } else {
        const resp = await api.post('/auth/parent-login', { phone: phone.trim(), name: name.trim() });
        const token = resp.data?.token;
        if (token) attachToken(token);
        loginLocal('parent', { id: phone.trim(), name: name.trim(), phone: phone.trim() }, token);
      }
      // Navigate to tabs after successful login
      router.replace('/(tabs)');
    } catch (e: any) {
      console.warn('Login failed', e?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          onPress={() => setRole('driver')}
          style={[styles.toggleButton, role === 'driver' && styles.toggleActive]}
        >
          <Text style={[styles.toggleText, role === 'driver' && styles.toggleTextActive]}>Driver</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setRole('parent')}
          style={[styles.toggleButton, role === 'parent' && styles.toggleActive]}
        >
          <Text style={[styles.toggleText, role === 'parent' && styles.toggleTextActive]}>Parent</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formBlock}>
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          autoCapitalize="words"
        />
        <TextInput
          placeholder="Mobile (e.g. +1234567890)"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          keyboardType="phone-pad"
        />
        {role === 'driver' && (
          <TextInput
            placeholder="Bus Number"
            value={busNumber}
            onChangeText={setBusNumber}
            style={styles.input}
            autoCapitalize="characters"
          />
        )}
        <Text style={styles.helper}>{canSubmit ? 'Ready' : role === 'driver' ? 'Need name, phone, bus (2+ chars)' : 'Need name (2+) & valid phone'}</Text>
      </View>

      <TouchableOpacity
        onPress={submit}
        disabled={!canSubmit || loading}
        style={[styles.submitButton, (!canSubmit || loading) && styles.submitDisabled]}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{role === 'driver' ? 'Login as Driver' : 'Login as Parent'}</Text>}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#007BFF',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleActive: {
    backgroundColor: '#007BFF',
  },
  toggleText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#007BFF',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  formBlock: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  helper: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  submitDisabled: {
    backgroundColor: '#7daee9',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});