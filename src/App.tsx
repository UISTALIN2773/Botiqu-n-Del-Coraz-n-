import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { EmotionalModalScreen } from './screens/EmotionalModalScreen';
import { MoodType } from './config/database';
import { WidgetBridge } from './modules/widgetBridge';

export default function App() {
  const [activeMood, setActiveMood] = useState<MoodType>('ansiedad');

  useEffect(() => {
    // Initial sync of widget phrases and state
    WidgetBridge.updateWidgetData(activeMood);

    // Deep Linking Handler (from Android Home Widget PendingIntent)
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      if (url && url.includes('mood=')) {
        const moodParam = url.split('mood=')[1]?.split('&')[0] as MoodType;
        if (['ansiedad', 'te_extrano', 'mal_dia', 'reir'].includes(moodParam)) {
          setActiveMood(moodParam);
        }
      }
    };

    // Check if app was launched via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => {
      subscription.remove();
    };
  }, []);

  return <EmotionalModalScreen initialMood={activeMood} />;
}
