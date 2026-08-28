import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { DoubtItem } from '../config/database';
import { storageService } from '../modules/storageService';
import { audioEngine } from '../modules/audioEngine';
import { HapticsService } from '../modules/hapticsService';

export const DoubtWallScreen: React.FC = () => {
  const doubts = storageService.getDoubtItems();
  const [expandedId, setExpandedId] = useState<string | null>(doubts[0]?.id || null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    HapticsService.triggerSoftFeedback();
    setExpandedId(expandedId === id ? null : id);
  };

  const handlePlayVoice = (item: DoubtItem) => {
    if (playingId === item.id) {
      audioEngine.stopAll();
      setPlayingId(null);
    } else {
      setPlayingId(item.id);
      audioEngine.playDualTrack(item.voiceFilename, 'piano', undefined, () => {
        setPlayingId(null);
      });
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Muro de las Dudas e Inseguridades 🛡️</Text>
      <Text style={styles.subheading}>
        Para esos momentos en los que tu cabeza te hace sobrepensar y necesitas recordar la verdad.
      </Text>

      {doubts.map((item) => {
        const isExpanded = expandedId === item.id;
        const isPlaying = playingId === item.id;
        return (
          <View key={item.id} style={styles.card}>
            {/* Header Accordion Trigger */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleToggle(item.id)}
              style={styles.cardHeader}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.triggerText}>{item.trigger}</Text>
                <Text style={styles.answerPreview}>{item.answerTitle}</Text>
              </View>
              <Text style={styles.arrowIcon}>{isExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {/* Expanded Content */}
            {isExpanded && (
              <View style={styles.cardBody}>
                <Text style={styles.explanationText}>"{item.explanation}"</Text>

                {/* Affirmation Badge */}
                <View style={styles.affirmationBox}>
                  <Text style={styles.affirmationLabel}>💡 La Verdad:</Text>
                  <Text style={styles.affirmationText}>{item.affirmation}</Text>
                </View>

                {/* Audio Button */}
                {item.voiceFilename && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handlePlayVoice(item)}
                    style={[styles.audioBtn, isPlaying && styles.audioBtnActive]}
                  >
                    <Text style={styles.audioBtnText}>
                      {isPlaying ? '⏸ Pausar Nota de Voz' : '▶ Escuchar mi respuesta en audio'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subheading: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16,
    fontWeight: '500',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E11D48',
  },
  answerPreview: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  arrowIcon: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 8,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 12,
  },
  explanationText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  affirmationBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: 12,
  },
  affirmationLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 2,
  },
  affirmationText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '700',
  },
  audioBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  audioBtnActive: {
    backgroundColor: '#E11D48',
  },
  audioBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
