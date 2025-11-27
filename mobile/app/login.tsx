import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import api from './services/api';
import NetInfo from '@react-native-community/netinfo';

export default function LoginScreen() {
  const { loginLocal } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const validatePhone = (phoneNumber: string) => {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const handleLogin = async () => {
    const trimmedPhone = phone.trim();
    
    // Check internet connection first
    if (isConnected === false) {
      Alert.alert(
        'No Internet Connection', 
        'Please check your internet connection and try again.'
      );
      return;
    }
    
    if (!trimmedPhone) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }

    if (!validatePhone(trimmedPhone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      // Call backend mobile login API with just phone number
      // Backend will determine if user is driver or parent
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Phone:', trimmedPhone);
      
      const response = await api.post('/auth/mobile-login', {
        phone: trimmedPhone,
      });

      console.log('=== LOGIN RESPONSE ===');
      console.log('Response data:', response.data);
      
      const { user, token, role } = response.data;
      
      console.log('User:', user);
      console.log('Role:', role);
      console.log('Token:', token ? 'Token received' : 'No token');
      
      // Store auth data with role from backend
      loginLocal(role, user, token);
      
      console.log('Auth data stored, navigating to tabs...');
      
      // Navigate to home
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error?.response?.data);
      
      let errorTitle = 'Login Failed';
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error?.message === 'Network Error' || !error?.response) {
        // Network/Internet connection error
        errorTitle = 'Connection Error';
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (error?.response?.status === 401 || error?.response?.status === 403) {
        // Authentication error
        errorTitle = 'Authentication Failed';
        errorMessage = error?.response?.data?.error || 'Invalid mobile number or you do not have access. Please contact your administrator.';
      } else if (error?.response?.status === 404) {
        // User not found
        errorTitle = 'User Not Found';
        errorMessage = 'No account found with this mobile number. Please check your number or contact your administrator.';
      } else if (error?.response?.status >= 500) {
        // Server error
        errorTitle = 'Server Error';
        errorMessage = 'The server is currently unavailable. Please try again later.';
      } else if (error?.response?.data?.error) {
        // Custom error from server
        errorMessage = error.response.data.error;
      }
      
      Alert.alert(errorTitle, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {isConnected === false && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>⚠️ No Internet Connection</Text>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>🚌</Text>
          <Text style={styles.title}>School Bus Tracker</Text>
          <Text style={styles.subtitle}>Enter your mobile number to login</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="10-digit Mobile Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
            autoFocus
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  offlineBanner: {
    backgroundColor: '#ff9800',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loginButton: {
    backgroundColor: '#007BFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
