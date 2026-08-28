import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { audioEngine } from '../modules/audioEngine';
import { HapticsService } from '../modules/hapticsService';

interface CalmZoneScreenProps {
  onClose?: () => void;
}

export const CalmZoneScreen: React.FC<CalmZoneScreenProps> = ({ onClose }) => {
  const [selectedTimer, setSelectedTimer] = useState<number>(30); // 15, 30, 45, 60 min
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(true);
  const [breathPhase, setBreathPhase] = useState<'Inhala' | 'Sostén' | 'Exhala'>('Inhala');
  const [isPresenceActive, setIsPresenceActive] = useState<boolean>(false);
  const [activeSound, setActiveSound] = useState<string>('rain');

  // Animation values for the double concentric ring
  const circleScaleAnim = useRef(new Animated.Value(1)).current;

  // 4-4-4 Breathing Cycle Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBreathingActive) {
      const runBreathingCycle = () => {
        // Phase 1: Inhale 4s (expand)
        setBreathPhase('Inhala');
        HapticsService.triggerBreathingPulse();
        Animated.timing(circleScaleAnim, {
          toValue: 1.35,
          duration: 4000,
          useNativeDriver: true,
        }).start(() => {
          // Phase 2: Hold 4s (static)
          setBreathPhase('Sostén');
          HapticsService.triggerBreathingPulse();
          timer = setTimeout(() => {
            // Phase 3: Exhale 4s (contract)
            setBreathPhase('Exhala');
            HapticsService.triggerBreathingPulse();
            Animated.timing(circleScaleAnim, {
              toValue: 1.0,
              duration: 4000,
              useNativeDriver: true,
            }).start(() => {
              if (isBreathingActive) runBreathingCycle();
            });
          }, 4000);
        });
      };

      runBreathingCycle();
    }

    return () => {
      clearTimeout(timer);
      circleScaleAnim.stopAnimation();
    };
  }, [isBreathingActive]);

  const togglePresenceSimulator = () => {
    if (isPresenceActive) {
      HapticsService.stopPresence();
      setIsPresenceActive(false);
    } else {
      HapticsService.startSafePresence(() => {
        setIsPresenceActive(false);
      });
      setIsPresenceActive(true);
      // Play soft continuous background sound
      audioEngine.playDualTrack('voice_te_extrano_01.wav', activeSound as any);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* Cabecera: Flecha (←), título centrado, selector de temporizador Sleep Timer */}
      <View style={styles.navBar}>
        {onClose ? (
          <TouchableOpacity onPress={onClose} style={styles.navBtn}>
            <Text style={styles.navArrow}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
        <Text style={styles.navTitle}>Zona de Calma & Sueño</Text>

        {/* Sleep Timer Selector */}
        <View style={styles.timerPicker}>
          <Text style={styles.timerIcon}>⏱️</Text>
          <Text style={styles.timerVal}>{selectedTimer}m</Text>
        </View>
      </View>

      {/* Selectores de Timer en Píldoras */}
      <View style={styles.timerRow}>
        <Text style={styles.timerLabel}>Sleep Timer:</Text>
        {[15, 30, 45, 60].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => {
              HapticsService.triggerSoftFeedback();
              setSelectedTimer(t);
            }}
            style={[styles.timerPill, selectedTimer === t && styles.timerPillActive]}
          >
            <Text style={[styles.timerPillText, selectedTimer === t && styles.timerPillTextActive]}>
              {t}m
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Guía de Respiración 4-4-4: Anillo concéntrico animado con borde doble */}
      <View style={styles.breathingSection}>
        <Animated.View
          style={[
            styles.outerConcentricRing,
            { transform: [{ scale: circleScaleAnim }] },
          ]}
        >
          <View style={styles.innerConcentricRing}>
            <Text style={styles.circlePhaseText}>{breathPhase}</Text>
            <Text style={styles.circleSubText}>4-4-4 / Breathing Circle</Text>
          </View>
        </Animated.View>
      </View>

      {/* Módulo "Dormir en mi Pecho" (Centro Inferior) */}
      <View style={styles.chestSleepCard}>
        <Text style={styles.chestSleepTitle}>Dormir en mi Pecho 🛌</Text>
        <Text style={styles.chestSleepDesc}>
          Simulador de presencia táctil. Coloca el teléfono sobre tu pecho o debajo de tu almohada para sentir el latido suave cada 950 ms.
        </Text>

        {/* Botón circular inferior con icono de ondas (〰️) */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={togglePresenceSimulator}
          style={[styles.waveBtn, isPresenceActive && styles.waveBtnActive]}
        >
          <Text style={styles.waveIcon}>〰️</Text>
        </TouchableOpacity>
        <Text style={styles.waveBtnLabel}>
          {isPresenceActive ? 'Latido Activo • Toca para pausar' : 'Iniciar Presencia'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#FAF5EE',
    minHeight: '100%',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    padding: 4,
  },
  navArrow: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2B1810',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2B1810',
  },
  timerPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBDCCE',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  timerIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  timerVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5C3E2E',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timerLabel: {
    fontSize: 11,
    color: '#8C6F58',
    fontWeight: '700',
    marginRight: 8,
  },
  timerPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F5EBE1',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#EBDCCE',
  },
  timerPillActive: {
    backgroundColor: '#2B1810',
    borderColor: '#2B1810',
  },
  timerPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8C6F58',
  },
  timerPillTextActive: {
    color: '#FFFFFF',
  },
  breathingSection: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginVertical: 10,
  },
  outerConcentricRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 3,
    borderColor: 'rgba(225, 29, 72, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F2',
  },
  innerConcentricRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    elevation: 3,
  },
  circlePhaseText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2B1810',
  },
  circleSubText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8C6F58',
    marginTop: 3,
  },
  chestSleepCard: {
    backgroundColor: '#1E140F', // Tarjeta oscura
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  chestSleepTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  chestSleepDesc: {
    fontSize: 11,
    lineHeight: 16,
    color: '#E6D5C3',
    textAlign: 'center',
    marginBottom: 16,
  },
  waveBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3D2314',
    borderWidth: 2,
    borderColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  waveBtnActive: {
    backgroundColor: '#E11D48',
    borderColor: '#FFFFFF',
  },
  waveIcon: {
    fontSize: 24,
  },
  waveBtnLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F5EBE1',
    marginTop: 8,
  },
});
