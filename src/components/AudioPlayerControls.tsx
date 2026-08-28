import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface AudioPlayerControlsProps {
  isPlaying: boolean;
  currentSeconds: number;
  totalSeconds: number;
  ambientTrackName: string;
  onTogglePlay: () => void;
  accentColor?: string;
}

export const AudioPlayerControls: React.FC<AudioPlayerControlsProps> = ({
  isPlaying,
  currentSeconds,
  totalSeconds,
  ambientTrackName,
  onTogglePlay,
  accentColor = '#E11D48',
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = totalSeconds > 0 ? (currentSeconds / totalSeconds) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Ambient status indicator (Audio Ducking badge) */}
      <View style={styles.badgeRow}>
        <View style={[styles.pulseDot, { backgroundColor: accentColor }]} />
        <Text style={styles.badgeText}>
          Voz + Fondo {ambientTrackName.toUpperCase()} (Ducking Activo)
        </Text>
      </View>

      {/* Scrubber Progress Bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressBar,
            { width: `${Math.min(100, progress)}%`, backgroundColor: accentColor },
          ]}
        />
      </View>

      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTime(currentSeconds)}</Text>
        <Text style={styles.timeText}>{formatTime(totalSeconds)}</Text>
      </View>

      {/* Main Play/Pause Button */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onTogglePlay}
          style={[styles.playButton, { backgroundColor: accentColor }]}
        >
          {isPlaying ? (
            // Pause Icon
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="#FFFFFF">
              <Path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </Svg>
          ) : (
            // Play Icon
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="#FFFFFF">
              <Path d="M8 5v14l11-7z" />
            </Svg>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#525252',
    letterSpacing: 0.2,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  timeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timeText: {
    fontSize: 12,
    color: '#737373',
    fontVariant: ['tabular-nums'],
  },
  controlsRow: {
    marginTop: 8,
    alignItems: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
