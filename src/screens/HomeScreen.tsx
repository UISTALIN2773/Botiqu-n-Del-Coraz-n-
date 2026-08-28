import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  MoodType,
  MOOD_DEFINITIONS,
  EmotionalItem,
} from '../config/database';
import { storageService } from '../modules/storageService';
import { getTodayPhrase } from '../config/phrases';
import { HeartAnimation } from '../components/HeartAnimation';
import { HapticsService } from '../modules/hapticsService';

interface HomeScreenProps {
  onSelectMood: (mood: MoodType) => void;
  onOpenMemory: (item: EmotionalItem) => void;
  onGoToCalm: () => void;
}

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectMood,
  onOpenMemory,
  onGoToCalm,
}) => {
  const prefs = storageService.getPreferences();
  const daysTogether = storageService.getDaysTogether();
  const todayPhrase = getTodayPhrase();
  const [capsuleUnlocked, setCapsuleUnlocked] = useState<boolean>(
    storageService.isCapsuleUnlocked()
  );

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const handleUnlockCapsule = () => {
    HapticsService.triggerSuccessFeedback();
    storageService.unlockCapsule();
    setCapsuleUnlocked(true);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {/* Top Couple Header */}
      <View style={styles.topHeader}>
        <Text style={styles.greetingText}>
          {getGreeting()}, <Text style={styles.partnerName}>{prefs.partnerName} ❤️</Text>
        </Text>
        <Text style={styles.senderSubtext}>De tu persona favorita • Siempre contigo</Text>

        {/* Days Together Counter Card */}
        <View style={styles.counterCard}>
          <View style={styles.counterRow}>
            <Text style={styles.counterNumber}>{daysTogether}</Text>
            <View style={styles.counterCol}>
              <Text style={styles.counterTitle}>Días Juntos</Text>
              <Text style={styles.counterSubtitle}>
                Y cada día te amo un poquito más
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Central Interactive Heart Quick Trigger */}
      <View style={styles.heartBanner}>
        <HeartAnimation
          size={74}
          color={prefs.widgetColor || '#E11D48'}
          isPulsing={true}
          onPress={() => onSelectMood('ansiedad')}
        />
        <Text style={styles.heartBannerTitle}>Botiquín de Emergencia</Text>
        <Text style={styles.heartBannerSub}>
          Toca el corazón si sientes ansiedad, dudas o me extrañas
        </Text>
      </View>

      {/* Botiquín Rápido (4 Mood Buttons Grid) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>¿Cómo te sientes en este momento?</Text>
        <View style={styles.grid}>
          {(Object.keys(MOOD_DEFINITIONS) as MoodType[]).map((key) => {
            const def = MOOD_DEFINITIONS[key];
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.85}
                onPress={() => {
                  HapticsService.triggerHeartbeat();
                  onSelectMood(key);
                }}
                style={[styles.gridCard, { borderLeftColor: def.color }]}
              >
                <Text style={[styles.gridTitle, { color: def.color }]}>{def.label}</Text>
                <Text style={styles.gridDesc} numberOfLines={2}>
                  {def.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Cápsula Diaria Desbloqueable */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cápsula Diaria de Amor 🎁</Text>
        <View style={styles.capsuleCard}>
          {capsuleUnlocked ? (
            <View>
              <Text style={styles.capsuleQuote}>"{todayPhrase.phrase}"</Text>
              <Text style={styles.capsuleAuthor}>— {todayPhrase.author}</Text>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleUnlockCapsule}
              style={styles.lockedCapsuleBtn}
            >
              <Text style={styles.lockedIcon}>💌</Text>
              <Text style={styles.lockedText}>Tienes una cápsula diaria esperándote</Text>
              <Text style={styles.lockedSub}>Toca para abrir tu mensaje de hoy</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Calm Shortcut */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onGoToCalm}
        style={styles.calmShortcut}
      >
        <Text style={styles.calmIcon}>🍃</Text>
        <View style={styles.calmCol}>
          <Text style={styles.calmTitle}>Zona de Respiración & Calma</Text>
          <Text style={styles.calmSub}>
            Ejercicios de respiración 4-4-4 y música relajante
          </Text>
        </View>
        <Text style={styles.calmArrow}>➔</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  topHeader: {
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  partnerName: {
    color: '#E11D48',
  },
  senderSubtext: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  counterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#E11D48',
    marginRight: 16,
    fontVariant: ['tabular-nums'],
  },
  counterCol: {
    flex: 1,
  },
  counterTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  counterSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  heartBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 22,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F8FAFC',
  },
  heartBannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  heartBannerSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  gridDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  capsuleCard: {
    backgroundColor: '#FFF1F2',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  capsuleQuote: {
    fontSize: 14,
    lineHeight: 22,
    color: '#9F1239',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  capsuleAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E11D48',
    textAlign: 'right',
    marginTop: 8,
  },
  lockedCapsuleBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  lockedIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  lockedText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9F1239',
  },
  lockedSub: {
    fontSize: 12,
    color: '#BE123C',
    marginTop: 2,
  },
  calmShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  calmIcon: {
    fontSize: 26,
    marginRight: 14,
  },
  calmCol: {
    flex: 1,
  },
  calmTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
  },
  calmSub: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
  },
  calmArrow: {
    fontSize: 16,
    color: '#166534',
    fontWeight: '700',
  },
});
