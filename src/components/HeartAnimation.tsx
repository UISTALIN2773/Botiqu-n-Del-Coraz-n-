import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.2)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isPulsing) {
      // Simulates real cardiac double pulse (lub-dub) using Native Driver
      const pulseLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.18,
              duration: 140,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1.0,
              duration: 120,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1.12,
              duration: 140,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1.0,
              duration: 600,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 0.6,
              duration: 260,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.2,
              duration: 740,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      animationRef.current = pulseLoop;
      pulseLoop.start();
    } else {
      animationRef.current?.stop();
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.2,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      animationRef.current?.stop();
    };
  }, [isPulsing, scaleAnim, glowAnim]);

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
            opacity: glowAnim,
            transform: [{ scale: 1.3 }],
          },
        ]}
      />

      {/* Pulsing SVG Heart */}
      <Animated.View
        style={{
          width: size,
          height: size,
          transform: [{ scale: scaleAnim }],
        }}
      >
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
