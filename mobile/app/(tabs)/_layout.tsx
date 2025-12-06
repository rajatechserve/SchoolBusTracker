import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';

import { HapticTab } from '../../components/haptic-tab';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { useAuth } from '../context/AuthContext';
import { Redirect } from 'expo-router';

export default function TabLayout() {
  const colorScheme = 'light';
  const { user } = useAuth();

  // If no user, shouldn't be here - but routing guard should handle this
  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0d47a1',
        tabBarInactiveTintColor: '#607d8b',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: { height: 72, paddingBottom: 10, paddingTop: 6, backgroundColor: '#ffffff', borderTopColor: '#e0e0e0', borderTopWidth: 1 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: focused ? 2 : 4 }}>
              <Text style={{ fontSize: focused ? 30 : 28, color }}>🏠</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: focused ? 2 : 4 }}>
              <Text style={{ fontSize: focused ? 30 : 28, color }}>👤</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: 'Assign',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: focused ? 2 : 4 }}>
              <Text style={{ fontSize: focused ? 30 : 28, color }}>📋</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alert',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: focused ? 2 : 4 }}>
              <Text style={{ fontSize: focused ? 30 : 28, color }}>🔔</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="logout"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
