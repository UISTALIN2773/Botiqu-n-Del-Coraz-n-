import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { HapticsService } from '../modules/hapticsService';

export const BreathingCircle: React.FC = () => {
  const [phase, setPhase] = useState<'Inhala' | 'Sostén' | 'Exhala'>('Inhala');
  const [secondsLeft, setSecondsLeft] = useState<number>(4);
  const [isActive, setIsActive] = useState<boolean>(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;
  const loopRef = useRef<NodeJS.Timeout | null>(null);

  const startBreathingCycle = () => {
    setIsActive(true);
    runCycle();
  };

  const stopBreathingCycle = () => {
    setIsActive(false);
    if (loopRef.current) clearInterval(loopRef.current);
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0.4, duration: 400, useNativeDriver: true }),
    ]).start();
    setPhase('Inhala');
    setSecondsLeft(4);
  };

  const runCycle = () => {
    // 1. Inhale (4s) -> Expand
    setPhase('Inhala');
    setSecondsLeft(4);
    HapticsService.triggerBreathingPulse();

    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 1.45, duration: 4000, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0.85, duration: 4000, useNativeDriver: true }),
    ]).start();

    // 2. Hold (4s) -> Stay
    setTimeout(() => {
      setPhase('Sostén');
      setSecondsLeft(4);
      HapticsService.triggerBreathingPulse();

      // 3. Exhale (4s) -> Contract
      setTimeout(() => {
        setPhase('Exhala');
        setSecondsLeft(4);
        HapticsService.triggerBreathingPulse();

        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 1.0, duration: 4000, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.4, duration: 4000, useNativeDriver: true }),
        ]).start();
      }, 4000);
    }, 4000);
  };

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => (prev > 1 ? prev - 1 : 4));
      }, 1000);

      // Repeat loop every 12 seconds
      const cycleInterval = setInterval(() => {
        runCycle();
      }, 12000);

      return () => {
        clearInterval(timer);
        clearInterval(cycleInterval);
      };
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      <View style={styles.circleContainer}>
        {/* Expanding outer wave */}
        <Animated.View
          style={[
            styles.outerCircle,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        />

        {/* Inner Solid Circle */}
        <View style={styles.innerCircle}>
          <Text style={styles.phaseText}>{phase}</Text>
          <Text style={styles.secondsText}>{isActive ? `${secondsLeft}s` : '4s'}</Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={isActive ? stopBreathingCycle : startBreathingCycle}
        style={[styles.actionBtn, isActive ? styles.actionBtnStop : styles.actionBtnStart]}
      >
        <Text style={styles.actionBtnText}>
          {isActive ? 'Detener Respiración' : 'Iniciar Ejercicio 4-4-4'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.hintText}>
        Inhala 4s • Mantén el aire 4s • Suelta el aire 4s
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  circleContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerCircle: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#38BDF8',
  },
  innerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  phaseText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  secondsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0284C7',
    marginTop: 2,
  },
  actionBtn: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 2,
  },
  actionBtnStart: {
    backgroundColor: '#0284C7',
  },
  actionBtnStop: {
    backgroundColor: '#64748B',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  hintText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 10,
  },
});
