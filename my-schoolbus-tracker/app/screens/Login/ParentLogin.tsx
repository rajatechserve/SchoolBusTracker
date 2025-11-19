import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ParentLogin({ navigation }: { navigation: any }) {
  const [phone, setPhone] = useState('');
  const { login } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parent Login</Text>
      <TextInput
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
      />
      <TouchableOpacity
        onPress={() => {
          login('parent', { id: phone || 'parent1', name: 'Parent' });
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
