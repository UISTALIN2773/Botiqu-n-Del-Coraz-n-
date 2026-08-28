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
} from '../config/database';
import { storageService } from '../modules/storageService';
import { getTodayPhrase } from '../config/phrases';
import { HeartAnimation } from '../components/HeartAnimation';
import { HapticsService } from '../modules/hapticsService';

interface HomeScreenProps {
  onSelectMood: (mood: MoodType) => void;
  onOpenSOS: () => void;
  onOpenDoubtWall: () => void;
  onOpenTimeCapsules: () => void;
  onOpenFutureTree: () => void;
}

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectMood,
  onOpenSOS,
  onOpenDoubtWall,
  onOpenTimeCapsules,
  onOpenFutureTree,
}) => {
  const prefs = storageService.getPreferences();
  const daysTogether = storageService.getDaysTogether();
  const daysUntilMeet = storageService.getDaysUntilNextMeet();
  const todayPhrase = getTodayPhrase();
  const [capsuleUnlocked, setCapsuleUnlocked] = useState<boolean>(
    storageService.isCapsuleUnlocked()
  );

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
        <Text style={styles.senderSubtext}>De {prefs.senderName} • Siempre contigo</Text>

        {/* Days Together Counter Card */}
        <View style={styles.counterCard}>
          <View style={styles.counterRow}>
            <Text style={styles.counterNumber}>{daysTogether}</Text>
            <View style={styles.counterCol}>
              <Text style={styles.counterTitle}>Días Juntos en Nuestro Amor</Text>
              <Text style={styles.counterSubtitle}>
                {daysUntilMeet > 0
                  ? `Faltan solo ${daysUntilMeet} días para vernos de nuevo`
                  : 'Y cada día te amo un poquito más'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 🚨 BOTÓN DE PÁNICO EMOCIONAL S.O.S. */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          HapticsService.triggerHeartbeat();
          onOpenSOS();
        }}
        style={styles.sosBanner}
      >
        <Text style={styles.sosIcon}>🚨</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.sosTitle}>S.O.S. Parar el Sobrepensamiento</Text>
          <Text style={styles.sosSub}>
            Toca aquí si sientes miedo, sobrepensamiento o un ataque de ansiedad.
          </Text>
        </View>
        <Text style={styles.sosArrow}>➔</Text>
      </TouchableOpacity>

      {/* Central Interactive Heart Trigger */}
      <View style={styles.heartBanner}>
        <HeartAnimation
          size={72}
          color={prefs.widgetColor || '#E11D48'}
          isPulsing={true}
          onPress={() => onSelectMood('ansiedad')}
        />
        <Text style={styles.heartBannerTitle}>Botiquín Rápido del Corazón</Text>
        <Text style={styles.heartBannerSub}>
          Toca el corazón para abrir la ventana de calma instantánea
        </Text>
      </View>

      {/* Módulos Especiales para Inseguridades y Distancia */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Refugio para Momentos Difíciles</Text>
        <View style={styles.specialGrid}>
          {/* Muro de Dudas */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onOpenDoubtWall}
            style={styles.specialCard}
          >
            <Text style={styles.specialIcon}>🛡️</Text>
            <Text style={styles.specialTitle}>Muro de Dudas</Text>
            <Text style={styles.specialSub}>Respuestas a cuando sientas inseguridad</Text>
          </TouchableOpacity>

          {/* Sobres Abrir Solo Si */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onOpenTimeCapsules}
            style={styles.specialCard}
          >
            <Text style={styles.specialIcon}>💌</Text>
            <Text style={styles.specialTitle}>Sobres Sellados</Text>
            <Text style={styles.specialSub}>"Ábreme solo si estás llorando..."</Text>
          </TouchableOpacity>

          {/* Árbol del Futuro */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onOpenFutureTree}
            style={styles.specialCard}
          >
            <Text style={styles.specialIcon}>🌱</Text>
            <Text style={styles.specialTitle}>Nuestro Futuro</Text>
            <Text style={styles.specialSub}>Metas juntos y cuenta regresiva</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 16,
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
    marginTop: 12,
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
    fontSize: 34,
    fontWeight: '900',
    color: '#E11D48',
    marginRight: 14,
    fontVariant: ['tabular-nums'],
  },
  counterCol: {
    flex: 1,
  },
  counterTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  counterSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  sosBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE4E6',
    elevation: 2,
  },
  sosIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  sosTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#E11D48',
  },
  sosSub: {
    fontSize: 11,
    color: '#9F1239',
    marginTop: 1,
    lineHeight: 15,
  },
  sosArrow: {
    fontSize: 16,
    color: '#E11D48',
    fontWeight: '800',
    marginLeft: 6,
  },
  heartBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F8FAFC',
  },
  heartBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  heartBannerSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 10,
  },
  specialGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specialCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
  },
  specialIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  specialTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  specialSub: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 12,
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
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  gridTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },
  gridDesc: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
  },
  capsuleCard: {
    backgroundColor: '#FFF1F2',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  capsuleQuote: {
    fontSize: 13,
    lineHeight: 20,
    color: '#9F1239',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  capsuleAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E11D48',
    textAlign: 'right',
    marginTop: 6,
  },
  lockedCapsuleBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  lockedIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  lockedText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9F1239',
  },
  lockedSub: {
    fontSize: 11,
    color: '#BE123C',
    marginTop: 1,
  },
});
