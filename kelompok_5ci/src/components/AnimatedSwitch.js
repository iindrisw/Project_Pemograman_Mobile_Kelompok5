import React, { useEffect, useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/* Toggle buatan sendiri: knob meluncur + warna track berubah halus */
export default function AnimatedSwitch({ value, onValueChange, label }) {
  const { theme } = useTheme();
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const offColor = theme.mode === 'dark' ? '#4A3E33' : '#D9D0C5';
  const trackColor = anim.interpolate({ inputRange: [0, 1], outputRange: [offColor, theme.primary] });
  const knobX = anim.interpolate({ inputRange: [0, 1], outputRange: [3, 21] });

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      hitSlop={8}
    >
      <Animated.View style={{ width: 46, height: 28, borderRadius: 14, justifyContent: 'center', backgroundColor: trackColor }}>
        <Animated.View
          style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF', transform: [{ translateX: knobX }] }}
        />
      </Animated.View>
    </Pressable>
  );
}
