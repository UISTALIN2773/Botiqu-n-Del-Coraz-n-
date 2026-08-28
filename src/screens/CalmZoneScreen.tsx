import React, { useState, useEffect } from 'react';
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

  const handleToggleLoop = () => {
    const next = !isLooping;
    setIsLooping(next);
    audioEngine.setLoopMode(next);
    HapticsService.triggerSoftFeedback();
  };

  useEffect(() => {
    return () => {
      audioEngine.stopAll();
    };
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Zona de Calma & Respiración 🍃</Text>
        <Text style={styles.subtitle}>
          Un rincón silencioso para reducir el ritmo cardíaco y encontrar paz interior.
        </Text>
      </View>

      {/* Interactive 4-4-4 Breathing Circle */}
      <View style={styles.card}>
        <BreathingCircle />
      </View>

      {/* Ambient Soundscapes Playlist */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Pistas de Fondo Continuas</Text>
          <TouchableOpacity onPress={handleToggleLoop} style={styles.loopToggle}>
            <Text style={[styles.loopText, isLooping && styles.loopTextActive]}>
              {isLooping ? '🔁 Bucle Infinito' : 'Una sola vez'}
            </Text>
          </TouchableOpacity>
        </View>

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

      {/* Gentle advice */}
      <View style={styles.adviceBox}>
        <Text style={styles.adviceTitle}>💡 Consejo para momentos de inseguridad</Text>
        <Text style={styles.adviceText}>
          Cuando no podamos hablar en tiempo real, recuerda que mis sentimientos por ti no cambian ni se debilitan. Estás en mi corazón en cada instante.
        </Text>
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
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  loopToggle: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  loopText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  loopTextActive: {
    color: '#0284C7',
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
  adviceBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  adviceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  adviceText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#B45309',
  },
});
