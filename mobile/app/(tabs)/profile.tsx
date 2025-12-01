import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Image,
  useColorScheme as useSystemColorScheme
} from 'react-native';
import { Button, TextInput as PaperTextInput, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { router, useFocusEffect } from 'expo-router';
import api, { request } from '../services/api';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const globalThis: any;
export default function ProfileScreen() {
  const { user, loginLocal } = useAuth();
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>('system');
  const [userImage, setUserImage] = useState<string | null>(null);
  const systemColorScheme = useSystemColorScheme();
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  const handleThemeChange = async (newTheme: ThemeMode) => {
    try {
      setSelectedTheme(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      Alert.alert('Theme Changed', `Theme preference set to ${newTheme}. Note: Theme changes will be fully supported in a future update.`, [{ text: 'OK' }]);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
      Alert.alert('Error', 'Failed to save theme preference');
    }
  };

  const triggerBrandingRefresh = () => {
    try {
      const emitter = globalThis?.DeviceEventEmitter;
      emitter?.emit?.('refresh-school-branding');
      Alert.alert('Branding', 'Refresh requested.');
    } catch (e) {
      Alert.alert('Branding', 'Unable to trigger refresh');
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader showBackButton={true} />
      <ScrollView>
        <View style={styles.header}>
        <View style={styles.avatarLarge}>
          {userImage ? (
            <Image source={{ uri: userImage }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {user?.role === 'driver' ? '🚌' : '👨‍👩‍👧‍👦'}
            </Text>
          )}
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{user?.name || '—'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone Number</Text>
            {isEditing ? (
              <View style={styles.editContainer}>
                <PaperTextInput
                  mode="outlined"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder="Enter phone number"
                />
              </View>
            ) : (
              <Text style={styles.value}>{user?.phone || '—'}</Text>
            )}
          </View>

          {isEditing ? (
            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={() => { setPhone(user?.phone || ''); setIsEditing(false); }}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdatePhone}
                loading={loading}
                disabled={loading}
                style={{ flex: 1 }}
              >
                Save
              </Button>
            </View>
          ) : (
            <Button mode="contained" onPress={() => setIsEditing(true)}>
              ✏️ Edit Phone Number
            </Button>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Theme</Text>
        <View style={styles.infoCard}>
          <View style={styles.themeRow}>
            <Button mode={selectedTheme === 'light' ? 'contained' : 'outlined'} onPress={() => handleThemeChange('light')}>☀️</Button>
            <Button mode={selectedTheme === 'dark' ? 'contained' : 'outlined'} onPress={() => handleThemeChange('dark')}>🌙</Button>
            <Button mode={selectedTheme === 'system' ? 'contained' : 'outlined'} onPress={() => handleThemeChange('system')}>⚙️</Button>
          </View>
          <Divider style={{ marginVertical: 8 }} />
          <Button mode="outlined" onPress={triggerBrandingRefresh}>Refresh Branding</Button>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 16,
    zIndex: 10,
    padding: 4,
  },
  backButtonIcon: {
    fontSize: 28,
    color: '#333',
    fontWeight: 'normal',
  },
  header: {
    backgroundColor: '#007BFF',
    padding: 8,
    alignItems: 'center',
  },
  avatarLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarText: {
    fontSize: 35,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  role: {
    fontSize: 16,
    color: '#e3f2fd',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  editContainer: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007BFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  themeIconButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f8f9fa',
  },
  themeIconButtonActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007BFF',
    borderWidth: 2,
  },
  themeIconOnly: {
    fontSize: 28,
  },
});
