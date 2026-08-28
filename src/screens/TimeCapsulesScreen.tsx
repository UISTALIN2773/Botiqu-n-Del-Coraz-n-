import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { TimeCapsuleItem } from '../config/database';
import { storageService } from '../modules/storageService';
import { audioEngine } from '../modules/audioEngine';
import { HapticsService } from '../modules/hapticsService';

export const TimeCapsulesScreen: React.FC = () => {
  const [capsules, setCapsules] = useState<TimeCapsuleItem[]>(storageService.getTimeCapsules());
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsuleItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleOpenCapsule = (item: TimeCapsuleItem) => {
    HapticsService.triggerSuccessFeedback();
    storageService.openTimeCapsule(item.id);
    setCapsules([...storageService.getTimeCapsules()]);
    setSelectedCapsule(item);
  };

  const handlePlayVoice = () => {
    if (!selectedCapsule || !selectedCapsule.voiceFilename) return;
    if (isPlaying) {
      audioEngine.stopAll();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      audioEngine.playDualTrack(selectedCapsule.voiceFilename, 'piano', undefined, () => {
        setIsPlaying(false);
      });
    }
  };

  const handleCloseModal = () => {
    audioEngine.stopAll();
    setIsPlaying(false);
    setSelectedCapsule(null);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Cápsulas "Abrir Solo Si..." 💌</Text>
      <Text style={styles.subheading}>
        Sobres sellados con instrucciones especiales. Ábrelos únicamente cuando la situación lo amerite.
      </Text>

      <View style={styles.grid}>
        {capsules.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            onPress={() => handleOpenCapsule(item)}
            style={[styles.envelopeCard, item.isOpened && styles.envelopeCardOpened]}
          >
            <View style={styles.sealCircle}>
              <Text style={styles.sealIcon}>{item.sealIcon}</Text>
            </View>
            <Text style={styles.envelopeTitle}>{item.title}</Text>
            <Text style={styles.envelopeDesc} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={[styles.statusBadge, item.isOpened ? styles.badgeOpened : styles.badgeSealed]}>
              <Text style={[styles.statusText, item.isOpened ? styles.textOpened : styles.textSealed]}>
                {item.isOpened ? 'Sobre Abierto 📖' : 'Sello de Cera Cerrado 🔒'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Letter Reading Modal */}
      <Modal visible={!!selectedCapsule} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.letterPaper}>
            <View style={styles.letterHeader}>
              <Text style={styles.letterIcon}>{selectedCapsule?.sealIcon}</Text>
              <Text style={styles.letterTitle}>{selectedCapsule?.title}</Text>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.letterBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.conditionText}>
                Condición: {selectedCapsule?.unlockCondition}
              </Text>
              <Text style={styles.letterContent}>"{selectedCapsule?.content}"</Text>

              {selectedCapsule?.voiceFilename && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handlePlayVoice}
                  style={[styles.voiceBtn, isPlaying && styles.voiceBtnActive]}
                >
                  <Text style={styles.voiceBtnText}>
                    {isPlaying ? '⏸ Pausar Audio' : '▶ Escuchar mi nota de voz'}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  envelopeCard: {
    width: '48%',
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  envelopeCardOpened: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  sealCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  sealIcon: {
    fontSize: 20,
  },
  envelopeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  envelopeDesc: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeSealed: {
    backgroundColor: '#FFEDD5',
  },
  badgeOpened: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  textSealed: {
    color: '#C2410C',
  },
  textOpened: {
    color: '#64748B',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  letterPaper: {
    backgroundColor: '#FFFDF9',
    borderRadius: 24,
    padding: 22,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    elevation: 10,
  },
  letterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  letterIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  letterTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '700',
  },
  letterBody: {
    marginTop: 4,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
    marginBottom: 12,
  },
  letterContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#334155',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  voiceBtn: {
    backgroundColor: '#E11D48',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  voiceBtnActive: {
    backgroundColor: '#881337',
  },
  voiceBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
