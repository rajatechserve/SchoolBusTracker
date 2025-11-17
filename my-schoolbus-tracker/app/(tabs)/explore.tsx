import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Paragraph, Button } from 'react-native-paper';
import theme from '../constants/theme';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Title style={styles.title}>Explore</Title>
      <Paragraph style={styles.paragraph}>
        Discover new features and navigate through the app with ease.
      </Paragraph>
      <Button mode="contained" onPress={() => alert('Explore More!')} style={styles.button}>
        Explore More
      </Button>
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
  },
});
