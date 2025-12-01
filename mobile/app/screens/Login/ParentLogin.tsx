import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { TextInput as PaperTextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import api, { attachToken, request } from '../../services/api';
import { router } from 'expo-router';

export default function ParentLogin() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginLocal } = useAuth();
  const valid = /^\d{10}$/.test(phone.trim());

  const submit = async () => {
    if (!valid || loading) return;
    setLoading(true);
    try {
        const resp = await request({ method: 'post', url: '/auth/parent-login', data: { phone: phone.trim() } });
      const token = resp.data?.token;
      const parent = resp.data?.parent;
      if (token) attachToken(token);
      loginLocal('parent', { 
        id: parent.id, 
        name: parent.name, 
        phone: parent.phone, 
        schoolId: parent.schoolId 
      }, token);
      router.replace('/(tabs)');
    } catch(e:any){ 
      Alert.alert('Login Failed', e?.response?.data?.error || e?.message || 'Parent not found with this phone number');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parent Login</Text>
      <Text style={styles.subtitle}>Enter your registered mobile number</Text>
      <PaperTextInput
        mode="outlined"
        label="Mobile Number"
        placeholder="10 digits"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={10}
      />
      <Text style={styles.hint}>{valid ? 'Ready to login' : 'Enter valid 10-digit mobile number'}</Text>
      <Button mode="contained" disabled={!valid || loading} onPress={submit}>
        {loading ? <ActivityIndicator animating={true} /> : 'Login'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
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
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
