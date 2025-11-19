import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DriverLogin from '../screens/Login/DriverLogin';
import ParentLogin from '../screens/Login/ParentLogin';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

function RoleChooser({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Role</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('DriverLogin')}>
        <Text style={styles.buttonText}>Driver Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ParentLogin')}>
        <Text style={styles.buttonText}>Parent Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 32 },
  button: { backgroundColor: '#007BFF', paddingVertical: 14, borderRadius: 6, marginBottom: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={RoleChooser} />
      <Stack.Screen name="DriverLogin" component={DriverLogin} />
      <Stack.Screen name="ParentLogin" component={ParentLogin} />
    </Stack.Navigator>
  );
}
