import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  Image,
  NativeModules,
} from 'react-native';
import {
  MoodType,
  MOOD_DEFINITIONS,
  EmotionalItem,
} from '../config/database';
import { storageService } from '../modules/storageService';
import { audioEngine } from '../modules/audioEngine';
import { HapticsService } from '../modules/hapticsService';

interface QuickPopupModalProps {
  visible: boolean;
  initialMood?: MoodType;
  autoplay?: boolean;
  isFromWidget?: boolean;
  onClose: () => void;
  onOpenFullApp: () => void;
}

const { width } = Dimensions.get('window');

export const QuickPopupModal: React.FC<QuickPopupModalProps> = ({
  visible,
  initialMood = 'ansiedad',
  autoplay = false,
  isFromWidget = false,
  onClose,
  onOpenFullApp,
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodType>(initialMood);
  const [currentItem, setCurrentItem] = useState<EmotionalItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSeconds, setCurrentSeconds] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(152); // ~ 2:32 default

  const prefs = storageService.getPreferences();

  useEffect(() => {
    if (visible) {
      loadMoodItem(selectedMood, autoplay);
      HapticsService.triggerHeartbeat();
    } else {
      audioEngine.stopAll();
      setIsPlaying(false);
    }
  }, [visible, selectedMood]);

  const loadMoodItem = (mood: MoodType, shouldAutoplay = false) => {
    const memories = storageService.getMemoriesByMood(mood);
    const item =
      memories.length > 0
        ? memories[Math.floor(Math.random() * memories.length)]
        : storageService.getMemories()[0];

    setCurrentItem(item);
    const dur = item.durationSeconds > 0 ? item.durationSeconds : 152;
    setTotalSeconds(dur);
    setCurrentSeconds(0);

    if (shouldAutoplay) {
      startPlayback(item);
    }
  };

  const startPlayback = async (item: EmotionalItem) => {
    setIsPlaying(true);
    HapticsService.triggerSoftFeedback();
    await audioEngine.playDualTrack(
      item.voiceFilename,
      item.ambientTrack,
      (curr, tot) => {
        setCurrentSeconds(curr);
        setTotalSeconds(tot > 0 ? tot : item.durationSeconds || 152);
      },
      () => {
        setIsPlaying(false);
        setCurrentSeconds(0);
        HapticsService.triggerSuccessFeedback();
      }
    );
  };

  const handleTogglePlay = async () => {
    if (!currentItem) return;

    if (isPlaying) {
      audioEngine.togglePause(true);
      setIsPlaying(false);
    } else {
      startPlayback(currentItem);
    }
  };

  const handleSkipTime = (seconds: number) => {
    HapticsService.triggerSoftFeedback();
    setCurrentSeconds((prev) => Math.max(0, Math.min(totalSeconds, prev + seconds)));
  };

  const handleClose = () => {
    audioEngine.stopAll();
    setIsPlaying(false);
    onClose();

    // If opened directly from Widget, close the Activity to return to phone desktop
    if (isFromWidget && NativeModules.LocalStorageModule) {
      NativeModules.LocalStorageModule.closePopupToHome();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalSeconds > 0 ? (currentSeconds / totalSeconds) * 100 : 0;
  const moodMeta = MOOD_DEFINITIONS[selectedMood];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.cardContainer}>
          {/* Esquina Superior Derecha: Botón circular con icono de cruz (✕) en baja opacidad */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClose}
            style={styles.closeCircleBtn}
          >
            <Text style={styles.closeCircleIcon}>✕</Text>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Cabecera Central: Avatar ampliado con foto en pareja, seguido del saludo personalizado */}
            <View style={styles.headerCentral}>
              <View style={styles.avatarFrame}>
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarEmoji}>❤️</Text>
                </View>
              </View>
              <Text style={styles.greetingTitle}>
                {prefs.partnerName}
              </Text>
              <Text style={styles.greetingSubtitle}>
                {prefs.senderName} está aquí contigo
              </Text>
            </View>

            {/* Fila de Chips de Estado Emocional: 4 botones tipo píldora */}
            <View style={styles.chipsRow}>
              {(['ansiedad', 'te_extrano', 'mal_dia', 'sorprendeme'] as MoodType[]).map((key) => {
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
                      styles.moodPill,
                      isSelected && { backgroundColor: '#3D2314', borderColor: '#F5EBE1' },
                    ]}
                  >
                    <Text style={[styles.moodPillText, isSelected && { color: '#FFFFFF', fontWeight: '800' }]}>
                      {key === 'ansiedad' && '🛡️ Ansiedad'}
                      {key === 'te_extrano' && '💖 Te Extraño'}
                      {key === 'mal_dia' && '🌧️ Mal Día'}
                      {key === 'sorprendeme' && '✨ Sorpréndeme'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Nota de Contención Emocional */}
            {currentItem && (
              <View style={styles.quoteCard}>
                <Text style={styles.quoteText}>
                  "{currentItem.note || moodMeta.reassuranceQuote}"
                </Text>
              </View>
            )}

            {/* Reproductor Multimedia Inferior */}
            <View style={styles.mediaPlayerContainer}>
              <View style={styles.mediaInfoRow}>
                {/* Miniatura Izquierda */}
                <View style={styles.coverThumbnail}>
                  <Text style={styles.thumbnailIcon}>🎵</Text>
                </View>

                {/* Información Central */}
                <View style={styles.mediaTextCol}>
                  <Text style={styles.mediaTitle} numberOfLines={1}>
                    {currentItem?.title || 'Mensaje Especial: Ánimo hoy'}
                  </Text>
                  <Text style={styles.mediaSubtitle} numberOfLines={1}>
                    Lo-Fi Piano Track • Sonando con ducking
                  </Text>
                </View>
              </View>

              {/* Barra de Desplazamiento (Seekbar) con marcas de tiempo */}
              <View style={styles.seekbarContainer}>
                <View style={styles.trackBackground}>
                  <View style={[styles.trackProgress, { width: `${progressPercent}%` }]} />
                  <View style={[styles.scrubberDot, { left: `${Math.min(96, progressPercent)}%` }]} />
                </View>
                <View style={styles.timeRow}>
                  <Text style={styles.timeText}>{formatTime(currentSeconds)}</Text>
                  <Text style={styles.timeText}>{formatTime(totalSeconds)}</Text>
                </View>
              </View>

              {/* Botonera de Control: -10s, Play/Pause agrandado, +10s */}
              <View style={styles.controlsRow}>
                <TouchableOpacity
                  onPress={() => handleSkipTime(-10)}
                  style={styles.skipBtn}
                >
                  <Text style={styles.skipText}>-10s</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleTogglePlay}
                  style={styles.playMainBtn}
                >
                  <Text style={styles.playMainIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSkipTime(10)}
                  style={styles.skipBtn}
                >
                  <Text style={styles.skipText}>+10s</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Botón Inferior para Abrir App Completa */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onOpenFullApp}
              style={styles.openFullAppBtn}
            >
              <Text style={styles.openFullAppText}>Abrir App Completa ➔</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 15, 10, 0.75)', // Glassmorphism backdrop chocolate
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  cardContainer: {
    width: Math.min(width - 24, 400),
    maxHeight: '90%',
    backgroundColor: '#FFFDF9',
    borderRadius: 28,
    padding: 20,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F5EBE1',
  },
  closeCircleBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1E8DF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeCircleIcon: {
    fontSize: 14,
    color: '#8C6F58',
    fontWeight: '800',
  },
  content: {
    alignItems: 'center',
    paddingTop: 8,
  },
  headerCentral: {
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarFrame: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5EBE1',
    borderWidth: 2,
    borderColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    elevation: 3,
  },
  avatarInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFE4E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2B1810',
  },
  greetingSubtitle: {
    fontSize: 12,
    color: '#8C6F58',
    marginTop: 1,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 12,
  },
  moodPill: {
    backgroundColor: '#F7EFE8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EBDCCE',
    margin: 3,
  },
  moodPillText: {
    fontSize: 11,
    color: '#5C3E2E',
    fontWeight: '700',
  },
  quoteCard: {
    width: '100%',
    backgroundColor: '#FAF3ED',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0E2D5',
  },
  quoteText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#42281D',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  mediaPlayerContainer: {
    width: '100%',
    backgroundColor: '#2B1810',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },
  mediaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  coverThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  thumbnailIcon: {
    fontSize: 18,
  },
  mediaTextCol: {
    flex: 1,
  },
  mediaTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mediaSubtitle: {
    fontSize: 10,
    color: '#E6D5C3',
    marginTop: 1,
  },
  seekbarContainer: {
    width: '100%',
    marginBottom: 8,
  },
  trackBackground: {
    height: 4,
    backgroundColor: '#4A2E20',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  trackProgress: {
    height: 4,
    backgroundColor: '#E11D48',
    borderRadius: 2,
  },
  scrubberDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F5EBE1',
    marginLeft: -6,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    color: '#E6D5C3',
    fontVariant: ['tabular-nums'],
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    color: '#E6D5C3',
    fontSize: 11,
    fontWeight: '700',
  },
  playMainBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    elevation: 4,
  },
  playMainIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    marginLeft: 2,
  },
  openFullAppBtn: {
    width: '100%',
    backgroundColor: '#FAF3ED',
    borderWidth: 1,
    borderColor: '#EBDCCE',
    borderRadius: 16,
    paddingVertical: 11,
    alignItems: 'center',
  },
  openFullAppText: {
    color: '#5C3E2E',
    fontWeight: '800',
    fontSize: 12,
  },
});
