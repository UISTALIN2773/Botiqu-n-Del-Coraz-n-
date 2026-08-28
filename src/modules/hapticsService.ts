import { Vibration, Platform } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { storageService } from './storageService';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export class HapticsService {
  /**
   * Heartbeat rhythm: "Lub-Dub"
   */
  public static triggerHeartbeat() {
    const strength = storageService.getPreferences().hapticStrength;
    if (strength === 'desactivado') return;

    if (Platform.OS === 'android') {
      let pattern = [0, 60, 100, 110];
      if (strength === 'suave') {
        pattern = [0, 35, 120, 60];
      } else if (strength === 'fuerte') {
        pattern = [0, 90, 80, 160];
      }
      try {
        Vibration.vibrate(pattern, false);
      } catch (e) {
        console.warn('[Haptics] Vibration warning:', e);
      }
    } else {
      try {
        ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
        setTimeout(() => {
          ReactNativeHapticFeedback.trigger('impactRigid', hapticOptions);
        }, 160);
      } catch (e) {
        console.warn('[Haptics] iOS haptic error:', e);
      }
    }
  }

  /**
   * Continuous heartbeat pulsing (repeats 3 times)
   */
  public static triggerTripleHeartbeat() {
    let count = 0;
    const interval = setInterval(() => {
      HapticsService.triggerHeartbeat();
      count++;
      if (count >= 3) {
        clearInterval(interval);
      }
    }, 850);
  }

  /**
   * Gentle breathing pulse (used during 4-4-4 breathing exercises)
   */
  public static triggerBreathingPulse() {
    const strength = storageService.getPreferences().hapticStrength;
    if (strength === 'desactivado') return;

    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate(40);
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
        Vibration.vibrate(25);
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
        Vibration.vibrate([0, 50, 60, 50], false);
      } else {
        ReactNativeHapticFeedback.trigger('notificationSuccess', hapticOptions);
      }
    } catch {}
  }
}
