import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { storageService } from '../modules/storageService';
import { audioEngine } from '../modules/audioEngine';
import { HapticsService } from '../modules/hapticsService';

interface PanicSOSScreenProps {
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const PanicSOSScreen: React.FC<PanicSOSScreenProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [groundingStep, setGroundingStep] = useState<number>(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  const daysTogether = storageService.getDaysTogether();
  const prefs = storageService.getPreferences();

  const groundingTasks = [
    { count: '5', text: 'Cosas que puedes VER a tu alrededor ahora mismo', example: '(ej: la luz, tus manos, un mueble, un objeto)' },
    { count: '4', text: 'Cosas que puedes TOCAR o sentir en tu piel', example: '(ej: tu ropa, la textura de la cama, tus dedos)' },
    { count: '3', text: 'Cosas que puedes ESCUCHAR con atención', example: '(ej: tu respiración, el viento, un sonido lejano)' },
    { count: '2', text: 'Cosas que puedes OLER o un aroma agradable', example: '(ej: tu perfume, el aire fresco, café)' },
    { count: '1', text: 'Cosa positiva que SABOREAS o agradeces', example: '(ej: el amor sincero que te tengo y que nada borrará)' },
  ];

  const handleNextGrounding = () => {
    HapticsService.triggerSoftFeedback();
    if (groundingStep < groundingTasks.length - 1) {
      setGroundingStep((prev) => prev + 1);
    } else {
      setCurrentStep(2);
      playRealityAnchor();
    }
  };

  const playRealityAnchor = async () => {
    setIsAudioPlaying(true);
    HapticsService.triggerHeartbeat();
    await audioEngine.playDualTrack('voice_ansiedad_01.wav', 'rain', undefined, () => {
      setIsAudioPlaying(false);
    });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.badgeSOS}>🚨 PROTOCOLO DE CALMA INMEDIATA</Text>
          <Text style={styles.title}>Parar el Sobrepensamiento</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Step Indicator Tabs */}
      <View style={styles.stepsBar}>
        {[
          { step: 1, label: '1. Contacto a Tierra' },
          { step: 2, label: '2. Voz de Ancla' },
          { step: 3, label: '3. Hechos Reales' },
        ].map((s) => (
          <TouchableOpacity
            key={s.step}
            onPress={() => setCurrentStep(s.step as any)}
            style={[styles.stepTab, currentStep === s.step && styles.stepTabActive]}
          >
            <Text style={[styles.stepTabText, currentStep === s.step && styles.stepTabTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FASE 1: CONTACTO A TIERRA 5-4-3-2-1 */}
      {currentStep === 1 && (
        <View style={styles.phaseCard}>
          <Text style={styles.phaseBadge}>Técnica 5-4-3-2-1</Text>
          <Text style={styles.phaseTitle}>Regresa a este momento presente</Text>
          <Text style={styles.phaseSub}>
            Tu mente está en el futuro imaginando escenarios que no son reales. Respira despacio y haz esto conmigo:
          </Text>

          <View style={styles.groundingBox}>
            <Text style={styles.groundingNumber}>{groundingTasks[groundingStep].count}</Text>
            <Text style={styles.groundingTask}>{groundingTasks[groundingStep].text}</Text>
            <Text style={styles.groundingExample}>{groundingTasks[groundingStep].example}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleNextGrounding}
            style={styles.actionBtn}
          >
            <Text style={styles.actionBtnText}>
              {groundingStep < groundingTasks.length - 1 ? 'Listo, siguiente paso ➔' : 'Ir a la Voz de Calma ➔'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FASE 2: AUDIO ANCLA DE REALIDAD */}
      {currentStep === 2 && (
        <View style={styles.phaseCard}>
          <Text style={styles.phaseBadge}>Tu Ancla de Realidad</Text>
          <Text style={styles.phaseTitle}>Escucha mi voz recordándote la verdad</Text>

          <View style={styles.audioBox}>
            <Text style={styles.quoteAnchor}>
              "Respira mi amor. No estás sola/o. Nuestra relación está segura y firme. Esto solo es una tormenta de pensamientos en tu cabeza y va a pasar. Te amo con todo mi corazón."
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                if (isAudioPlaying) {
                  audioEngine.stopAll();
                  setIsAudioPlaying(false);
                } else {
                  playRealityAnchor();
                }
              }}
              style={[styles.audioPlayBtn, isAudioPlaying && styles.audioPlayBtnActive]}
            >
              <Text style={styles.audioPlayBtnText}>
                {isAudioPlaying ? '⏸ Pausar Audio' : '▶ Escuchar mi voz de nuevo'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setCurrentStep(3)}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>Ver Hechos Reales de Nosotros ➔</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FASE 3: EL RINCÓN DE LA CERTEZA */}
      {currentStep === 3 && (
        <View style={styles.phaseCard}>
          <Text style={styles.phaseBadge}>El Rincón de la Certeza</Text>
          <Text style={styles.phaseTitle}>Los Hechos Inamovibles de Nuestro Amor</Text>
          <Text style={styles.phaseSub}>Cuando la ansiedad te mienta, léele estos datos reales:</Text>

          <View style={styles.factCard}>
            <Text style={styles.factIcon}>🗓️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.factTitle}>Llevamos {daysTogether} Días Juntos</Text>
              <Text style={styles.factDesc}>Cada día superado es una prueba de que elegimos estar juntos.</Text>
            </View>
          </View>

          <View style={styles.factCard}>
            <Text style={styles.factIcon}>❤️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.factTitle}>Amor Libre de Dudas</Text>
              <Text style={styles.factDesc}>
                {prefs.senderName} te ama profundamente y no cambiaría por nada lo que ha construido a tu lado.
              </Text>
            </View>
          </View>

          <View style={styles.factCard}>
            <Text style={styles.factIcon}>🏠</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.factTitle}>Eres mi Lugar Seguro</Text>
              <Text style={styles.factDesc}>
                Jamás serás una carga, ni una molestia. Eres mi persona favorita.
              </Text>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.85} onPress={onClose} style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Me siento en paz • Cerrar S.O.S. ❤️</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  badgeSOS: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E11D48',
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '700',
  },
  stepsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stepTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  stepTabActive: {
    backgroundColor: '#E11D48',
  },
  stepTabText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  stepTabTextActive: {
    color: '#FFFFFF',
  },
  phaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  phaseBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    textTransform: 'uppercase',
  },
  phaseTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
    marginBottom: 6,
  },
  phaseSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  groundingBox: {
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  groundingNumber: {
    fontSize: 44,
    fontWeight: '900',
    color: '#0284C7',
  },
  groundingTask: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0369A1',
    textAlign: 'center',
    marginTop: 6,
  },
  groundingExample: {
    fontSize: 12,
    color: '#0284C7',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  audioBox: {
    backgroundColor: '#FFF1F2',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  quoteAnchor: {
    fontSize: 14,
    lineHeight: 22,
    color: '#9F1239',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 14,
  },
  audioPlayBtn: {
    backgroundColor: '#E11D48',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  audioPlayBtnActive: {
    backgroundColor: '#881337',
  },
  audioPlayBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  factCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  factIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  factTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  factDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  actionBtn: {
    backgroundColor: '#E11D48',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  secondaryBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 12,
  },
});
