import { Platform, NativeModules } from 'react-native';
import { getTodayPhrase } from '../config/phrases';
import { MoodType } from '../config/database';
import { storageService } from './storageService';

export class WidgetBridge {
  /**
   * Updates Android Home Widget with the daily quote, partner name, and days together
   */
  public static async updateWidgetData(lastMood?: MoodType) {
    if (Platform.OS !== 'android') return;

    try {
      const today = getTodayPhrase();
      const prefs = storageService.getPreferences();
      const daysTogether = storageService.getDaysTogether();

      const payload = {
        phrase: today.phrase,
        author: `${prefs.partnerName} • Día ${daysTogether}`,
        lastMood: lastMood || 'ansiedad',
        updatedAt: new Date().toISOString(),
      };

      if (NativeModules.HeartWidgetModule) {
        await NativeModules.HeartWidgetModule.updateWidgetData(
          payload.phrase,
          payload.author,
          payload.lastMood
        );
      }
      console.log('[WidgetBridge] Widget data synchronized:', payload);
    } catch (err) {
      console.warn('[WidgetBridge] Widget sync notice:', err);
    }
  }
}
