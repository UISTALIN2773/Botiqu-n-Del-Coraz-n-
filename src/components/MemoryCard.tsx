import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { EmotionalItem, MOOD_DEFINITIONS } from '../config/database';
import { HapticsService } from '../modules/hapticsService';

interface MemoryCardProps {
  item: EmotionalItem;
  isPlaying: boolean;
  onPlay: (item: EmotionalItem) => void;
  onToggleFavorite: (id: string) => void;
  onCardPress?: (item: EmotionalItem) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  item,
  isPlaying,
  onPlay,
  onToggleFavorite,
  onCardPress,
}) => {
  const moodMeta = MOOD_DEFINITIONS[item.mood] || MOOD_DEFINITIONS.ansiedad;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onCardPress?.(item)}
      style={styles.card}
    >
      {/* Top Tag & Favorite Row */}
      <View style={styles.topRow}>
        <View style={[styles.tagBadge, { backgroundColor: `${moodMeta.color}15` }]}>
          <Text style={[styles.tagText, { color: moodMeta.color }]}>{item.tag || moodMeta.label}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            HapticsService.triggerSoftFeedback();
            onToggleFavorite(item.id);
          }}
          style={styles.favBtn}
        >
          <Text style={styles.favIcon}>{item.isFavorite ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      {/* Title & Subtitle */}
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>

      {/* Note preview */}
      <Text style={styles.notePreview} numberOfLines={3}>
        "{item.note}"
      </Text>

      {/* Bottom Actions Row */}
      <View style={styles.bottomRow}>
        <Text style={styles.dateText}>{item.date || 'Recuerdo especial'}</Text>
        {item.voiceFilename && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPlay(item)}
            style={[
              styles.playBtn,
              { backgroundColor: isPlaying ? '#0F172A' : moodMeta.color },
            ]}
          >
            <Text style={styles.playBtnText}>
              {isPlaying ? '⏸ Pausar' : '▶ Escuchar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  favBtn: {
    padding: 4,
  },
  favIcon: {
    fontSize: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '500',
  },
  notePreview: {
    fontSize: 13,
    lineHeight: 19,
    color: '#334155',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 8,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  playBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  playBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
