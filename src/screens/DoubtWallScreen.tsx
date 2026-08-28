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
import { AudioRecorderModal, AudioUploadTarget } from '../components/AudioRecorderModal';

interface DoubtWallScreenProps {
  onClose?: () => void;
}

export const DoubtWallScreen: React.FC<DoubtWallScreenProps> = ({ onClose }) => {
  const [doubts, setDoubts] = useState<DoubtItem[]>(storageService.getDoubtItems());
  const [expandedId, setExpandedId] = useState<string | null>(doubts[0]?.id || null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [recorderTarget, setRecorderTarget] = useState<AudioUploadTarget | null>(null);

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

  const handleOpenRecorderForDoubt = (item: DoubtItem) => {
    HapticsService.triggerSoftFeedback();
    setRecorderTarget({
      type: 'doubt',
      id: item.id,
      title: item.trigger,
    });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* Cabecera y Fondo Negro Absoluto #000000 OLED */}
      <View style={styles.navBar}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.navTitle}>Muro de las Dudas e Inseguridades</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.nightHint}>
        Modo Nocturno OLED: Respuestas calmadas para desarmar los pensamientos de madrugada.
      </Text>

      {/* Módulos Tipo Acordeón (5 Filas) */}
      {doubts.map((item) => {
        const isExpanded = expandedId === item.id;
        const isPlaying = playingId === item.id;

        if (isExpanded) {
          /* Estado Expandido: Tarjeta completa con fondo crema claro #F5EBE1 */
          return (
            <View key={item.id} style={styles.expandedCardCream}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleToggle(item.id)}
                style={styles.expandedHeader}
              >
                <Text style={styles.expandedTriggerText}>{item.trigger}</Text>
                <Text style={styles.arrowIconCream}>∧</Text>
              </TouchableOpacity>

              <Text style={styles.expandedAnswerTitle}>{item.answerTitle}</Text>
              <Text style={styles.expandedExplanation}>"{item.explanation}"</Text>

              {/* Afirmación Final */}
              <View style={styles.affirmationBox}>
                <Text style={styles.affirmationLabel}>LA VERDAD:</Text>
                <Text style={styles.affirmationText}>{item.affirmation}</Text>
              </View>

              {/* Botón para reproducir nota de voz explicativa */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handlePlayVoice(item)}
                style={[styles.voiceBtnCoffee, isPlaying && styles.voiceBtnCoffeeActive]}
              >
                <Text style={styles.voiceBtnText}>
                  {isPlaying ? '⏸ Pausar Explicación' : item.voiceFilename ? '▶ Escuchar mi respuesta en audio' : '▶ Escuchar Audio'}
                </Text>
              </TouchableOpacity>

              {/* Botón dedicado: Grabar o Subir Audio para esta duda */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleOpenRecorderForDoubt(item)}
                style={styles.recordDoubtBtn}
              >
                <Text style={styles.recordDoubtText}>
                  🎙️ Grabar o Cambiar Audio para esta Duda
                </Text>
              </TouchableOpacity>
            </View>
          );
        }

        /* Estados Colapsados: Bloques horizontales en relieve oscuro con esquinas redondeadas 16dp */
        return (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            onPress={() => handleToggle(item.id)}
            style={styles.collapsedBlockDark}
          >
            <Text style={styles.collapsedTriggerText}>{item.trigger}</Text>
            <Text style={styles.arrowIconDark}>∨</Text>
          </TouchableOpacity>
        );
      })}

      {/* Modal Grabador Universal */}
      <AudioRecorderModal
        visible={!!recorderTarget}
        target={recorderTarget}
        onClose={() => setRecorderTarget(null)}
        onSaved={(newAudio) => {
          if (recorderTarget?.id) {
            const updated = doubts.map((d) =>
              d.id === recorderTarget.id ? { ...d, voiceFilename: newAudio } : d
            );
            setDoubts(updated);
          }
          setRecorderTarget(null);
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#000000', // Fondo negro absoluto OLED
    minHeight: '100%',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingTop: 4,
  },
  backBtn: {
    padding: 4,
  },
  backArrow: {
    fontSize: 22,
    color: '#E6D5C3',
    fontWeight: '700',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  nightHint: {
    fontSize: 11,
    color: '#A1826E',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  collapsedBlockDark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#18120E',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A1F18',
    elevation: 2,
  },
  collapsedTriggerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#E6D5C3',
    marginRight: 8,
  },
  arrowIconDark: {
    fontSize: 14,
    color: '#8C6F58',
    fontWeight: '900',
  },
  expandedCardCream: {
    backgroundColor: '#F5EBE1',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#EBDCCE',
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  expandedTriggerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
    color: '#E11D48',
    marginRight: 8,
  },
  arrowIconCream: {
    fontSize: 14,
    color: '#5C3E2E',
    fontWeight: '900',
  },
  expandedAnswerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2B1810',
    marginBottom: 6,
  },
  expandedExplanation: {
    fontSize: 12,
    lineHeight: 18,
    color: '#42281D',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  affirmationBox: {
    backgroundColor: '#FAF3ED',
    borderRadius: 12,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#16A34A',
    marginBottom: 12,
  },
  affirmationLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#16A34A',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  affirmationText: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '700',
  },
  voiceBtnCoffee: {
    backgroundColor: '#2B1810',
    paddingVertical: 11,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  voiceBtnCoffeeActive: {
    backgroundColor: '#E11D48',
  },
  voiceBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  recordDoubtBtn: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#C4A48A',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  recordDoubtText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5C3E2E',
  },
});
