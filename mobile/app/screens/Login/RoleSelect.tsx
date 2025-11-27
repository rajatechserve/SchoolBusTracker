import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api, { attachToken } from '../../services/api';
import { router } from 'expo-router';

export default function UnifiedLogin() {
  const { loginLocal } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const phoneValid = /^\d{10}$/.test(phone.trim());

  const submit = async () => {
    if (!phoneValid || loading) return;
    setLoading(true);
    try {
      const resp = await api.post('/auth/mobile-login', { phone: phone.trim() });
      const token = resp.data?.token;
      const role = resp.data?.role; // 'driver' or 'parent'
      const user = resp.data?.user;
      
      if (token && role && user) {
        attachToken(token);
        loginLocal(role, { 
          id: user.id, 
          name: user.name, 
          phone: user.phone, 
          schoolId: user.schoolId 
        }, token);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', 'Invalid response from server');
      }
    } catch (e: any) {
      Alert.alert('Login Failed', e?.response?.data?.error || e?.message || 'Unable to login. Please check your phone number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>🚌</Text>
        <Text style={styles.appName}>School Bus Tracker</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.title}>Mobile Login</Text>
        <Text style={styles.subtitle}>Enter your registered mobile number</Text>
        
        <TextInput
          placeholder="Mobile Number (10 digits)"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          keyboardType="phone-pad"
          maxLength={10}
          autoFocus
        />
        <Text style={styles.hint}>
          {phoneValid ? '✓ Ready to login' : 'Enter valid 10-digit mobile number'}
        </Text>

        <TouchableOpacity
          onPress={submit}
          disabled={!phoneValid || loading}
          style={[styles.submitButton, (!phoneValid || loading) && styles.submitDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Login</Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.note}>
          Your role (Driver/Parent) will be automatically detected based on your phone number.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 64,
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  hint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitDisabled: {
    backgroundColor: '#ccc',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});