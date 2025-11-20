import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import theme from '../constants/theme';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore</Text>
      <Text style={styles.paragraph}>
        Discover new features and navigate through the app with ease.
      </Text>
      <TouchableOpacity onPress={() => alert('Explore More!')} style={styles.button}>
        <Text style={styles.buttonText}>Explore More</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: theme.colors.primary,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
