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
  ImageBackground,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform, StatusBar } from 'react-native';
let LinearGradient: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('expo-linear-gradient');
  LinearGradient = mod?.LinearGradient || null;
} catch {
  LinearGradient = null;
}
import { Appbar, Drawer, Divider } from 'react-native-paper';
// Use legacy API to avoid deprecation warnings on Expo SDK 54
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import api, { baseURL, cancelAllRequests } from '../services/api';

const { width } = Dimensions.get('window');

interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  mobile: string;
  logo?: string;
}

interface AppHeaderProps {
  showFullInfo?: boolean;
  showBackButton?: boolean;
  showBanner?: boolean;
  onSchoolLoaded?: (school: School) => void;
}

export default function AppHeader({ showFullInfo = false, showBackButton = false, showBanner = false, onSchoolLoaded }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [school, setSchool] = useState<School | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const slideAnim = useState(new Animated.Value(-width * 0.6))[0];
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const [brandingVersion, setBrandingVersion] = useState<number>(Date.now());
  const [headerColorFrom, setHeaderColorFrom] = useState<string | null>(null);
  const [headerColorTo, setHeaderColorTo] = useState<string | null>(null);
  const [sidebarColorFrom, setSidebarColorFrom] = useState<string | null>(null);
  const [sidebarColorTo, setSidebarColorTo] = useState<string | null>(null);
  const [prefTheme, setPrefTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [isDark, setIsDark] = useState(false);

  const colorMap: Record<string, string> = {
    white: '#ffffff',
    'blue-500': '#3b82f6', 'indigo-600': '#4f46e5', 'purple-600': '#9333ea',
    'pink-500': '#ec4899', 'red-500': '#ef4444', 'orange-500': '#f97316',
    'amber-500': '#f59e0b', 'yellow-500': '#eab308', 'lime-500': '#84cc16',
    'green-600': '#16a34a', 'emerald-600': '#059669', 'teal-600': '#0d9488',
    'cyan-500': '#06b6d4', 'sky-500': '#0ea5e9', 'violet-600': '#7c3aed',
    'fuchsia-600': '#c026d3', 'rose-500': '#f43f5e', 'slate-700': '#334155'
  };
  const resolveColor = (val?: string | null): string | null => {
    if (!val) return null;
    const trimmed = val.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('#') || /^rgb\(/.test(trimmed)) return trimmed;
    return colorMap[trimmed] || null;
  };

  useEffect(() => {
    // First hydrate from cache (fast, offline friendly), then attempt a single version check.
    hydrateFromCacheThenFetch();
    loadUserImage();
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('@app_theme');
        if (saved === 'light' || saved === 'dark' || saved === 'system') setPrefTheme(saved);
      } catch {}
      const scheme = (globalThis as any).Appearance?.getColorScheme?.() || null;
      const effective = savedThemeToScheme(prefTheme, scheme);
      setIsDark(effective === 'dark');
    })();
  }, [user?.schoolId, user?.id]);

  const savedThemeToScheme = (pref: 'light' | 'dark' | 'system', systemScheme: string | null) => {
    return pref === 'system' ? (systemScheme || 'light') : pref;
  };

  const loadUserImage = async () => {
    if (!user?.id) return;
    try {
      const savedImage = await AsyncStorage.getItem(`userImage_${user.id}`);
      if (savedImage) {
        setUserImage(savedImage);
      }
    } catch (error) {
      console.error('Failed to load user image:', error);
    }
  };

  const hydrateFromCacheThenFetch = async () => {
    if (!user?.schoolId) return;
    try {
      const cachedSchoolDataStr = await AsyncStorage.getItem(`schoolData_${user.schoolId}`);
      if (cachedSchoolDataStr) {
        const cached = JSON.parse(cachedSchoolDataStr);
        setHeaderColorFrom(resolveColor(cached.headerColorFrom));
        setHeaderColorTo(resolveColor(cached.headerColorTo));
        setSidebarColorFrom(resolveColor(cached.sidebarColorFrom));
        setSidebarColorTo(resolveColor(cached.sidebarColorTo));
        // Cached logo/banner URIs (already downloaded) if present
        const cachedLogo = await AsyncStorage.getItem(`schoolLogo_${user.schoolId}`);
        if (cachedLogo) setLogoImage(cachedLogo);
        const cachedBanner = await AsyncStorage.getItem(`schoolBanner_${user.schoolId}`);
        if (cachedBanner && showBanner) setBannerImage(cachedBanner);
        // Minimal school object for immediate UI
        setSchool({
          id: user.schoolId,
          name: cached.name || cached.schoolName || 'School',
          address: cached.address,
          phone: cached.phone,
          mobile: cached.mobile,
          logo: cached.logo,
        });
      }
    } catch {}
    // After hydration attempt remote version check (single fetch)
    await loadSchoolInfoVersionAware();
  };

  const loadSchoolInfoVersionAware = async () => {
    if (!user?.schoolId) return;
    try {
      const response = await api.request({ method: 'get', url: `/public/schools/${user.schoolId}` });
      console.log('School API Response:', response.data);
      
      const schoolData = response.data;
      // Determine incoming version (timestamp or provided version field)
      const incomingVersion = Number(schoolData.version || schoolData.lastUpdated || schoolData.updatedAt || Date.now());
      const cachedSchoolDataStr = await AsyncStorage.getItem(`schoolData_${user.schoolId}`);
      let cachedVersion: number | null = null;
      if (cachedSchoolDataStr) {
        try { cachedVersion = Number(JSON.parse(cachedSchoolDataStr).version) || null; } catch {}
      }
      const versionChanged = !cachedVersion || cachedVersion !== incomingVersion;

      // Persist metadata (always update version / colors for consistency)
      await AsyncStorage.setItem(`schoolData_${user.schoolId}`, JSON.stringify({
        name: schoolData.name,
        address: schoolData.address,
        phone: schoolData.phone,
        mobile: schoolData.mobile,
        logo: schoolData.logo,
        photo: schoolData.photo,
        headerColorFrom: schoolData.headerColorFrom || null,
        headerColorTo: schoolData.headerColorTo || null,
        sidebarColorFrom: schoolData.sidebarColorFrom || null,
        sidebarColorTo: schoolData.sidebarColorTo || null,
        version: incomingVersion
      }));

      // Resolve and persist colors locally for offline use
      const hFrom = resolveColor(schoolData.headerColorFrom);
      const hTo = resolveColor(schoolData.headerColorTo);
      const sFrom = resolveColor(schoolData.sidebarColorFrom);
      const sTo = resolveColor(schoolData.sidebarColorTo);
      setHeaderColorFrom(hFrom);
      setHeaderColorTo(hTo);
      setSidebarColorFrom(sFrom);
      setSidebarColorTo(sTo);
      if (hFrom) await AsyncStorage.setItem(`schoolHeaderFrom_${user.schoolId}`, hFrom); else await AsyncStorage.removeItem(`schoolHeaderFrom_${user.schoolId}`);
      if (hTo) await AsyncStorage.setItem(`schoolHeaderTo_${user.schoolId}`, hTo); else await AsyncStorage.removeItem(`schoolHeaderTo_${user.schoolId}`);
      if (sFrom) await AsyncStorage.setItem(`schoolSidebarFrom_${user.schoolId}`, sFrom); else await AsyncStorage.removeItem(`schoolSidebarFrom_${user.schoolId}`);
      if (sTo) await AsyncStorage.setItem(`schoolSidebarTo_${user.schoolId}`, sTo); else await AsyncStorage.removeItem(`schoolSidebarTo_${user.schoolId}`);
      // Only refresh/download images if version changed
      if (versionChanged) {
        if (user?.schoolId) {
          const host = (baseURL || api.defaults.baseURL || '').replace(/\/api$/, '') || 'http://localhost:4000';
          const logoUrl = `${host}/api/schools/${user.schoolId}/logo`; // removed timestamp for strict caching
          schoolData.logo = logoUrl;
          await loadLogoImage(logoUrl, true);
        }
        if (showBanner) {
          const host = (baseURL || api.defaults.baseURL || '').replace(/\/api$/, '') || 'http://localhost:4000';
          const bannerUrl = `${host}/api/schools/${user.schoolId}/banner`; // removed timestamp for strict caching
          await loadBannerImage(bannerUrl, true);
        }
      } else {
        // Use cached logo/banner if present without re-download
        const cachedLogo = await AsyncStorage.getItem(`schoolLogo_${user.schoolId}`);
        if (cachedLogo) setLogoImage(cachedLogo);
        if (showBanner) {
          const cachedBanner = await AsyncStorage.getItem(`schoolBanner_${user.schoolId}`);
          if (cachedBanner) setBannerImage(cachedBanner);
        }
      }
      
      setSchool(schoolData);
      setBrandingVersion(incomingVersion || Date.now());
      setLastRefreshTime(Date.now()); // Trigger re-render
      if (onSchoolLoaded) {
        onSchoolLoaded(schoolData);
      }
    } catch (e) {
      console.error('Failed to load school info:', e);
      // Fallback: load cached colors
      try {
        if (user?.schoolId) {
          const hFrom = await AsyncStorage.getItem(`schoolHeaderFrom_${user.schoolId}`);
          const hTo = await AsyncStorage.getItem(`schoolHeaderTo_${user.schoolId}`);
          const sFrom = await AsyncStorage.getItem(`schoolSidebarFrom_${user.schoolId}`);
          const sTo = await AsyncStorage.getItem(`schoolSidebarTo_${user.schoolId}`);
          setHeaderColorFrom(resolveColor(hFrom));
          setHeaderColorTo(resolveColor(hTo));
          setSidebarColorFrom(resolveColor(sFrom));
          setSidebarColorTo(resolveColor(sTo));
        }
      } catch (colorErr) {
        console.warn('Failed to load cached colors:', colorErr);
      }
    }
  };

  // Listen for manual refresh event
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const emitter: any = (globalThis as any)?.DeviceEventEmitter;
    if (!emitter || !emitter.addListener) return;
    const sub = emitter.addListener('refresh-school-branding', async () => {
      console.log('Manual branding refresh triggered');
      await loadSchoolInfoVersionAware();
    });
    return () => { try { sub?.remove?.(); } catch {} };
  }, [user?.schoolId]);

  const loadLogoImage = async (logoUrl: string, forceClear: boolean = false) => {
    try {
      const urlWithBuster = logoUrl + (logoUrl.includes('?') ? `&v=${Date.now()}` : `?v=${Date.now()}`);
      if (!forceClear) {
        const cachedLogo = await AsyncStorage.getItem(`schoolLogo_${user?.schoolId}`);
        if (cachedLogo) {
          console.log('Using cached logo image');
          setLogoImage(cachedLogo);
          return;
        }
      } else {
        console.log('Force clearing logo cache and reloading');
      }

      let finalUri = urlWithBuster;
      if (urlWithBuster.startsWith('http')) {
        try {
          const fileName = `schoolLogo_${user?.schoolId}.jpg`;
          const filePath = FileSystem.cacheDirectory + fileName;
          const info = await FileSystem.getInfoAsync(filePath);
          if (!info.exists || forceClear) {
            console.log('Downloading logo image to cache:', filePath);
            await FileSystem.downloadAsync(urlWithBuster, filePath);
          }
          finalUri = filePath;
        } catch (downloadErr) {
          console.warn('Logo download failed, using remote URL:', downloadErr);
        }
      }
      console.log('Setting logo image URI:', finalUri);
      setLogoImage(finalUri);
      await AsyncStorage.setItem(`schoolLogo_${user?.schoolId}`, finalUri);
    } catch (error) {
      console.error('Failed to load logo image:', error);
    }
  };

  const loadBannerImage = async (logoUrl: string, forceClear: boolean = false) => {
    try {
      // Add cache-buster to avoid stale/partial cached streams on Android
      const urlWithBuster = logoUrl + (logoUrl.includes('?') ? `&v=${Date.now()}` : `?v=${Date.now()}`);
      // If forceClear is true, skip cache check
      if (!forceClear) {
        // Check if banner is already cached
        const cachedBanner = await AsyncStorage.getItem(`schoolBanner_${user?.schoolId}`);
        if (cachedBanner) {
          console.log('Using cached banner image');
          setBannerImage(cachedBanner);
          return;
        }
      } else {
        console.log('Force clearing banner cache and reloading');
      }
      
      // Attempt to download & cache locally for reliability (falls back to remote URL)
      let finalUri = urlWithBuster;
      if (urlWithBuster.startsWith('http')) {
        try {
          const fileName = `schoolBanner_${user?.schoolId}.jpg`;
          const filePath = FileSystem.cacheDirectory + fileName;
          const info = await FileSystem.getInfoAsync(filePath);
          if (!info.exists || forceClear) {
            console.log('Downloading banner image to cache:', filePath);
            await FileSystem.downloadAsync(urlWithBuster, filePath);
          }
          finalUri = filePath;
        } catch (downloadErr) {
          console.warn('Banner download failed, using remote URL:', downloadErr);
        }
      }
      console.log('Setting banner image URI:', finalUri);
      setBannerImage(finalUri);
      await AsyncStorage.setItem(`schoolBanner_${user?.schoolId}`, finalUri);
    } catch (error) {
      console.error('Failed to load banner image:', error);
    }
  };

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: -width * 0.6,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setDrawerVisible(false);
    });
  };

  const changeUserImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please grant permission to access your photos.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setUserImage(imageUri);
        
        // Save to storage
        if (user?.id) {
          await AsyncStorage.setItem(`userImage_${user.id}`, imageUri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleLogout = async () => {
    console.log('=== LOGOUT BUTTON PRESSED ===');
    
    try {
      // Close drawer immediately
      setDrawerVisible(false);
      console.log('Drawer visibility set to false');
      
      // Cancel any in-flight API requests to avoid axios state errors
      cancelAllRequests('User initiated logout');

      // Clear auth state
      console.log('Clearing auth state...');
      logout();
      console.log('Auth cleared');
      
      // Navigate to login
      console.log('Navigating to login page...');
      router.replace('/login');
      console.log('Navigation complete');
      
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const navigateTo = (screen: string) => {
    // Close drawer animation first
    Animated.timing(slideAnim, {
      toValue: -width * 0.6,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setDrawerVisible(false);
    });
    
    // Navigate after animation starts  
    setTimeout(() => {
      try {
        console.log('Navigating to:', screen, 'Role:', user?.role);
        
        // Use Expo Router paths for tab navigation
        if (screen === 'dashboard') {
          router.push('/(tabs)/');
        } else if (screen === 'profile') {
          router.push('/(tabs)/profile');
        } else if (screen === 'assignments') {
          router.push('/(tabs)/assignments');
        } else if (screen === 'attendance') {
          // For parent role, attendance might be in assignments or separate
          router.push('/(tabs)/assignments');
        } else if (screen === 'notifications') {
          router.push('/(tabs)/notifications');
        }
        console.log('Navigation completed');
      } catch (error) {
        console.error('Navigation error:', error);
        Alert.alert('Navigation Error', 'Failed to navigate to the screen.');
      }
    }, 50);
  };

  return (
    <>
      {/* Header with Material Appbar */}
      <SafeAreaView style={styles.safeArea}>
        {headerColorFrom && headerColorTo && LinearGradient ? (
          <LinearGradient colors={[headerColorFrom, headerColorTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
            <Appbar.Header style={{ backgroundColor: 'transparent' }}>
              {showBackButton ? (
                <Appbar.BackAction onPress={() => router.push('/(tabs)/')} color="#fff" />
              ) : (
                <Appbar.Action icon="menu" onPress={openDrawer} color="#fff" />
              )}
              {logoImage ? (
                <Image source={{ uri: logoImage }} style={styles.logo} />
              ) : school?.logo ? (
                <Image source={{ uri: school.logo }} style={styles.logo} />
              ) : (
                <View style={styles.logoPlaceholder}><Text style={styles.logoText}>🏫</Text></View>
              )}
              <Appbar.Content
                title={school?.name || 'School Name'}
                subtitle={school?.address || school?.phone || ''}
                titleStyle={{ color: '#fff' }}
                subtitleStyle={{ color: '#e0e0e0' }}
                style={{ flexGrow: 1 }}
              />
              <Appbar.Action icon="logout" onPress={handleLogout} color="#fff" />
            </Appbar.Header>
          </LinearGradient>
        ) : (
          <Appbar.Header style={isDark ? { backgroundColor: '#121212' } : undefined}>
            {showBackButton ? (
              <Appbar.BackAction onPress={() => router.push('/(tabs)/')} />
            ) : (
              <Appbar.Action icon="menu" onPress={openDrawer} />
            )}
            {logoImage ? (
              <Image source={{ uri: logoImage }} style={styles.logo} />
            ) : school?.logo ? (
              <Image source={{ uri: school.logo }} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder}><Text style={styles.logoText}>🏫</Text></View>
            )}
            <Appbar.Content
              title={school?.name || 'School Name'}
              subtitle={school?.address || school?.phone || ''}
              style={{ flexGrow: 1 }}
              titleStyle={isDark ? { color: '#fff' } : undefined}
              subtitleStyle={isDark ? { color: '#ccc' } : undefined}
            />
            <Appbar.Action icon="logout" onPress={handleLogout} />
          </Appbar.Header>
        )}
      </SafeAreaView>

      {/* School Banner - Only on Home Page */}
      {showBanner && bannerImage && (
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: bannerImage }}
            style={styles.bannerImageDisplay}
            resizeMode="contain"
            onError={(error: any) => {
              console.log('Banner image load error:', error.nativeEvent?.error);
              setBannerImage(null);
            }}
            onLoad={() => console.log('Banner image loaded successfully')}
          />
        </View>
      )}

      {/* Drawer Menu */}
      <Modal
        visible={drawerVisible}
        transparent
        animationType="none"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        hardwareAccelerated
        onRequestClose={closeDrawer}
      >
        <View style={styles.modalRoot} pointerEvents="box-none">
          {/* Overlay */}
          <TouchableOpacity
            style={[styles.overlay]}
            activeOpacity={1}
            onPress={closeDrawer}
          />
          {/* Drawer */}
          <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}
          >
            <View style={[styles.drawer, { backgroundColor: isDark ? '#121212' : '#fff' }]}
            >
              {/* Profile Section */}
              {sidebarColorFrom && sidebarColorTo ? (
                <LinearGradient
                  colors={[sidebarColorFrom, sidebarColorTo]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.profileSection, isDark ? { borderBottomColor: '#222' } : undefined]}
                >
                  <TouchableOpacity style={styles.avatarContainer} onPress={changeUserImage} activeOpacity={0.8}>
                    {userImage ? (
                      <Image source={{ uri: userImage }} style={styles.userImage} />
                    ) : (
                      <View style={styles.defaultAvatar}><Text style={styles.avatar}>👤</Text></View>
                    )}
                    <View style={styles.editBadge}><Text style={styles.editIcon}>✎</Text></View>
                  </TouchableOpacity>
                  <Text style={styles.userName}>{user?.name || user?.fullName || user?.phone || 'User'}</Text>
                  <Text style={styles.userRole}>{(user?.role || 'role').toUpperCase()}</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.profileSection, { backgroundColor: isDark ? '#1e1e1e' : '#007BFF' }] }>
                  <TouchableOpacity style={styles.avatarContainer} onPress={changeUserImage} activeOpacity={0.8}>
                    {userImage ? (
                      <Image source={{ uri: userImage }} style={styles.userImage} />
                    ) : (
                      <View style={styles.defaultAvatar}><Text style={styles.avatar}>👤</Text></View>
                    )}
                    <View style={styles.editBadge}><Text style={styles.editIcon}>✎</Text></View>
                  </TouchableOpacity>
                  <Text style={styles.userName}>{user?.name || user?.fullName || user?.phone || 'User'}</Text>
                  <Text style={styles.userRole}>{(user?.role || 'role').toUpperCase()}</Text>
                </View>
              )}
              <Drawer.Section style={isDark ? { backgroundColor: '#1e1e1e' } : undefined}>
                <Drawer.Item
                  label="Dashboard"
                  icon="home"
                  onPress={() => navigateTo('dashboard')}
                />
                <Drawer.Item
                  label="Profile"
                  icon="account"
                  onPress={() => navigateTo('profile')}
                />
                <Drawer.Item
                  label="Alerts"
                  icon="bell"
                  onPress={() => navigateTo('notifications')}
                />
                <Drawer.Item
                  label="Assignments"
                  icon="clipboard-list"
                  onPress={() => navigateTo('assignments')}
                />
                {user?.role === 'parent' && (
                  <Drawer.Item
                    label="Attendance"
                    icon="chart-bar"
                    onPress={() => navigateTo('attendance')}
                  />
                )}
              </Drawer.Section>
              <Divider />
              <Drawer.Section style={isDark ? { backgroundColor: '#1e1e1e' } : undefined}>
                <Drawer.Item
                  label="Logout"
                  icon="logout"
                  onPress={handleLogout}
                />
              </Drawer.Section>
            </View>
          </Animated.View>
          
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    // Background will be set dynamically to match header for proper mobile top view
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
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
    position: 'relative',
  },
  bannerContainer: {
    width: '100%',
    height: 80,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  bannerImageDisplay: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
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
    backgroundColor: '#fff',
    padding: 2,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
  },
  modalRoot: {
    flex: 1,
  },
  drawerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 2001,
    elevation: 100,
    width: width * 0.6,
  },
  drawer: {
    flex: 1,
    backgroundColor: '#fff',
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
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    position: 'relative',
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    fontSize: 50,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007BFF',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editIcon: {
    fontSize: 14,
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
  logoutSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#007BFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: '600',
    flex: 1,
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  headerLogoutButton: {
    position: 'absolute',
    right: 12,
    top: Platform.OS === 'android' ? 8 : 6,
    padding: 6,
    zIndex: 50,
  },
  headerLogoutIcon: {
    fontSize: 22,
    color: '#333',
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
