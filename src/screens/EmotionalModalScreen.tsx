import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import {
  EMOTIONAL_DATABASE,
  MOOD_DEFINITIONS,
  MoodType,
  EmotionalItem,
} from '../config/database';
import { HeartAnimation } from '../components/HeartAnimation';
import { AudioPlayerControls } from '../components/AudioPlayerControls';
import { MoodButton } from '../components/MoodButton';
import { audioEngine } from '../modules/audioEngine';
import { HapticsService } from '../modules/hapticsService';
import { WidgetBridge } from '../modules/widgetBridge';

interface EmotionalModalScreenProps {
  initialMood?: MoodType;
  onClose?: () => void;
}

const { width } = Dimensions.get('window');

export const EmotionalModalScreen: React.FC<EmotionalModalScreenProps> = ({
  initialMood = 'ansiedad',
  onClose,
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodType>(initialMood);
  const [currentItem, setCurrentItem] = useState<EmotionalItem>(
    EMOTIONAL_DATABASE.find((item) => item.mood === initialMood) ||
      EMOTIONAL_DATABASE[0]
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSeconds, setCurrentSeconds] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(currentItem.durationSeconds);

  // Sync item whenever mood changes
  useEffect(() => {
    const itemsForMood = EMOTIONAL_DATABASE.filter(
      (item) => item.mood === selectedMood
    );
    const randomItem =
      itemsForMood[Math.floor(Math.random() * itemsForMood.length)] ||
      EMOTIONAL_DATABASE[0];
    setCurrentItem(randomItem);
    setTotalSeconds(randomItem.durationSeconds);
    setCurrentSeconds(0);
    setIsPlaying(false);
    audioEngine.stopAll();

    // Trigger greeting heartbeat and sync widget state
    HapticsService.triggerHeartbeat();
    WidgetBridge.updateWidgetData(selectedMood);
  }, [selectedMood]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      audioEngine.stopAll();
    };
  }, []);

  const handleTogglePlay = async () => {
    if (isPlaying) {
      audioEngine.togglePause(true);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      HapticsService.triggerSoftFeedback();
      await audioEngine.playDualTrack(
        currentItem.voiceFilename,
        currentItem.ambientTrack,
        (curr, tot) => {
          setCurrentSeconds(curr);
          setTotalSeconds(tot > 0 ? tot : currentItem.durationSeconds);
        },
        () => {
          setIsPlaying(false);
          setCurrentSeconds(0);
          HapticsService.triggerSuccessFeedback();
        }
      );
    }
  };

  const currentMoodMeta = MOOD_DEFINITIONS[selectedMood];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Botiquín del Corazón</Text>
            <View style={[styles.statusDot, { backgroundColor: currentMoodMeta.color }]} />
          </View>
          <Text style={styles.headerSubtitle}>
            Tu espacio seguro y privado para cualquier momento del día
          </Text>
        </View>

        {/* Floating Emergency Card */}
        <View style={styles.card}>
          {/* Pulsating Heart */}
          <View style={styles.heartSection}>
            <HeartAnimation
              size={68}
              color={currentMoodMeta.color}
              isPulsing={isPlaying}
              onPress={handleTogglePlay}
            />
            <Text style={styles.tapHeartHint}>
              {isPlaying ? 'Reproduciendo audio y música...' : 'Toca el corazón para escucharme'}
            </Text>
          </View>

          {/* Emotional Context Message */}
          <View style={styles.messageSection}>
            <Text style={styles.itemTitle}>{currentItem.title}</Text>
            <Text style={styles.itemSubtitle}>{currentItem.subtitle}</Text>
            <View style={styles.divider} />
            <Text style={styles.noteText}>"{currentItem.note}"</Text>
          </View>

          {/* Dual Audio Player Controls with Ducking */}
          <AudioPlayerControls
            isPlaying={isPlaying}
            currentSeconds={currentSeconds}
            totalSeconds={totalSeconds}
            ambientTrackName={currentItem.ambientTrack}
            onTogglePlay={handleTogglePlay}
            accentColor={currentMoodMeta.color}
          />
        </View>

        {/* Mood Selector Grid */}
        <View style={styles.selectorSection}>
          <Text style={styles.selectorHeading}>¿Cómo te sientes ahora?</Text>
          <View style={styles.moodButtonsRow}>
            {(Object.keys(MOOD_DEFINITIONS) as MoodType[]).map((moodKey) => (
              <MoodButton
                key={moodKey}
                mood={moodKey}
                isSelected={selectedMood === moodKey}
                onSelect={(m) => setSelectedMood(m)}
              />
            ))}
          </View>
        </View>

        {/* Memory Footer Quote */}
        <View style={styles.footer}>
          <Text style={styles.footerQuote}>
            "No importa la hora ni el lugar, siempre estoy contigo a un solo toque."
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0A0A0A',
    letterSpacing: -0.5,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    width: width - 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  heartSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  tapHeartHint: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '600',
  },
  messageSection: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  itemTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '500',
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
    borderRadius: 1,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#334155',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 8,
  },
  selectorSection: {
    width: '100%',
    marginTop: 24,
    alignItems: 'center',
  },
  selectorHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  moodButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  footer: {
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  footerQuote: {
    fontSize: 12,
    textAlign: 'center',
    color: '#94A3B8',
    fontWeight: '500',
  },
});
