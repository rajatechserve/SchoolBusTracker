import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ParentDashboard from '../screens/Parent/ParentDashboard';
import TrackBus from '../screens/Parent/TrackBus';
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
      }}
    >
      <Tab.Screen
        name="Home"
        component={ParentDashboard}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Track"
        component={TrackBus}
        options={{
          title: 'Track Bus',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="directions-bus" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Assignments"
        component={Assignments}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="assignment" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="fact-check" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
