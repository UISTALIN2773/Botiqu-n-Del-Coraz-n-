import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { storageService } from '../modules/storageService';
import { HapticsService } from '../modules/hapticsService';
import { audioEngine } from '../modules/audioEngine';

export interface AudioUploadTarget {
  type: 'sos' | 'doubt' | 'capsule' | 'mood' | 'memory';
  id?: string;
  title: string;
}

interface AudioRecorderModalProps {
  visible: boolean;
  target?: AudioUploadTarget | null;
  onClose: () => void;
  onSaved: (audioPath: string, photoUri?: string) => void;
}

export const AudioRecorderModal: React.FC<AudioRecorderModalProps> = ({
  visible,
  target,
  onClose,
  onSaved,
}) => {
  const [activeTab, setActiveTab] = useState<'grabar' | 'subir' | 'foto'>('grabar');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [recordedFileName, setRecordedFileName] = useState<string>('');
  const [audioFilePath, setAudioFilePath] = useState<string>('');
  const [photoUri, setPhotoUri] = useState<string>('');
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
        HapticsService.triggerSoftFeedback();
      }, 1000);

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecord = () => {
    HapticsService.triggerHeartbeat();
    setRecordSeconds(0);
    setIsRecording(true);
    setRecordedFileName(`grabacion_voz_${Date.now()}.wav`);
  };

  const handleStopRecord = () => {
    HapticsService.triggerSuccessFeedback();
    setIsRecording(false);
  };

  const handleTogglePreview = () => {
    const file = recordedFileName || audioFilePath || 'voice_te_extrano_01.wav';
    if (isPlayingPreview) {
      audioEngine.stopAll();
      setIsPlayingPreview(false);
    } else {
      setIsPlayingPreview(true);
      HapticsService.triggerSoftFeedback();
      audioEngine.playDualTrack(file, 'piano', undefined, () => {
        setIsPlayingPreview(false);
      });
    }
  };

  const handleSave = () => {
    const finalAudio = recordedFileName || audioFilePath.trim() || 'voice_ansiedad_01.wav';
    HapticsService.triggerSuccessFeedback();

    if (target) {
      // Save directly into appropriate storage module
      if (target.type === 'doubt' && target.id) {
        const doubts = storageService.getDoubtItems();
        const item = doubts.find((d) => d.id === target.id);
        if (item) item.voiceFilename = finalAudio;
      } else if (target.type === 'capsule' && target.id) {
        const capsules = storageService.getTimeCapsules();
        const cap = capsules.find((c) => c.id === target.id);
        if (cap) cap.voiceFilename = finalAudio;
      }
    }

    onSaved(finalAudio, photoUri);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setIsRecording(false);
    setRecordSeconds(0);
    setRecordedFileName('');
    setAudioFilePath('');
    setPhotoUri('');
    setIsPlayingPreview(false);
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.cardContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Estudio de Audio & Foto 🎙️📸</Text>
              <Text style={styles.targetLabel}>
                Para: {target?.title || 'Recuerdo Especial de Pareja'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Navigation Tabs */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              onPress={() => {
                HapticsService.triggerSoftFeedback();
                setActiveTab('grabar');
              }}
              style={[styles.tabBtn, activeTab === 'grabar' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, activeTab === 'grabar' && styles.tabTextActive]}>
                🎙️ Grabar Voz
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                HapticsService.triggerSoftFeedback();
                setActiveTab('subir');
              }}
              style={[styles.tabBtn, activeTab === 'subir' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, activeTab === 'subir' && styles.tabTextActive]}>
                📁 WhatsApp / Audio
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                HapticsService.triggerSoftFeedback();
                setActiveTab('foto');
              }}
              style={[styles.tabBtn, activeTab === 'foto' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, activeTab === 'foto' && styles.tabTextActive]}>
                🖼️ Subir Foto
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* TAB 1: GRABAR VOZ DIRECTAMENTE */}
            {activeTab === 'grabar' && (
              <View style={styles.tabContentCenter}>
                <Text style={styles.instructionText}>
                  Presiona el micrófono para empezar a hablar. Tu pareja escuchará tu voz auténtica.
                </Text>

                <Animated.View style={[styles.micCircleContainer, { transform: [{ scale: pulseAnim }] }]}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={isRecording ? handleStopRecord : handleStartRecord}
                    style={[styles.micRecordBtn, isRecording && styles.micRecordBtnActive]}
                  >
                    <Text style={styles.micEmoji}>{isRecording ? '⏹' : '🎙️'}</Text>
                  </TouchableOpacity>
                </Animated.View>

                {/* Live Timer */}
                <Text style={[styles.timerText, isRecording && { color: '#E11D48' }]}>
                  {formatTimer(recordSeconds)}
                </Text>
                <Text style={styles.timerSublabel}>
                  {isRecording ? 'Grabando tu voz en vivo... Toca para detener' : recordedFileName ? '¡Audio grabado listo!' : 'Listo para grabar'}
                </Text>

                {recordedFileName ? (
                  <View style={styles.recordedBox}>
                    <Text style={styles.recordedName}>Archivo: {recordedFileName}</Text>
                    <TouchableOpacity onPress={handleTogglePreview} style={styles.previewBtn}>
                      <Text style={styles.previewText}>
                        {isPlayingPreview ? '⏸ Pausar Prueba' : '▶ Escuchar cómo quedó'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            )}

            {/* TAB 2: VINCULAR AUDIO / WHATSAPP */}
            {activeTab === 'subir' && (
              <View style={styles.tabContent}>
                <Text style={styles.instructionText}>
                  Pega el nombre o ruta de una nota de voz guardada de WhatsApp o descargada en tu celular:
                </Text>

                <TextInput
                  value={audioFilePath}
                  onChangeText={setAudioFilePath}
                  placeholder="Ej: /Download/nota_de_voz_amor.m4a o audio_whatsapp.opus"
                  placeholderTextColor="#94A3B8"
                  style={styles.textInput}
                />

                <Text style={styles.quickLabel}>O selecciona una plantilla de audio precargada:</Text>
                <View style={styles.presetsRow}>
                  {[
                    { label: 'Calma 1', file: 'voice_ansiedad_01.wav' },
                    { label: 'Calma 2', file: 'voice_ansiedad_02.wav' },
                    { label: 'Te Extraño', file: 'voice_te_extrano_01.wav' },
                    { label: 'Mal Día', file: 'voice_mal_dia_01.wav' },
                    { label: 'Alegría', file: 'voice_reir_01.wav' },
                  ].map((p) => (
                    <TouchableOpacity
                      key={p.file}
                      onPress={() => {
                        HapticsService.triggerSoftFeedback();
                        setAudioFilePath(p.file);
                      }}
                      style={[styles.presetChip, audioFilePath === p.file && styles.presetChipActive]}
                    >
                      <Text style={[styles.presetChipText, audioFilePath === p.file && styles.presetChipTextActive]}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {audioFilePath ? (
                  <TouchableOpacity onPress={handleTogglePreview} style={styles.previewBtn}>
                    <Text style={styles.previewText}>
                      {isPlayingPreview ? '⏸ Pausar Prueba' : '▶ Probar Audio Seleccionado'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            {/* TAB 3: SUBIR FOTO */}
            {activeTab === 'foto' && (
              <View style={styles.tabContent}>
                <Text style={styles.instructionText}>
                  Ingresa la ruta local de la foto de pareja (en tu galería) o una URL de imagen:
                </Text>

                <TextInput
                  value={photoUri}
                  onChangeText={setPhotoUri}
                  placeholder="Ej: /storage/emulated/0/DCIM/Camera/nosotros.jpg"
                  placeholderTextColor="#94A3B8"
                  style={styles.textInput}
                />

                {photoUri ? (
                  <View style={styles.photoPreviewCard}>
                    <Text style={styles.previewTitle}>Vista Previa de la Foto:</Text>
                    <Image source={{ uri: photoUri }} style={styles.previewImage} />
                  </View>
                ) : (
                  <View style={styles.emptyPhotoBox}>
                    <Text style={{ fontSize: 32 }}>🖼️</Text>
                    <Text style={styles.emptyPhotoText}>
                      Al agregar la foto, se sincronizará automáticamente con el marco del Widget y el Baúl.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer Save Button */}
          <View style={styles.footerRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.85} onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Guardar Permanentemente</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 15, 10, 0.8)',
    justifyContent: 'flex-end',
  },
  cardContainer: {
    backgroundColor: '#FFFDF9',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '85%',
    elevation: 20,
    borderWidth: 1.5,
    borderColor: '#EBDCCE',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2B1810',
  },
  targetLabel: {
    fontSize: 12,
    color: '#E11D48',
    fontWeight: '700',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  closeIcon: {
    fontSize: 18,
    color: '#8C6F58',
    fontWeight: '800',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#F5EBE1',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: '#2B1810',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C6F58',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  bodyScroll: {
    maxHeight: 340,
  },
  tabContentCenter: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabContent: {
    paddingVertical: 6,
  },
  instructionText: {
    fontSize: 12,
    color: '#5C3E2E',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  micCircleContainer: {
    marginVertical: 10,
  },
  micRecordBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FAF5EE',
    borderWidth: 3,
    borderColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  micRecordBtnActive: {
    backgroundColor: '#E11D48',
    borderColor: '#FFFFFF',
  },
  micEmoji: {
    fontSize: 32,
  },
  timerText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2B1810',
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },
  timerSublabel: {
    fontSize: 11,
    color: '#8C6F58',
    marginTop: 2,
  },
  recordedBox: {
    width: '100%',
    backgroundColor: '#FAF5EE',
    borderRadius: 16,
    padding: 12,
    marginTop: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBDCCE',
  },
  recordedName: {
    fontSize: 11,
    color: '#2B1810',
    fontWeight: '700',
    marginBottom: 6,
  },
  previewBtn: {
    backgroundColor: '#2B1810',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  previewText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  textInput: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EBDCCE',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 12,
    color: '#2B1810',
    marginBottom: 14,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5C3E2E',
    marginBottom: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  presetChip: {
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EBDCCE',
    marginRight: 6,
    marginBottom: 6,
  },
  presetChipActive: {
    backgroundColor: '#E11D48',
    borderColor: '#E11D48',
  },
  presetChipText: {
    fontSize: 11,
    color: '#5C3E2E',
    fontWeight: '700',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  emptyPhotoBox: {
    backgroundColor: '#FAF5EE',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#C4A48A',
    marginVertical: 10,
  },
  emptyPhotoText: {
    fontSize: 11,
    color: '#8C6F58',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
  photoPreviewCard: {
    alignItems: 'center',
    marginVertical: 10,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2B1810',
    marginBottom: 8,
  },
  previewImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#E11D48',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5EBE1',
    paddingTop: 14,
    marginTop: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8C6F58',
  },
  saveBtn: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
});
