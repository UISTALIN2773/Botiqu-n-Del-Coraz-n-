import { Vibration, Platform } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export class HapticsService {
  /**
   * Heartbeat rhythm: "Lub-Dub"
   * Timings in milliseconds: [delay, pulse1, pause, pulse2]
   */
  public static triggerHeartbeat() {
    if (Platform.OS === 'android') {
      // Pattern: Wait 0ms, Vibrate 70ms (lub), Wait 100ms, Vibrate 120ms (dub)
      const heartbeatPattern = [0, 70, 100, 130];
      Vibration.vibrate(heartbeatPattern, false);
    } else {
      ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
      setTimeout(() => {
        ReactNativeHapticFeedback.trigger('impactRigid', hapticOptions);
      }, 180);
    }
  }

  /**
   * Continuous heartbeat pulsing (repeats 3 times for warm greeting)
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
   * Subtle click feedback when tapping a mood button
   */
  public static triggerSoftFeedback() {
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
  }

  /**
   * Gentle success buzz
   */
  public static triggerSuccessFeedback() {
    ReactNativeHapticFeedback.trigger('notificationSuccess', hapticOptions);
  }
}
