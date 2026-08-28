import { Platform, NativeModules } from 'react-native';
import { getTodayPhrase } from '../config/phrases';
import { MoodType } from '../config/database';

export class WidgetBridge {
  /**
   * Updates Android Home Widget with the daily quote and last selected mood
   */
  public static async updateWidgetData(lastMood?: MoodType) {
    if (Platform.OS !== 'android') return;

    try {
      const today = getTodayPhrase();
      const payload = {
        phrase: today.phrase,
        author: today.author,
        lastMood: lastMood || 'ansiedad',
        updatedAt: new Date().toISOString(),
      };

      // If native module or Shared Preferences bridge is present
      if (NativeModules.HeartWidgetModule) {
        await NativeModules.HeartWidgetModule.updateWidgetData(
          payload.phrase,
          payload.author,
          payload.lastMood
        );
      }
      console.log('[WidgetBridge] Widget data synchronized successfully:', payload);
    } catch (err) {
      console.warn('[WidgetBridge] Failed to synchronize widget:', err);
    }
  }
}
