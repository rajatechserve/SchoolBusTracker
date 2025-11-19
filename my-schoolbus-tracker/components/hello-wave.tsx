import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat } from 'react-native-reanimated';

export function HelloWave() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Repeat a subtle waving motion.
    rotation.value = withRepeat(withTiming(25, { duration: 300 }), 4, true);
  }, [rotation]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.Text style={[{ fontSize: 28, lineHeight: 32, marginTop: -6 }, style]}>
      👋
    </Animated.Text>
  );
}
