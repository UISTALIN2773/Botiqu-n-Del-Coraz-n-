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
  BackHandler,
  NativeModules,
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
  const [isFromWidget, setIsFromWidget] = useState<boolean>(false);
  const [autoplayAudio, setAutoplayAudio] = useState<boolean>(false);
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
    // 1. Initialize data from permanent storage on disk
    storageService.initFromDisk().then(() => {
      WidgetBridge.updateWidgetData(popupMood);
      const prefs = storageService.getPreferences();
      if (prefs.isPinEnabled && prefs.pinCode) {
        setIsLocked(true);
      }
    });

    // 2. Android Widget Deep Link Handler
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      if (url && url.includes('botiquin://open')) {
        // Direct S.O.S. Button pressed from Widget
        if (url.includes('view=sos')) {
          HapticsService.triggerHeartbeat();
          setIsSOSVisible(true);
          if (url.includes('autoplay=true')) {
            audioEngine.playDualTrack('voice_ansiedad_01.wav', 'rain');
          }
          return;
        }

        const moodMatch = url.match(/mood=([a-zA-Z_]+)/);
        const mood = (moodMatch ? moodMatch[1] : 'ansiedad') as MoodType;
        const auto = url.includes('autoplay=true');

        setPopupMood(mood);
        setAutoplayAudio(auto);
        setIsFromWidget(true);
        setIsQuickPopupVisible(true);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => {
      subscription.remove();
      audioEngine.stopAll();
      HapticsService.stopPresence();
    };
  }, []);

  const handleSelectMoodFromHome = (mood: MoodType) => {
    setPopupMood(mood);
    setIsFromWidget(false);
    setAutoplayAudio(false);
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

  const handleClosePopup = () => {
    setIsQuickPopupVisible(false);
    if (isFromWidget) {
      if (NativeModules.LocalStorageModule) {
        NativeModules.LocalStorageModule.closePopupToHome();
      } else {
        BackHandler.exitApp();
      }
    }
  };

  const prefs = storageService.getPreferences();
  const isOLED = prefs.themeName === 'oled_black';
  const bgColor = isOLED ? '#000000' : '#FAF5EE';

  // If opened directly from widget, render ONLY the floating popup modal on top of a transparent background
  if (isFromWidget && isQuickPopupVisible) {
    return (
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <QuickPopupModal
          visible={isQuickPopupVisible}
          initialMood={popupMood}
          autoplay={autoplayAudio}
          isFromWidget={true}
          onClose={handleClosePopup}
          onOpenFullApp={() => setIsFromWidget(false)}
        />
      </View>
    );
  }

  // If locked by PIN
  if (isLocked) {
    return (
      <SafeAreaView style={[styles.lockedContainer, { backgroundColor: bgColor }]}>
        <StatusBar barStyle={isOLED ? 'light-content' : 'dark-content'} backgroundColor={bgColor} />
        <Text style={styles.lockedHeartIcon}>🔒</Text>
        <Text style={styles.lockedHeading}>Baúl Protegido</Text>
        <Text style={styles.lockedSub}>
          Ingresa el código PIN para acceder a tus cartas y recuerdos privados.
        </Text>

        <TextInput
          value={enteredPin}
          onChangeText={setEnteredPin}
          keyboardType="numeric"
          maxLength={4}
          secureTextEntry
          style={styles.pinInput}
          placeholder="••••"
          placeholderTextColor="#A1826E"
          autoFocus
        />

        {pinError ? <Text style={styles.pinErrorText}>{pinError}</Text> : null}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleUnlockPin}
          style={styles.unlockBtn}
        >
          <Text style={styles.unlockBtnText}>Desbloquear</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setPopupMood('ansiedad');
            setIsFromWidget(false);
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
    <SafeAreaView style={[styles.root, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isOLED ? 'light-content' : 'dark-content'} backgroundColor={bgColor} />

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
        accentColor="#E11D48"
      />

      {/* Floating Quick Popup Modal */}
      <QuickPopupModal
        visible={isQuickPopupVisible}
        initialMood={popupMood}
        autoplay={autoplayAudio}
        isFromWidget={isFromWidget}
        onClose={handleClosePopup}
        onOpenFullApp={() => setIsFromWidget(false)}
      />

      {/* Modal 1: Panic SOS Grounding */}
      <Modal visible={isSOSVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
          <PanicSOSScreen onClose={() => setIsSOSVisible(false)} />
        </SafeAreaView>
      </Modal>

      {/* Modal 2: Doubt Wall */}
      <Modal visible={isDoubtWallVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
          <DoubtWallScreen onClose={() => setIsDoubtWallVisible(false)} />
        </SafeAreaView>
      </Modal>

      {/* Modal 3: Time Capsules */}
      <Modal visible={isTimeCapsulesVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
          <TimeCapsulesScreen onClose={() => setIsTimeCapsulesVisible(false)} />
        </SafeAreaView>
      </Modal>

      {/* Modal 4: Future Tree */}
      <Modal visible={isFutureTreeVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
          <FutureTreeScreen onClose={() => setIsFutureTreeVisible(false)} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF5EE',
  },
  content: {
    flex: 1,
  },
  lockedContainer: {
    flex: 1,
    backgroundColor: '#FAF5EE',
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
    color: '#2B1810',
  },
  lockedSub: {
    fontSize: 13,
    color: '#8C6F58',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  pinInput: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EBDCCE',
    borderRadius: 16,
    fontSize: 28,
    textAlign: 'center',
    letterSpacing: 10,
    paddingVertical: 10,
    color: '#2B1810',
    fontWeight: '900',
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
    backgroundColor: '#E11D48',
  },
  unlockBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
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
