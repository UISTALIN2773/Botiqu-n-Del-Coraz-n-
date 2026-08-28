import { Vibration, Platform } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { storageService } from './storageService';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export class HapticsService {
  private static presenceTimer: NodeJS.Timeout | null = null;
  private static presenceSafetyTimeout: NodeJS.Timeout | null = null;

  /**
   * Heartbeat rhythm: "Lub-Dub"
   */
  public static triggerHeartbeat() {
    const strength = storageService.getPreferences().hapticStrength;
    if (strength === 'desactivado') return;

    if (Platform.OS === 'android') {
      let pattern = [0, 45, 80, 85];
      if (strength === 'suave') {
        pattern = [0, 25, 90, 40];
      } else if (strength === 'fuerte') {
        pattern = [0, 70, 70, 120];
      }
      try {
        Vibration.vibrate(pattern, false);
      } catch (e) {
        console.warn('[Haptics] Vibration notice:', e);
      }
    } else {
      try {
        ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
        setTimeout(() => {
          ReactNativeHapticFeedback.trigger('impactRigid', hapticOptions);
        }, 150);
      } catch {}
    }
  }

  /**
   * Safe Presence Simulator ("Dormir en mi Pecho")
   * Uses ultra-light micro-pulses (20ms) to protect battery and hardware.
   * Auto-stops vibration after 15 minutes of inactivity for thermal safety.
   */
  public static startSafePresence(onSafetyAutoStop?: () => void) {
    HapticsService.stopPresence();

    const strength = storageService.getPreferences().hapticStrength;
    if (strength === 'desactivado') return;

    // Pulse every 950ms
    HapticsService.presenceTimer = setInterval(() => {
      try {
        if (Platform.OS === 'android') {
          // Minimal pulse to avoid coil heat
          Vibration.vibrate(22);
        } else {
          ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
        }
      } catch {}
    }, 950);

    // 15-Minute Thermal & Battery Safety Cutoff
    HapticsService.presenceSafetyTimeout = setTimeout(() => {
      HapticsService.stopPresence();
      onSafetyAutoStop?.();
      console.log('[Haptics] Presence vibration paused automatically for thermal protection.');
    }, 15 * 60 * 1000);
  }

  public static stopPresence() {
    if (HapticsService.presenceTimer) {
      clearInterval(HapticsService.presenceTimer);
      HapticsService.presenceTimer = null;
    }
    if (HapticsService.presenceSafetyTimeout) {
      clearTimeout(HapticsService.presenceSafetyTimeout);
      HapticsService.presenceSafetyTimeout = null;
    }
  }

  /**
   * Gentle breathing pulse (used during 4-4-4 breathing exercises)
   */
  public static triggerBreathingPulse() {
    const strength = storageService.getPreferences().hapticStrength;
    if (strength === 'desactivado') return;

    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate(30);
      } else {
        ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
      }
    } catch {}
  }

  public static triggerSoftFeedback() {
    const strength = storageService.getPreferences().hapticStrength;
    if (strength === 'desactivado') return;

    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate(20);
      } else {
        ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
      }
    } catch {}
  }

  public static triggerSuccessFeedback() {
    const strength = storageService.getPreferences().hapticStrength;
    if (strength === 'desactivado') return;

    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 35, 45, 35], false);
      } else {
        ReactNativeHapticFeedback.trigger('notificationSuccess', hapticOptions);
      }
    } catch {}
  }
}
