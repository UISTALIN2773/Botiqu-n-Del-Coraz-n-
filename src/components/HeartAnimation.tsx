import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { HapticsService } from '../modules/hapticsService';

interface HeartAnimationProps {
  size?: number;
  color?: string;
  onPress?: () => void;
  isPulsing?: boolean;
}

export const HeartAnimation: React.FC<HeartAnimationProps> = ({
  size = 80,
  color = '#E11D48',
  onPress,
  isPulsing = true,
}) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.2);

  useEffect(() => {
    if (isPulsing) {
      // Simulates real cardiac double pulse (lub-dub)
      scale.value = withRepeat(
        withSequence(
          withTiming(1.18, { duration: 140, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
          withTiming(1.0, { duration: 120 }),
          withTiming(1.12, { duration: 140 }),
          withTiming(1.0, { duration: 600, easing: Easing.out(Easing.quad) })
        ),
        -1,
        false
      );

      glow.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 260 }),
          withTiming(0.2, { duration: 740 })
        ),
        -1,
        false
      );
    } else {
      scale.value = withTiming(1, { duration: 300 });
      glow.value = withTiming(0.2, { duration: 300 });
    }
  }, [isPulsing]);

  const animatedHeartStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: glow.value,
      transform: [{ scale: scale.value * 1.3 }],
    };
  });

  const handlePress = () => {
    HapticsService.triggerHeartbeat();
    onPress?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[styles.container, { width: size * 1.6, height: size * 1.6 }]}
    >
      {/* Background soft glow */}
      <Animated.View
        style={[
          styles.glowCircle,
          {
            width: size * 1.3,
            height: size * 1.3,
            borderRadius: (size * 1.3) / 2,
            backgroundColor: color,
          },
          animatedGlowStyle,
        ]}
      />

      {/* Pulsing SVG Heart */}
      <Animated.View style={[animatedHeartStyle, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </Svg>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowCircle: {
    position: 'absolute',
  },
});
