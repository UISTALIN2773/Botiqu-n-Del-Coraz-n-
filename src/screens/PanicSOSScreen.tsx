import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { storageService } from '../modules/storageService';
import { audioEngine } from '../modules/audioEngine';
import { HapticsService } from '../modules/hapticsService';

interface PanicSOSScreenProps {
  onClose: () => void;
}

export const PanicSOSScreen: React.FC<PanicSOSScreenProps> = ({ onClose }) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  const prefs = storageService.getPreferences();
  const daysTogether = storageService.getDaysTogether();

  const groundingSteps = [
    { icon: '👁️', title: '5 cosas que ves', desc: 'Mira a tu alrededor: la pantalla, tus manos, la luz del techo, una ventana o un objeto cercano. Nómbralos en silencio.' },
    { icon: '✋', title: '4 cosas que tocas', desc: 'Siente la textura de tu ropa, la firmeza de la superficie donde estás, la temperatura de tus dedos o tu cabello.' },
    { icon: '👂', title: '3 cosas que escuchas', desc: 'Escucha con atención: el zumbido del aire, los latidos en tu pecho o el silencio de la habitación.' },
    { icon: '👃', title: '2 cosas que hueles', desc: 'Inhala hondo: el aroma de tu perfume, la almohada o el aire fresco que entra.' },
    { icon: '👅', title: '1 cosa que agradeces', desc: `Agradece que tienes a ${prefs.senderName} amándote incondicionalmente todos los días.` },
  ];

  const handleToggleStep = (index: number) => {
    HapticsService.triggerSoftFeedback();
    setExpandedStep(expandedStep === index ? null : index);
  };

  const handlePlayAnchorAudio = async () => {
    if (isAudioPlaying) {
      audioEngine.stopAll();
      setIsAudioPlaying(false);
    } else {
      setIsAudioPlaying(true);
      HapticsService.triggerHeartbeat();
      await audioEngine.playDualTrack('voice_ansiedad_01.wav', 'rain', undefined, () => {
        setIsAudioPlaying(false);
      });
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* Barra de Navegación Superior: Flecha (←), título centrado "Panic SOS Screen", menú (⋮) */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={onClose} style={styles.navBtn}>
          <Text style={styles.navArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Panic SOS Screen</Text>
        <TouchableOpacity style={styles.navBtn}>
          <Text style={styles.navMenu}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Banner de Instrucción Superior con icono (!) */}
      <View style={styles.instructionBanner}>
        <View style={styles.alertBadge}>
          <Text style={styles.alertIcon}>!</Text>
        </View>
        <View style={styles.instructionTextCol}>
          <Text style={styles.instructionTitle}>Protocolo de Desconexión del Sobrepensamiento</Text>
          <Text style={styles.instructionDesc}>
            Tu mente está acelerada por escenarios que no están ocurriendo. Sigue estos 5 pasos para aterrizar en la realidad.
          </Text>
        </View>
      </View>

      {/* Lista Guiada del Método 5-4-3-2-1 */}
      <View style={styles.methodSection}>
        {groundingSteps.map((step, idx) => {
          const isExpanded = expandedStep === idx;
          return (
            <View key={idx} style={styles.pillContainer}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleToggleStep(idx)}
                style={[styles.pillHeader, isExpanded && styles.pillHeaderActive]}
              >
                <Text style={styles.pillIcon}>{step.icon}</Text>
                <Text style={styles.pillTitle}>{step.title}</Text>
                <Text style={styles.pillToggle}>{isExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.pillBody}>
                  <Text style={styles.pillBodyText}>{step.desc}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Cuadrícula de Contención Inferior (2 Columnas) */}
      <View style={styles.twoColumnGrid}>
        {/* Tarjeta Izquierda (Color Crema Cálido #F5EBE1) */}
        <View style={styles.leftCardCream}>
          <Text style={styles.creamTag}>CERTEZA INAMOVIBLE</Text>
          <Text style={styles.creamHeading}>
            {daysTogether} Días Juntos
          </Text>
          <Text style={styles.creamText}>
            "Nuestra relación está firme. No estás sola/o. Esto que sientes es una emoción pasajera, no un hecho real."
          </Text>
        </View>

        {/* Tarjeta Derecha (Café Profundo #2B1810) */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePlayAnchorAudio}
          style={styles.rightCardCoffee}
        >
          <View style={styles.micCircle}>
            <Text style={styles.micIcon}>{isAudioPlaying ? '⏸' : '🎙️'}</Text>
          </View>
          <Text style={styles.coffeeTitle}>
            {isAudioPlaying ? 'Pausar Audio' : 'Voz de Calma'}
          </Text>
          <Text style={styles.coffeeSub}>
            Toca para escuchar mi voz de reaseguramiento
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#F8FAFC',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  instructionBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF1F2',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  alertBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  alertIcon: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  instructionTextCol: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9F1239',
  },
  instructionDesc: {
    fontSize: 11,
    color: '#BE123C',
    marginTop: 2,
    lineHeight: 16,
  },
  methodSection: {
    marginBottom: 16,
  },
  pillContainer: {
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    elevation: 1,
  },
  pillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pillHeaderActive: {
    backgroundColor: '#FAF3ED',
  },
  pillIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  pillTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#2B1810',
  },
  pillToggle: {
    fontSize: 10,
    color: '#8C6F58',
  },
  pillBody: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    backgroundColor: '#FAF3ED',
  },
  pillBodyText: {
    fontSize: 12,
    color: '#5C3E2E',
    lineHeight: 18,
  },
  twoColumnGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  leftCardCream: {
    width: '48%',
    backgroundColor: '#F5EBE1',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EBDCCE',
  },
  creamTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#8C6F58',
    letterSpacing: 0.5,
  },
  creamHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2B1810',
    marginTop: 4,
    marginBottom: 6,
  },
  creamText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#42281D',
    fontStyle: 'italic',
  },
  rightCardCoffee: {
    width: '48%',
    backgroundColor: '#2B1810',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  micIcon: {
    fontSize: 20,
  },
  coffeeTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  coffeeSub: {
    fontSize: 10,
    color: '#E6D5C3',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
});
