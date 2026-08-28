export type MoodType = 'ansiedad' | 'te_extrano' | 'mal_dia' | 'reir' | 'sorprendeme';
export type MemoryType = 'audio' | 'foto' | 'carta' | 'mixto';

export interface EmotionalItem {
  id: string;
  mood: MoodType;
  type: MemoryType;
  title: string;
  subtitle: string;
  note: string;
  date?: string;
  photoUri?: string;
  voiceFilename?: string;
  ambientTrack: 'lofi' | 'rain' | 'piano' | 'waves';
  durationSeconds: number;
  isFavorite?: boolean;
  tag: string;
}

export interface UserPreferences {
  partnerName: string;
  senderName: string;
  anniversaryDate: string; // YYYY-MM-DD
  widgetColor: string; // Hex
  widgetStyle: 'corazon_glow' | 'pixel' | 'minimal';
  hapticStrength: 'suave' | 'normal' | 'fuerte' | 'desactivado';
  pinCode: string; // empty if no pin
  isPinEnabled: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  partnerName: 'Mi Amor',
  senderName: 'Tu Persona Favorita',
  anniversaryDate: '2023-01-01',
  widgetColor: '#E11D48',
  widgetStyle: 'corazon_glow',
  hapticStrength: 'normal',
  pinCode: '',
  isPinEnabled: false,
};

export const MOOD_DEFINITIONS: Record<
  MoodType,
  { label: string; icon: string; color: string; description: string; reassuranceQuote: string }
> = {
  ansiedad: {
    label: 'Tengo Ansiedad / Estrés',
    icon: 'ShieldAlert',
    color: '#0EA5E9', // Calm Ocean Cyan
    description: 'Respira hondo conmigo. Estoy aquí contigo, estás a salvo.',
    reassuranceQuote: 'Pon tu mano en el pecho. Siente tu respiración. Este momento difícil es solo una nube pasajera.',
  },
  te_extrano: {
    label: 'Te Extraño Mucho',
    icon: 'HeartHandshake',
    color: '#F43F5E', // Warm Rose
    description: 'La distancia física no cambia ni un milímetro lo que siento por ti.',
    reassuranceQuote: 'Cierra los ojos e imagíname abrazándote fuerte. Cada minuto lejos es un minuto menos para vernos.',
  },
  mal_dia: {
    label: 'Tuve un Mal Día',
    icon: 'CloudRain',
    color: '#F59E0B', // Golden Sun
    description: 'Suelta todo lo pesado. Hiciste tu mejor esfuerzo y estoy orgulloso/a de ti.',
    reassuranceQuote: 'El día ya terminó. Deja que la noche limpie tu mente. Mañana es un nuevo comienzo.',
  },
  reir: {
    label: 'Quiero Reírme',
    icon: 'Sparkles',
    color: '#10B981', // Emerald
    description: 'Una dosis de nuestras tonterías y momentos más felices.',
    reassuranceQuote: 'Tu sonrisa es la cosa más hermosa de este mundo, ¡no permitas que nada te la quite!',
  },
  sorprendeme: {
    label: 'Sorpréndeme ✨',
    icon: 'Gift',
    color: '#8B5CF6', // Purple Magic
    description: 'Un mensaje sorpresa sacado directamente del fondo de mi corazón.',
    reassuranceQuote: 'Un recordatorio espontáneo: Eres lo mejor que me ha pasado en la vida.',
  },
};

export const INITIAL_MEMORIES: EmotionalItem[] = [
  {
    id: 'mem-1',
    mood: 'ansiedad',
    type: 'mixto',
    title: 'Pausa y Respira Conmigo',
    subtitle: 'Tómate 4 segundos',
    note: 'Inhala profundamente... mantén el aire... y suéltalo despacio. No tienes que solucionar todo el mundo hoy. Solo concéntrate en este segundo. Te amo y todo va a salir bien.',
    date: 'Para cuando te sientas abrumada/o',
    photoUri: '',
    voiceFilename: 'voice_ansiedad_01.wav',
    ambientTrack: 'rain',
    durationSeconds: 45,
    isFavorite: true,
    tag: 'Calma',
  },
  {
    id: 'mem-2',
    mood: 'te_extrano',
    type: 'mixto',
    title: 'Un Abrazo que Cruza Kilómetros',
    subtitle: 'Siempre cerquita de ti',
    note: 'Aunque no pueda darte un abrazo de verdad en este instante, quiero que sepas que eres lo primero en lo que pienso al despertar y lo último antes de dormir.',
    date: 'Recuerdo especial',
    photoUri: '',
    voiceFilename: 'voice_te_extrano_01.wav',
    ambientTrack: 'lofi',
    durationSeconds: 58,
    isFavorite: true,
    tag: 'Amor',
  },
  {
    id: 'mem-3',
    mood: 'mal_dia',
    type: 'mixto',
    title: 'Orgulloso/a de tu valentía',
    subtitle: 'Hiciste un gran trabajo hoy',
    note: 'Sé que hoy las cosas no salieron como esperabas, pero no olvides lo fuerte que eres. Tómate una ducha caliente, recuéstate y déjame cuidarte con este audio.',
    date: 'Refugio emocional',
    photoUri: '',
    voiceFilename: 'voice_mal_dia_01.wav',
    ambientTrack: 'piano',
    durationSeconds: 52,
    isFavorite: false,
    tag: 'Ánimo',
  },
  {
    id: 'mem-4',
    mood: 'reir',
    type: 'audio',
    title: '¿Te acuerdas de nuestras risas?',
    subtitle: 'Prohibido no sonreír',
    note: 'Cada vez que me acuerdo de lo que pasó ese día me da un ataque de risa. Dale play para revivir el momento.',
    date: 'Momentos graciosos',
    photoUri: '',
    voiceFilename: 'voice_reir_01.wav',
    ambientTrack: 'lofi',
    durationSeconds: 42,
    isFavorite: false,
    tag: 'Risas',
  },
  {
    id: 'mem-5',
    mood: 'ansiedad',
    type: 'carta',
    title: 'Carta: Razones por las que estás a salvo',
    subtitle: 'Léela cuando sientas dudas o miedo',
    note: '1. Este momento difícil es temporal.\n2. Tienes una fuerza increíble dentro de ti.\n3. Siempre cuentas conmigo sin importar qué pase.\n4. Eres una persona amada, valorada e importante.\n5. Respira, descansa tu mente.',
    date: 'Carta abierta',
    photoUri: '',
    voiceFilename: 'voice_ansiedad_02.wav',
    ambientTrack: 'piano',
    durationSeconds: 30,
    isFavorite: true,
    tag: 'Cartas',
  },
];
