import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { BreathingCircle } from '../components/BreathingCircle';
import { audioEngine, AmbientTrackType } from '../modules/audioEngine';
import { HapticsService } from '../modules/hapticsService';

export const CalmZoneScreen: React.FC = () => {
  const [activeSound, setActiveSound] = useState<AmbientTrackType | null>(null);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [isPresenceActive, setIsPresenceActive] = useState<boolean>(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const presenceInterval = useRef<NodeJS.Timeout | null>(null);

  const soundscapes: { id: AmbientTrackType; name: string; icon: string; desc: string }[] = [
    { id: 'rain', name: 'Lluvia Relajante', icon: '🌧️', desc: 'Sonido suave de gotas para desconectar la mente' },
    { id: 'lofi', name: 'Música Lo-Fi', icon: '☕', desc: 'Ritmos tranquilos para estudiar o meditar' },
    { id: 'piano', name: 'Piano Acústico', icon: '🎹', desc: 'Melodías suaves para calmar la ansiedad' },
    { id: 'waves', name: 'Olas de Mar', icon: '🌊', desc: 'Vaivén pacífico para conciliar el sueño' },
  ];

  const handleToggleSound = (id: AmbientTrackType) => {
    HapticsService.triggerSoftFeedback();
    if (activeSound === id) {
      audioEngine.stopAll();
      setActiveSound(null);
    } else {
      setActiveSound(id);
      audioEngine.playAmbientOnly(id);
    }
  };

  const handleTogglePresence = () => {
    HapticsService.triggerSoftFeedback();
    if (isPresenceActive) {
      setIsPresenceActive(false);
      if (presenceInterval.current) clearInterval(presenceInterval.current);
    } else {
      setIsPresenceActive(true);
      presenceInterval.current = setInterval(() => {
        HapticsService.triggerSoftFeedback();
      }, 950);
    }
  };

  const handleSetTimer = (minutes: number) => {
    HapticsService.triggerSoftFeedback();
    setSleepTimer(minutes);
    setTimeout(() => {
      audioEngine.stopAll();
      setActiveSound(null);
      setIsPresenceActive(false);
      if (presenceInterval.current) clearInterval(presenceInterval.current);
      setSleepTimer(null);
    }, minutes * 60 * 1000);
  };

  useEffect(() => {
    return () => {
      audioEngine.stopAll();
      if (presenceInterval.current) clearInterval(presenceInterval.current);
    };
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Zona de Calma & Sueño 🍃</Text>
        <Text style={styles.subtitle}>
          Un rincón silencioso para reducir el ritmo cardíaco y encontrar paz interior.
        </Text>
      </View>

      {/* Interactive 4-4-4 Breathing Circle */}
      <View style={styles.card}>
        <BreathingCircle />
      </View>

      {/* Simulador de Presencia & Latido de Pecho */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Simulador de Presencia (Dormir en mi Pecho) ❤️</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleTogglePresence}
          style={[styles.presenceCard, isPresenceActive && styles.presenceCardActive]}
        >
          <Text style={styles.presenceIcon}>{isPresenceActive ? '💓' : '🤍'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.presenceTitle}>
              {isPresenceActive ? 'Latido Continuo Activo' : 'Activar Latido Suave'}
            </Text>
            <Text style={styles.presenceSub}>
              Pulsaciones rítmicas sutiles para colocar el celular sobre tu pecho y dormir acompañado/a.
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Ambient Soundscapes Playlist */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pistas de Fondo Continuas</Text>

        {soundscapes.map((track) => {
          const isPlaying = activeSound === track.id;
          return (
            <TouchableOpacity
              key={track.id}
              activeOpacity={0.85}
              onPress={() => handleToggleSound(track.id)}
              style={[styles.trackCard, isPlaying && styles.trackCardActive]}
            >
              <Text style={styles.trackIcon}>{track.icon}</Text>
              <View style={styles.trackCol}>
                <Text style={[styles.trackName, isPlaying && styles.trackNameActive]}>
                  {track.name}
                </Text>
                <Text style={styles.trackDesc}>{track.desc}</Text>
              </View>
              <View style={[styles.playBadge, isPlaying && styles.playBadgeActive]}>
                <Text style={[styles.playBadgeText, isPlaying && styles.playBadgeTextActive]}>
                  {isPlaying ? 'Detener' : 'Reproducir'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Temporizador de Apagado (Sleep Timer) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Temporizador de Apagado (Sleep Timer) ⏱️</Text>
        <View style={styles.timerRow}>
          {[15, 30, 45, 60].map((mins) => (
            <TouchableOpacity
              key={mins}
              onPress={() => handleSetTimer(mins)}
              style={[styles.timerBtn, sleepTimer === mins && styles.timerBtnActive]}
            >
              <Text style={[styles.timerBtnText, sleepTimer === mins && styles.timerBtnTextActive]}>
                {mins} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {sleepTimer && (
          <Text style={styles.timerNotice}>
            La música y vibración se apagarán automáticamente en {sleepTimer} minutos.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  presenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  presenceCardActive: {
    backgroundColor: '#FFE4E6',
    borderColor: '#E11D48',
  },
  presenceIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  presenceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9F1239',
  },
  presenceSub: {
    fontSize: 11,
    color: '#BE123C',
    marginTop: 2,
    lineHeight: 15,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  trackCardActive: {
    borderColor: '#38BDF8',
    backgroundColor: '#F0F9FF',
  },
  trackIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  trackCol: {
    flex: 1,
  },
  trackName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  trackNameActive: {
    color: '#0284C7',
  },
  trackDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  playBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  playBadgeActive: {
    backgroundColor: '#0284C7',
  },
  playBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  playBadgeTextActive: {
    color: '#FFFFFF',
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timerBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  timerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  timerBtnTextActive: {
    color: '#FFFFFF',
  },
  timerNotice: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});
