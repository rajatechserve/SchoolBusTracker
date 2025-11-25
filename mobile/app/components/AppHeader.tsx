import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import api from '../services/api';

const { width } = Dimensions.get('window');

interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  mobile: string;
  logo?: string;
}

export default function AppHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [school, setSchool] = useState<School | null>(null);
  const slideAnim = useState(new Animated.Value(-width * 0.8))[0];

  useEffect(() => {
    loadSchoolInfo();
  }, [user?.schoolId]);

  const loadSchoolInfo = async () => {
    if (!user?.schoolId) return;
    try {
      const response = await api.get(`/public/schools/${user.schoolId}`);
      console.log('School data:', response.data);
      // Prepend API base URL to logo if it's a relative path
      const schoolData = response.data;
      if (schoolData.logo && !schoolData.logo.startsWith('http')) {
        schoolData.logo = `${api.defaults.baseURL}${schoolData.logo}`;
      }
      setSchool(schoolData);
    } catch (e) {
      console.error('Failed to load school info:', e);
    }
  };

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: -width * 0.8,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setDrawerVisible(false);
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            closeDrawer();
            logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const navigateTo = (screen: string) => {
    closeDrawer();
    if (screen === 'dashboard') {
      router.replace('/(tabs)');
    } else if (screen === 'profile') {
      router.replace('/(tabs)/profile');
    } else if (screen === 'notifications') {
      router.replace('/(tabs)/notifications');
    } else if (screen === 'assignments') {
      router.replace('/(tabs)/assignments');
    }
  };

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        
        <View style={styles.schoolInfo}>
          {school?.logo ? (
            <Image source={{ uri: school.logo }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>🏫</Text>
            </View>
          )}
          <View style={styles.schoolDetails}>
            <Text style={styles.schoolName} numberOfLines={1}>
              {school?.name || 'School Name'}
            </Text>
            <Text style={styles.schoolAddress} numberOfLines={1}>
              📍 {school?.address || 'Loading...'}
            </Text>
            {school?.phone && (
              <Text style={styles.schoolPhone} numberOfLines={1}>
                📞 {school.phone}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Drawer Menu */}
      <Modal
        visible={drawerVisible}
        transparent
        animationType="none"
        onRequestClose={closeDrawer}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.drawer,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {/* User Profile Section */}
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatar}>
                  {user?.role === 'driver' ? '🚌' : '👨‍👩‍👧‍👦'}
                </Text>
              </View>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
            </View>

            {/* Menu Items */}
            <View style={styles.menuSection}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('dashboard')}
              >
                <Text style={styles.menuItemIcon}>🏠</Text>
                <Text style={styles.menuItemText}>Dashboard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('profile')}
              >
                <Text style={styles.menuItemIcon}>👤</Text>
                <Text style={styles.menuItemText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('notifications')}
              >
                <Text style={styles.menuItemIcon}>🔔</Text>
                <Text style={styles.menuItemText}>Notifications</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo('assignments')}
              >
                <Text style={styles.menuItemIcon}>📋</Text>
                <Text style={styles.menuItemText}>Assignments</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={closeDrawer}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 24,
    color: '#333',
  },
  schoolInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 24,
  },
  schoolDetails: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  schoolAddress: {
    fontSize: 12,
    color: '#666',
  },
  schoolPhone: {
    fontSize: 11,
    color: '#007BFF',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    width: width * 0.8,
    backgroundColor: '#fff',
    height: '100%',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 8,
  },
  closeIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  profileSection: {
    backgroundColor: '#007BFF',
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 40,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#e3f2fd',
    marginBottom: 4,
  },
  menuSection: {
    flex: 1,
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  footerSchoolName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  footerContact: {
    fontSize: 12,
    color: '#666',
  },
});
