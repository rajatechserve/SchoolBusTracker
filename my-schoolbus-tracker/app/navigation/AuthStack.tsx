import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UnifiedLogin from '../screens/Login/RoleSelect';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={UnifiedLogin} />
    </Stack.Navigator>
  );
}
