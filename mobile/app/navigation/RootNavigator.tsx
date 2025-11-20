import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import DriverTabs from './DriverTabs';
import ParentTabs from './ParentTabs';
import { useAuth } from '../context/AuthContext';

export default function RootNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      {!user && <AuthStack />}
      {user && user.role === 'driver' && <DriverTabs />}
      {user && user.role === 'parent' && <ParentTabs />}
    </NavigationContainer>
  );
}
