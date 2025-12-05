import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { TextInput as PaperTextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import api, { attachToken, request } from '../../services/api';
import { router } from 'expo-router';

export default function DriverLogin() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [schoolName, setSchoolName] = useState<string>('School Bus Tracker');
  const { loginLocal } = useAuth();
  const valid = /^\d{10}$/.test(phone.trim());

  useEffect(() => {
    const loadSchool = async () => {
      try {
        const schoolId = process.env.EXPO_PUBLIC_SCHOOL_ID;
        if (schoolId) {
          const resp = await request({ method: 'get', url: `/public/schools/${schoolId}` });
          const name = resp.data?.name || resp.data?.schoolName;
          if (name) setSchoolName(name);
        }
      } catch {
        // ignore and keep default
      }
    };
    loadSchool();
  }, []);

  const submit = async () => {
    if (!valid || loading) return;
    setLoading(true);
    try {
      const resp = await request({ method: 'post', url: '/auth/driver-login', data: { phone: phone.trim() } });
      const token = resp.data?.token;
      const driver = resp.data?.driver;
      if (token) attachToken(token);
      loginLocal('driver', { 
        id: driver.id, 
        name: driver.name, 
        phone: driver.phone, 
        schoolId: driver.schoolId 
      }, token);
      router.replace('/(tabs)');
    } catch(e:any){ 
      Alert.alert('Login Failed', e?.response?.data?.error || e?.message || 'Driver not found with this phone number');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">{schoolName}</Text>
      </View>
      <Text style={styles.title}>Driver Login</Text>
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
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
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
