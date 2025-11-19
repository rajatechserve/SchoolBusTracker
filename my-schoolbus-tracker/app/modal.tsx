import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import MapView, { Marker } from 'react-native-maps';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">This is a modal</ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">Go to home screen</ThemedText>
      </Link>
      <MapComponent />
    </ThemedView>
  );
}

const MapComponent = () => (
  <MapView style={{ flex: 1 }}>
    <Marker coordinate={{ latitude: 37.78825, longitude: -122.4324 }} />
  </MapView>
);

<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
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
});


