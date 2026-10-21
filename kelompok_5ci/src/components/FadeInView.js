import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Animasi masuk sederhana: fade + naik sedikit.
 * - delay    : jeda (ms) sebelum mulai, dipakai untuk efek berurutan (stagger)
 * - distance : jarak geser vertikal awal (px). 0 = fade saja.
 * Memakai native driver, jadi ringan dan tanpa library tambahan.
 */
export default function FadeInView({
  children,
  delay = 0,
  duration = 450,
  distance = 16,
  style,
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress, delay, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [distance, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
