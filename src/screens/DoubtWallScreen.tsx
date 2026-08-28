import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { DoubtItem } from '../config/database';
import { storageService } from '../modules/storageService';
import { audioEngine } from '../modules/audioEngine';
import { HapticsService } from '../modules/hapticsService';

export const DoubtWallScreen: React.FC = () => {
  const doubts = storageService.getDoubtItems();
  const [expandedId, setExpandedId] = useState<string | null>(doubts[0]?.id || null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isRoutineModalVisible, setIsRoutineModalVisible] = useState<boolean>(false);

  const routine = storageService.getCurrentRoutineStatus();
  const prefs = storageService.getPreferences();

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

      {/* Button: ¿Dónde está ahora mi amor? (Horario de rutina habitual sin GPS) */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          HapticsService.triggerSoftFeedback();
          setIsRoutineModalVisible(true);
        }}
        style={styles.routineBanner}
      >
        <Text style={styles.routineIcon}>🕒</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.routineTitle}>¿Dónde está {prefs.senderName} ahora?</Text>
          <Text style={styles.routineSub}>
            Toca para ver qué suele estar haciendo según la hora del día.
          </Text>
        </View>
        <Text style={styles.routineArrow}>➔</Text>
      </TouchableOpacity>

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

      {/* Routine Info Modal */}
      <Modal visible={isRoutineModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>{routine.icon}</Text>
            <Text style={styles.modalTitle}>Horario Habitual de {prefs.senderName}</Text>
            <Text style={styles.modalStatus}>{routine.status}</Text>
            <Text style={styles.modalDesc}>{routine.subtext}</Text>

            <View style={styles.peaceNote}>
              <Text style={styles.peaceNoteText}>
                ❤️ "Si tardo en responderte, es por mis actividades del día, jamás porque me haya alejado de ti. Apenas tenga un respiro, te escribiré."
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setIsRoutineModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseBtnText}>Entendido, me quedo en paz ❤️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  routineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  routineIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  routineTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369A1',
  },
  routineSub: {
    fontSize: 11,
    color: '#0284C7',
    marginTop: 1,
  },
  routineArrow: {
    fontSize: 16,
    color: '#0284C7',
    fontWeight: '800',
    marginLeft: 6,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalStatus: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0284C7',
    marginTop: 4,
  },
  modalDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
  peaceNote: {
    backgroundColor: '#FFF1F2',
    borderRadius: 16,
    padding: 14,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  peaceNoteText: {
    fontSize: 12,
    color: '#9F1239',
    fontStyle: 'italic',
    lineHeight: 18,
    textAlign: 'center',
  },
  modalCloseBtn: {
    backgroundColor: '#E11D48',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 18,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
