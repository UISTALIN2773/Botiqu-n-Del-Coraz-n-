import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { TimeCapsuleItem } from '../config/database';
import { storageService } from '../modules/storageService';
import { audioEngine } from '../modules/audioEngine';
import { HapticsService } from '../modules/hapticsService';

interface TimeCapsulesScreenProps {
  onClose?: () => void;
}

export const TimeCapsulesScreen: React.FC<TimeCapsulesScreenProps> = ({ onClose }) => {
  const [capsules, setCapsules] = useState<TimeCapsuleItem[]>(storageService.getTimeCapsules());
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsuleItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isUnsealing, setIsUnsealing] = useState<boolean>(false);

  const sealCrackAnim = useRef(new Animated.Value(1)).current;
  const letterFadeAnim = useRef(new Animated.Value(0)).current;

  // Exact 3 envelopes as requested in Specification 5
  const envelopes = [
    {
      id: 'capsule-1',
      title: 'Sobre de Consuelo',
      conditionText: '😢 Ábreme si estás llorando',
      sealColor: '#DC2626', // Rojo rubí
      sealEmoji: '❤️',
      content: 'Sé que en este momento duele mucho. Llora todo lo que necesites, no te guardes nada. Pero prométeme que al terminar tomarás un vaso con agua. Recuerda que no estás sola/o. Te amo con toda mi alma.',
      voiceFilename: 'voice_ansiedad_01.wav',
    },
    {
      id: 'capsule-2',
      title: 'Sobre de Fuerza',
      conditionText: '🛡️ No puedes más',
      sealColor: '#6B21A8', // Púrpura oscuro
      sealEmoji: '⚔️',
      content: 'Has superado el 100% de tus peores días del pasado. Eres más fuerte de lo que crees y más valiente de lo que imaginas. Descansa hoy, yo te sostengo la mano mentalmente.',
      voiceFilename: 'voice_mal_dia_01.wav',
    },
    {
      id: 'capsule-3',
      title: 'Sobre de Amor y Paz',
      conditionText: '🕊️ Si estás enojada/o conmigo',
      sealColor: '#1E3A8A', // Azul noche
      sealEmoji: '🕊️',
      content: 'Somos un equipo contra el problema, no el uno contra el otro. Si me equivoqué o te lastimé, perdóname de corazón. Lo que más quiero en esta vida es verte en paz y feliz a mi lado.',
      voiceFilename: 'voice_te_extrano_01.wav',
    },
  ];

  const handleOpenEnvelope = (env: typeof envelopes[0]) => {
    HapticsService.triggerHeartbeat();
    setSelectedCapsule(env as any);
    setIsUnsealing(true);
    sealCrackAnim.setValue(1);
    letterFadeAnim.setValue(0);

    // Micro-animación de fractura de cera
    Animated.sequence([
      Animated.timing(sealCrackAnim, { toValue: 1.35, duration: 220, useNativeDriver: true }),
      Animated.timing(sealCrackAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(letterFadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start(() => {
      setIsUnsealing(false);
      HapticsService.triggerSuccessFeedback();
      storageService.openTimeCapsule(env.id);
      setCapsules([...storageService.getTimeCapsules()]);
    });
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

  const handleClose = () => {
    audioEngine.stopAll();
    setIsPlaying(false);
    setSelectedCapsule(null);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* Cabecera: Barra superior minimalista con flecha (←), título "Time Capsules Screen" y opciones (⋮) */}
      <View style={styles.navBar}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.navBtn}>
            <Text style={styles.navArrow}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.navTitle}>Time Capsules Screen</Text>
        <TouchableOpacity style={styles.navBtn}>
          <Text style={styles.navMenu}>⋮</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Sobres postales con textura de pergamino y sellos de cera en relieve 3D.
      </Text>

      {/* Listado Vertical de Sobres Postales */}
      <View style={styles.envelopeList}>
        {envelopes.map((env) => {
          const isOpened = capsules.find((c) => c.id === env.id)?.isOpened;
          return (
            <TouchableOpacity
              key={env.id}
              activeOpacity={0.9}
              onPress={() => handleOpenEnvelope(env)}
              style={styles.envelopeCard}
            >
              {/* Bordes cosidos simulados */}
              <View style={styles.stitchedBorder}>
                {/* Sello de Lacre Central en relieve 3D */}
                <View style={[styles.waxSeal3D, { backgroundColor: env.sealColor }]}>
                  <View style={styles.waxSealInner}>
                    <Text style={styles.waxEmoji}>{env.sealEmoji}</Text>
                  </View>
                </View>

                {/* Condición Inferior */}
                <Text style={styles.conditionTitle}>{env.conditionText}</Text>
                <Text style={styles.envelopeStatus}>
                  {isOpened ? 'Carta Desplegada • Toca para volver a leer' : 'Sello Intacto • Toca para romper cera'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Modal de Lectura a Pantalla Completa */}
      <Modal visible={!!selectedCapsule} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          {isUnsealing ? (
            /* Animación de Fractura de Cera */
            <Animated.View style={[styles.crackingBox, { transform: [{ scale: sealCrackAnim }] }]}>
              <View style={[styles.waxSeal3D, { width: 80, height: 80, borderRadius: 40, backgroundColor: selectedCapsule?.sealColor || '#DC2626' }]}>
                <Text style={{ fontSize: 36 }}>💥</Text>
              </View>
              <Text style={styles.crackingLabel}>Crujiendo sello de cera...</Text>
            </Animated.View>
          ) : (
            /* Carta en Pantalla Completa Desplegada */
            <Animated.View style={[styles.fullLetterPaper, { opacity: letterFadeAnim }]}>
              <View style={styles.letterHeaderRow}>
                <Text style={styles.letterConditionHeader}>{selectedCapsule?.conditionText}</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ marginTop: 10 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.letterParagraph}>"{selectedCapsule?.content}"</Text>

                {selectedCapsule?.voiceFilename && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handlePlayVoice}
                    style={[styles.playVoiceBtn, isPlaying && styles.playVoiceBtnActive]}
                  >
                    <Text style={styles.playVoiceBtnText}>
                      {isPlaying ? '⏸ Pausar Nota de Voz' : '▶ Escuchar mi nota de voz grabada'}
                    </Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </Animated.View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#FAF5EE', // Tono pergamino suave
    minHeight: '100%',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    padding: 6,
  },
  navArrow: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2B1810',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2B1810',
  },
  navMenu: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2B1810',
  },
  subtitle: {
    fontSize: 12,
    color: '#8C6F58',
    textAlign: 'center',
    marginBottom: 18,
  },
  envelopeList: {
    alignItems: 'center',
  },
  envelopeCard: {
    width: '100%',
    backgroundColor: '#F5EBE1', // Textura de papel pergamino
    borderRadius: 22,
    padding: 10,
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#2B1810',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    borderWidth: 1.5,
    borderColor: '#EBDCCE',
  },
  stitchedBorder: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#C4A48A', // Bordes cosidos simulados
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  waxSeal3D: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 12,
  },
  waxSealInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waxEmoji: {
    fontSize: 20,
  },
  conditionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#2B1810',
    textAlign: 'center',
    marginBottom: 4,
  },
  envelopeStatus: {
    fontSize: 11,
    color: '#8C6F58',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 15, 10, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  crackingBox: {
    alignItems: 'center',
  },
  crackingLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 16,
  },
  fullLetterPaper: {
    backgroundColor: '#FFFDF9',
    borderRadius: 26,
    padding: 24,
    maxHeight: '85%',
    borderWidth: 2,
    borderColor: '#EBDCCE',
    elevation: 12,
  },
  letterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F5EBE1',
    paddingBottom: 10,
  },
  letterConditionHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: '#E11D48',
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#8C6F58',
  },
  letterParagraph: {
    fontSize: 14,
    lineHeight: 24,
    color: '#332015',
    fontStyle: 'italic',
    marginVertical: 14,
  },
  playVoiceBtn: {
    backgroundColor: '#2B1810',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  playVoiceBtnActive: {
    backgroundColor: '#E11D48',
  },
  playVoiceBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
