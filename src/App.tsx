import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Linking,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { MoodType, EmotionalItem } from './config/database';
import { storageService } from './modules/storageService';
import { WidgetBridge } from './modules/widgetBridge';
import { audioEngine } from './modules/audioEngine';
import { HapticsService } from './modules/hapticsService';
import { BottomTabBar, TabType } from './components/BottomTabBar';
import { QuickPopupModal } from './components/QuickPopupModal';
import { HomeScreen } from './screens/HomeScreen';
import { MemoriesScreen } from './screens/MemoriesScreen';
import { CalmZoneScreen } from './screens/CalmZoneScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { PanicSOSScreen } from './screens/PanicSOSScreen';
import { DoubtWallScreen } from './screens/DoubtWallScreen';
import { TimeCapsulesScreen } from './screens/TimeCapsulesScreen';
import { FutureTreeScreen } from './screens/FutureTreeScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isQuickPopupVisible, setIsQuickPopupVisible] = useState<boolean>(false);
  const [popupMood, setPopupMood] = useState<MoodType>('ansiedad');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Sub-screens modals
  const [isSOSVisible, setIsSOSVisible] = useState<boolean>(false);
  const [isDoubtWallVisible, setIsDoubtWallVisible] = useState<boolean>(false);
  const [isTimeCapsulesVisible, setIsTimeCapsulesVisible] = useState<boolean>(false);
  const [isFutureTreeVisible, setIsFutureTreeVisible] = useState<boolean>(false);

  useEffect(() => {
    WidgetBridge.updateWidgetData(popupMood);

    const prefs = storageService.getPreferences();
    if (prefs.isPinEnabled && prefs.pinCode) {
      setIsLocked(true);
    }

    // Android Widget Deep Link Handler
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      if (url && url.includes('botiquin://open')) {
        const moodMatch = url.match(/mood=([a-zA-Z_]+)/);
        const mood = (moodMatch ? moodMatch[1] : 'ansiedad') as MoodType;
        setPopupMood(mood);
        setIsQuickPopupVisible(true);

        if (url.includes('autoplay=true')) {
          const memories = storageService.getMemoriesByMood(mood);
          const first = memories[0];
          if (first) {
            audioEngine.playDualTrack(first.voiceFilename, first.ambientTrack);
          }
        }
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => {
      subscription.remove();
      audioEngine.stopAll();
    };
  }, []);

  const handleSelectMoodFromHome = (mood: MoodType) => {
    setPopupMood(mood);
    setIsQuickPopupVisible(true);
  };

  const handlePlayMemoryDirect = (item: EmotionalItem) => {
    audioEngine.playDualTrack(item.voiceFilename, item.ambientTrack);
  };

  const handleUnlockPin = () => {
    const prefs = storageService.getPreferences();
    if (enteredPin === prefs.pinCode) {
      setIsLocked(false);
      setPinError('');
      HapticsService.triggerSuccessFeedback();
    } else {
      setPinError('Código PIN incorrecto');
      HapticsService.triggerHeartbeat();
    }
  };

  const prefs = storageService.getPreferences();

  // If locked by PIN
  if (isLocked) {
    return (
      <SafeAreaView style={styles.lockedContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Text style={styles.lockedHeartIcon}>🔒</Text>
        <Text style={styles.lockedHeading}>Baúl Protegido</Text>
        <Text style={styles.lockedSub}>
          Ingresa el código PIN para acceder a tus recuerdos privados.
        </Text>

        <TextInput
          value={enteredPin}
          onChangeText={setEnteredPin}
          keyboardType="numeric"
          maxLength={4}
          secureTextEntry
          style={styles.pinInput}
          placeholder="••••"
          placeholderTextColor="#94A3B8"
          autoFocus
        />

        {pinError ? <Text style={styles.pinErrorText}>{pinError}</Text> : null}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleUnlockPin}
          style={[styles.unlockBtn, { backgroundColor: prefs.widgetColor || '#E11D48' }]}
        >
          <Text style={styles.unlockBtnText}>Desbloquear</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setPopupMood('ansiedad');
            setIsQuickPopupVisible(true);
          }}
          style={styles.emergencyQuickBtn}
        >
          <Text style={styles.emergencyQuickText}>❤️ Abrir Botiquín de Emergencia</Text>
        </TouchableOpacity>

        <QuickPopupModal
          visible={isQuickPopupVisible}
          initialMood={popupMood}
          onClose={() => setIsQuickPopupVisible(false)}
          onOpenFullApp={() => setIsQuickPopupVisible(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen View Switcher */}
      <View style={styles.content}>
        {activeTab === 'home' && (
          <HomeScreen
            onSelectMood={handleSelectMoodFromHome}
            onOpenSOS={() => setIsSOSVisible(true)}
            onOpenDoubtWall={() => setIsDoubtWallVisible(true)}
            onOpenTimeCapsules={() => setIsTimeCapsulesVisible(true)}
            onOpenFutureTree={() => setIsFutureTreeVisible(true)}
          />
        )}
        {activeTab === 'memories' && (
          <MemoriesScreen onPlayMemory={handlePlayMemoryDirect} />
        )}
        {activeTab === 'calm' && <CalmZoneScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </View>

      {/* Persistent Bottom Tab Bar */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentColor={prefs.widgetColor || '#E11D48'}
      />

      {/* Floating Quick Popup Modal */}
      <QuickPopupModal
        visible={isQuickPopupVisible}
        initialMood={popupMood}
        onClose={() => setIsQuickPopupVisible(false)}
        onOpenFullApp={() => setIsQuickPopupVisible(false)}
      />

      {/* Modal 1: Panic SOS Grounding */}
      <Modal visible={isSOSVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
          <PanicSOSScreen onClose={() => setIsSOSVisible(false)} />
        </SafeAreaView>
      </Modal>

      {/* Modal 2: Doubt Wall */}
      <Modal visible={isDoubtWallVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
          <View style={styles.modalHeaderClose}>
            <TouchableOpacity onPress={() => setIsDoubtWallVisible(false)} style={styles.closeBackBtn}>
              <Text style={styles.closeBackText}>← Volver</Text>
            </TouchableOpacity>
          </View>
          <DoubtWallScreen />
        </SafeAreaView>
      </Modal>

      {/* Modal 3: Time Capsules */}
      <Modal visible={isTimeCapsulesVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
          <View style={styles.modalHeaderClose}>
            <TouchableOpacity onPress={() => setIsTimeCapsulesVisible(false)} style={styles.closeBackBtn}>
              <Text style={styles.closeBackText}>← Volver</Text>
            </TouchableOpacity>
          </View>
          <TimeCapsulesScreen />
        </SafeAreaView>
      </Modal>

      {/* Modal 4: Future Tree */}
      <Modal visible={isFutureTreeVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
          <View style={styles.modalHeaderClose}>
            <TouchableOpacity onPress={() => setIsFutureTreeVisible(false)} style={styles.closeBackBtn}>
              <Text style={styles.closeBackText}>← Volver</Text>
            </TouchableOpacity>
          </View>
          <FutureTreeScreen />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  modalHeaderClose: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeBackBtn: {
    padding: 4,
  },
  closeBackText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  lockedContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  lockedHeartIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  lockedHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  lockedSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  pinInput: {
    width: 160,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    fontSize: 28,
    textAlign: 'center',
    letterSpacing: 10,
    paddingVertical: 10,
    color: '#0F172A',
    fontWeight: '800',
  },
  pinErrorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  unlockBtn: {
    width: 160,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  unlockBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  emergencyQuickBtn: {
    marginTop: 30,
    padding: 10,
  },
  emergencyQuickText: {
    fontSize: 13,
    color: '#E11D48',
    fontWeight: '700',
  },
});
