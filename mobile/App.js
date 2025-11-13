
import * as React from 'react';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleSelect from './src/screens/RoleSelect';
import DriverLogin from './src/screens/DriverLogin';
import DriverDashboard from './src/screens/DriverDashboard';
import ParentLogin from './src/screens/ParentLogin';
import ParentDashboard from './src/screens/ParentDashboard';
import LocationShare from './src/screens/LocationShare';

const Stack = createNativeStackNavigator();
const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: '#2563eb', accent: '#06b6d4' },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="RoleSelect" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="RoleSelect" component={RoleSelect} />
          <Stack.Screen name="DriverLogin" component={DriverLogin} />
          <Stack.Screen name="DriverDashboard" component={DriverDashboard} />
          <Stack.Screen name="ParentLogin" component={ParentLogin} />
          <Stack.Screen name="ParentDashboard" component={ParentDashboard} />
          <Stack.Screen name="LocationShare" component={LocationShare} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
