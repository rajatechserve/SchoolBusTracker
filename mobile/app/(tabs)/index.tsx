import { Button, View, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Image source={require('@/assets/images/driver-icon.png')} style={styles.icon} />
        <Button title="Driver Login" onPress={() => router.push('/driver-login')} />
      </View>
      <View style={styles.buttonContainer}>
        <Image source={require('@/assets/images/parent-icon.png')} style={styles.icon} />
        <Button title="Parent Login" onPress={() => router.push('/parent-login')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
});
