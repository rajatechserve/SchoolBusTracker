import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/theme';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">This is a modal</ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">Go to home screen</ThemedText>
      </Link>
      <LocationPreview />
    </ThemedView>
  );
}

// Lightweight replacement for the removed map. You can later swap this
// for a WebView (e.g. OpenStreetMap) or an Image without adding heavy native deps.
const LocationPreview = () => (
  <View style={styles.previewBox}>
    <ThemedText type="defaultSemiBold">Live Map Unavailable</ThemedText>
    <ThemedText type="default">react-native-maps removed from this screen.</ThemedText>
    <ThemedText type="default">Coordinates: 37.78825, -122.4324</ThemedText>
    <Link href="/" style={styles.inlineLink}>
      <ThemedText type="link">Refresh</ThemedText>
    </Link>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.light.background, // Applied theme background color
  },
  link: {
    insetBlockStart: 15, // Replaced marginTop with logical property
    paddingVertical: 15,
    color: Colors.light.tint, // Applied theme primary color
  },
  previewBox: {
    insetBlockStart: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.light.tint,
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  inlineLink: {
    insetBlockStart: 8,
  },
});


