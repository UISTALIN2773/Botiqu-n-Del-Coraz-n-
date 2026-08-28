export type MoodType = 'ansiedad' | 'te_extrano' | 'mal_dia' | 'reir';

export interface EmotionalItem {
  id: string;
  mood: MoodType;
  title: string;
  subtitle: string;
  note: string;
  photoUri: string;
  voiceFilename: string;
  ambientTrack: 'lofi' | 'rain' | 'piano';
  durationSeconds: number;
}

export const MOOD_DEFINITIONS: Record<
  MoodType,
  { label: string; icon: string; color: string; description: string }
> = {
  ansiedad: {
    label: 'Tengo Ansiedad',
    icon: 'ShieldAlert',
    color: '#38BDF8', // Soft calming cyan
    description: 'Respira hondo conmigo. Todo va a estar bien.',
  },
  te_extrano: {
    label: 'Te Extraño',
    icon: 'HeartHandshake',
    color: '#FB7185', // Rose pink
    description: 'La distancia es solo espacio físico. Siempre estoy contigo.',
  },
  mal_dia: {
    label: 'Tuve un Mal Día',
    icon: 'CloudRain',
    color: '#F59E0B', // Warm amber
    description: 'Déjalo ir por hoy. Hiciste lo mejor que pudiste.',
  },
  reir: {
    label: 'Quiero Reírme',
    icon: 'Sparkles',
    color: '#10B981', // Emerald green
    description: 'Aquí tienes una dosis de nuestras tonterías favoritas.',
  },
};

export const EMOTIONAL_DATABASE: EmotionalItem[] = [
  // --- ANSIEDAD ---
  {
    id: 'ansiedad-1',
    mood: 'ansiedad',
    title: 'Respira conmigo',
    subtitle: 'Tómate 4 segundos para inhalar',
    note: 'Cierra los ojos un momento. Escucha mi voz y el sonido suave de fondo. Nada de lo que estás pensando puede lastimarte ahora mismo. Todo tiene solución y vamos a resolverlo paso a paso.',
    photoUri: 'photo_calm_01',
    voiceFilename: 'voice_ansiedad_01.mp3',
    ambientTrack: 'rain',
    durationSeconds: 45,
  },
  {
    id: 'ansiedad-2',
    mood: 'ansiedad',
    title: 'Pausa de Emergencia',
    subtitle: 'Estás a salvo',
    note: 'Pon tu mano en el pecho y siente tu propio latido. Estás haciendo un trabajo increíble incluso cuando sientes que no. Aquí estoy contigo.',
    photoUri: 'photo_calm_02',
    voiceFilename: 'voice_ansiedad_02.mp3',
    ambientTrack: 'piano',
    durationSeconds: 50,
  },

  // --- TE EXTRAÑO ---
  {
    id: 'te_extrano-1',
    mood: 'te_extrano',
    title: 'Un Abrazo a Distancia',
    subtitle: 'Cuenta regresiva para vernos',
    note: 'Cada segundo que pasa es un segundo menos para volver a abrazarte. Mira esta foto de cuando estuvimos juntos... esa sonrisa es mi lugar favorito en el mundo.',
    photoUri: 'photo_love_01',
    voiceFilename: 'voice_te_extrano_01.mp3',
    ambientTrack: 'lofi',
    durationSeconds: 60,
  },
  {
    id: 'te_extrano-2',
    mood: 'te_extrano',
    title: 'Siempre Contigo',
    subtitle: 'Ni los kilómetros cambian esto',
    note: 'Si pudieras escuchar mis pensamientos ahora mismo, sabrías que no sales de mi mente ni un solo instante. Te mando el abrazo más apretado que puedas imaginar.',
    photoUri: 'photo_love_02',
    voiceFilename: 'voice_te_extrano_02.mp3',
    ambientTrack: 'piano',
    durationSeconds: 55,
  },

  // --- MAL DÍA ---
  {
    id: 'mal_dia-1',
    mood: 'mal_dia',
    title: 'El día ya terminó',
    subtitle: 'Descansa tu mente',
    note: 'Hoy fue pesado, pero fuiste más fuerte que cualquier problema. Suelta los hombros, relaja la mandíbula y deja que el día se vaya. Mañana empezamos de cero.',
    photoUri: 'photo_sunset_01',
    voiceFilename: 'voice_mal_dia_01.mp3',
    ambientTrack: 'lofi',
    durationSeconds: 52,
  },
  {
    id: 'mal_dia-2',
    mood: 'mal_dia',
    title: 'Orgulloso/a de ti',
    subtitle: 'Incluso en los días grises',
    note: 'Los días difíciles son temporales, tu valentía no. Estoy inmensamente orgulloso/a de tu esfuerzo diario.',
    photoUri: 'photo_sunset_02',
    voiceFilename: 'voice_mal_dia_02.mp3',
    ambientTrack: 'rain',
    durationSeconds: 48,
  },

  // --- REÍR ---
  {
    id: 'reir-1',
    mood: 'reir',
    title: 'Recuerdo Chistoso',
    subtitle: '¿Te acuerdas de esto?',
    note: 'No puedo ver esta foto sin reírme a carcajadas. Dale play al audio para revivir la anécdota más random que nos ha pasado.',
    photoUri: 'photo_funny_01',
    voiceFilename: 'voice_reir_01.mp3',
    ambientTrack: 'lofi',
    durationSeconds: 40,
  },
  {
    id: 'reir-2',
    mood: 'reir',
    title: 'Dosis de Sonrisas',
    subtitle: 'Prohibido estar serio/a',
    note: 'Si no te ríes con este audio, te debo una hamburguesa completa con papas. ¡Escúchalo ya!',
    photoUri: 'photo_funny_02',
    voiceFilename: 'voice_reir_02.mp3',
    ambientTrack: 'lofi',
    durationSeconds: 38,
  },
];
