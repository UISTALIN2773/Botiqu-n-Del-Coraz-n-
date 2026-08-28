import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  MoodType,
  MOOD_DEFINITIONS,
  EmotionalItem,
} from '../config/database';
import { storageService } from '../modules/storageService';
import { audioEngine } from '../modules/audioEngine';
import { HapticsService } from '../modules/hapticsService';
import { AudioPlayerControls } from './AudioPlayerControls';
import { HeartAnimation } from './HeartAnimation';

interface QuickPopupModalProps {
  visible: boolean;
  initialMood?: MoodType;
  onClose: () => void;
  onOpenFullApp: () => void;
}

const { width } = Dimensions.get('window');

export const QuickPopupModal: React.FC<QuickPopupModalProps> = ({
  visible,
  initialMood = 'ansiedad',
  onClose,
  onOpenFullApp,
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodType>(initialMood);
  const [currentItem, setCurrentItem] = useState<EmotionalItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSeconds, setCurrentSeconds] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(45);

  useEffect(() => {
    if (visible) {
      loadMoodItem(selectedMood);
      HapticsService.triggerHeartbeat();
    } else {
      audioEngine.stopAll();
      setIsPlaying(false);
    }
  }, [visible, selectedMood]);

  const loadMoodItem = (mood: MoodType) => {
    const memories = storageService.getMemoriesByMood(mood);
    const item =
      memories.length > 0
        ? memories[Math.floor(Math.random() * memories.length)]
        : storageService.getMemories()[0];

    setCurrentItem(item);
    setTotalSeconds(item.durationSeconds || 45);
    setCurrentSeconds(0);
    setIsPlaying(false);
    audioEngine.stopAll();
  };

  const handleTogglePlay = async () => {
    if (!currentItem) return;

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

  const moodMeta = MOOD_DEFINITIONS[selectedMood];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.cardContainer}>
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <View style={styles.titleRow}>
              <View style={[styles.indicatorDot, { backgroundColor: moodMeta.color }]} />
              <Text style={styles.headerTitle}>Botiquín de Emergencia</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeIconBtn}>
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Quick Mood Selector Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
              contentContainerStyle={styles.chipsContainer}
            >
              {(Object.keys(MOOD_DEFINITIONS) as MoodType[]).map((key) => {
                const def = MOOD_DEFINITIONS[key];
                const isSelected = selectedMood === key;
                return (
                  <TouchableOpacity
                    key={key}
                    activeOpacity={0.8}
                    onPress={() => {
                      HapticsService.triggerSoftFeedback();
                      setSelectedMood(key);
                    }}
                    style={[
                      styles.moodChip,
                      isSelected
                        ? { backgroundColor: def.color, borderColor: def.color }
                        : styles.moodChipUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                      ]}
                    >
                      {def.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Central Heart and Media Viewer */}
            <View style={styles.heartSection}>
              <HeartAnimation
                size={58}
                color={moodMeta.color}
                isPulsing={isPlaying}
                onPress={handleTogglePlay}
              />
              <Text style={styles.heartHint}>
                {isPlaying ? 'Escuchando nota con música...' : 'Toca el corazón para escucharme'}
              </Text>
            </View>

            {/* Note & Comfort Message */}
            {currentItem && (
              <View style={styles.messageBox}>
                <Text style={styles.itemTitle}>{currentItem.title}</Text>
                <Text style={styles.reassuranceQuote}>
                  "{currentItem.note || moodMeta.reassuranceQuote}"
                </Text>
              </View>
            )}

            {/* Audio Controls */}
            {currentItem && (
              <AudioPlayerControls
                isPlaying={isPlaying}
                currentSeconds={currentSeconds}
                totalSeconds={totalSeconds}
                ambientTrackName={currentItem.ambientTrack}
                onTogglePlay={handleTogglePlay}
                accentColor={moodMeta.color}
              />
            )}

            {/* Footer Buttons */}
            <View style={styles.footerRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onOpenFullApp}
                style={[styles.fullAppBtn, { backgroundColor: moodMeta.color }]}
              >
                <Text style={styles.fullAppBtnText}>Abrir App Completa ➔</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  cardContainer: {
    width: Math.min(width - 32, 400),
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeIconBtn: {
    padding: 4,
  },
  closeIconText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '700',
  },
  content: {
    alignItems: 'center',
  },
  chipsScroll: {
    width: '100%',
    marginBottom: 12,
  },
  chipsContainer: {
    paddingVertical: 4,
  },
  moodChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
  },
  moodChipUnselected: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  chipTextUnselected: {
    color: '#64748B',
  },
  heartSection: {
    alignItems: 'center',
    marginVertical: 8,
  },
  heartHint: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 4,
  },
  messageBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginVertical: 8,
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
    textAlign: 'center',
  },
  reassuranceQuote: {
    fontSize: 13,
    lineHeight: 18,
    color: '#475569',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footerRow: {
    width: '100%',
    marginTop: 8,
  },
  fullAppBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
  },
  fullAppBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
