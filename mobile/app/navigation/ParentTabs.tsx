import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ParentDashboard from '../screens/Parent/ParentDashboard';
import ParentMap from '../screens/Parent/Map';
import Profile from '../screens/Common/Profile';
import Assignments from '../screens/Parent/Assignments';
import AttendanceScreen from '../screens/Parent/Attendance';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function ParentTabs() {
  return (
    <Tab.Navigator 
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={ParentDashboard}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={ParentMap}
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <MaterialIcons name="map" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Assignments"
        component={Assignments}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <MaterialIcons name="assignment" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <MaterialIcons name="person" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
