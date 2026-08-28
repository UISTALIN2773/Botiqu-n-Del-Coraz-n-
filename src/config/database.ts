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

export interface DoubtItem {
  id: string;
  trigger: string;
  answerTitle: string;
  explanation: string;
  voiceFilename?: string;
  affirmation: string;
}

export interface TimeCapsuleItem {
  id: string;
  title: string;
  description: string;
  sealIcon: string;
  unlockDate?: string;
  unlockCondition?: string;
  content: string;
  voiceFilename?: string;
  isOpened: boolean;
}

export interface FutureGoalItem {
  id: string;
  title: string;
  category: 'viaje' | 'cita' | 'hogar' | 'experiencia';
  isCompleted: boolean;
  completedDate?: string;
}

export interface UserPreferences {
  partnerName: string;
  senderName: string;
  anniversaryDate: string; // YYYY-MM-DD
  nextDateMeet: string; // YYYY-MM-DD
  widgetColor: string; // Hex
  themeName: 'minimal_clean' | 'rose_gold' | 'midnight_star' | 'cozy_warmth';
  widgetStyle: 'corazon_glow' | 'pixel' | 'minimal';
  hapticStrength: 'suave' | 'normal' | 'fuerte' | 'desactivado';
  pinCode: string;
  isPinEnabled: boolean;
  sleepTimerMinutes: number;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  partnerName: 'Mi Amor',
  senderName: 'Tu Persona Favorita',
  anniversaryDate: '2023-01-01',
  nextDateMeet: '2026-09-15',
  widgetColor: '#E11D48',
  themeName: 'minimal_clean',
  widgetStyle: 'corazon_glow',
  hapticStrength: 'normal',
  pinCode: '',
  isPinEnabled: false,
  sleepTimerMinutes: 30,
};

export const MOOD_DEFINITIONS: Record<
  MoodType,
  { label: string; icon: string; color: string; description: string; reassuranceQuote: string }
> = {
  ansiedad: {
    label: 'Tengo Ansiedad / Estrés',
    icon: 'ShieldAlert',
    color: '#0EA5E9',
    description: 'Respira hondo conmigo. Estoy aquí contigo, estás a salvo.',
    reassuranceQuote: 'Pon tu mano en el pecho. Siente tu respiración. Este momento difícil es solo una nube pasajera.',
  },
  te_extrano: {
    label: 'Te Extraño Mucho',
    icon: 'HeartHandshake',
    color: '#F43F5E',
    description: 'La distancia física no cambia ni un milímetro lo que siento por ti.',
    reassuranceQuote: 'Cierra los ojos e imagíname abrazándote fuerte. Cada minuto lejos es un minuto menos para vernos.',
  },
  mal_dia: {
    label: 'Tuve un Mal Día',
    icon: 'CloudRain',
    color: '#F59E0B',
    description: 'Suelta todo lo pesado. Hiciste tu mejor esfuerzo y estoy orgulloso/a de ti.',
    reassuranceQuote: 'El día ya terminó. Deja que la noche limpie tu mente. Mañana es un nuevo comienzo.',
  },
  reir: {
    label: 'Quiero Reírme',
    icon: 'Sparkles',
    color: '#10B981',
    description: 'Una dosis de nuestras tonterías y momentos más felices.',
    reassuranceQuote: 'Tu sonrisa es la cosa más hermosa de este mundo, ¡no permitas que nada te la quite!',
  },
  sorprendeme: {
    label: 'Sorpréndeme ✨',
    icon: 'Gift',
    color: '#8B5CF6',
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
];

export const DOUBT_ITEMS: DoubtItem[] = [
  {
    id: 'doubt-1',
    trigger: 'Cuando pienses que ya no te quiero o que me cansé',
    answerTitle: 'Mi amor por ti es incondicional',
    explanation: 'Mi amor por ti no depende de un día difícil ni de la rutina. Si estoy cansado/a o callado/a, es por el estrés del día, jamás por ti. Eres mi hogar.',
    affirmation: 'Te elijo hoy, mañana y todos los días de mi vida.',
    voiceFilename: 'voice_te_extrano_01.wav',
  },
  {
    id: 'doubt-2',
    trigger: 'Cuando sientas que eres una molestia o carga',
    answerTitle: 'Jamás eres una molestia para mí',
    explanation: 'Nunca me pesará escucharte, abrazarte o estar para ti. Si algo te duele o te preocupa, yo quiero saberlo. No tienes que fingir estar bien conmigo.',
    affirmation: 'Tus emociones importan y tu voz siempre es bienvenida.',
    voiceFilename: 'voice_ansiedad_01.wav',
  },
  {
    id: 'doubt-3',
    trigger: 'Cuando tarde en contestar tus mensajes',
    answerTitle: 'Estoy ocupado/a, pero siempre en mi mente',
    explanation: 'A veces el trabajo, el tráfico o las reuniones me impiden mirar el celular. No significa que me haya alejado ni que esté enojado/a. Apenas tenga un respiro, te escribiré.',
    affirmation: 'La tardanza es solo distancia temporal, no falta de interés.',
    voiceFilename: 'voice_mal_dia_01.wav',
  },
  {
    id: 'doubt-4',
    trigger: 'Cuando te compares con los demás y sientas inseguridad',
    answerTitle: 'No hay nadie en el mundo como tú',
    explanation: 'No quiero a nadie más. Me enamoré de tu risa, de tu bondad, de tu forma de ser y de todo lo que somos juntos. Eres perfecta/o para mí.',
    affirmation: 'Eres única/o y mi persona favorita indiscutible.',
    voiceFilename: 'voice_te_extrano_01.wav',
  },
];

export const TIME_CAPSULES: TimeCapsuleItem[] = [
  {
    id: 'capsule-1',
    title: 'Ábreme solo si estás llorando 😢',
    description: 'Para esos momentos donde las lágrimas pesan demasiado.',
    sealIcon: '🌧️',
    unlockCondition: 'Cuando sientas que no puedes contener el llanto.',
    content: 'Sé que en este momento duele mucho. Llora todo lo que necesites, no te guardes nada. Pero prométeme que al terminar tomarás un vaso con agua. Recuerda que no estás sola/o. Te amo con toda mi alma.',
    voiceFilename: 'voice_ansiedad_01.wav',
    isOpened: false,
  },
  {
    id: 'capsule-2',
    title: 'Ábreme solo si sientes que no puedes más 🛡️',
    description: 'Tu dosis de fuerza cuando sientas que las fuerzas se acaban.',
    sealIcon: '⚔️',
    unlockCondition: 'Cuando el mundo parezca demasiado abrumador.',
    content: 'Has superado el 100% de tus peores días del pasado. Eres más fuerte de lo que crees y más valiente de lo que imaginas. Descansa hoy, yo te sostengo la mano mentalmente.',
    voiceFilename: 'voice_mal_dia_01.wav',
    isOpened: false,
  },
  {
    id: 'capsule-3',
    title: 'Ábreme solo si quieres recordar nuestro primer beso 💋',
    description: 'Un viaje a cuando el corazón nos latía a mil por hora.',
    sealIcon: '✨',
    unlockCondition: 'Para cuando nos extrañemos intensamente.',
    content: 'Ese momento se quedó grabado en mi memoria para siempre. Los nervios, tu mirada y la certeza de que quería quedarme a tu lado por mucho tiempo.',
    voiceFilename: 'voice_te_extrano_01.wav',
    isOpened: false,
  },
  {
    id: 'capsule-4',
    title: 'Ábreme solo si estás enojada/o conmigo 🥺',
    description: 'Porque nuestro amor siempre es más grande que cualquier desacuerdo.',
    sealIcon: '🕊️',
    unlockCondition: 'Si tuvimos una discusión o malentendido.',
    content: 'Somos un equipo contra el problema, no el uno contra el otro. Si me equivoqué o te lastimé, perdóname de corazón. Lo que más quiero en esta vida es verte en paz y feliz a mi lado.',
    voiceFilename: 'voice_ansiedad_01.wav',
    isOpened: false,
  },
];

export const INITIAL_FUTURE_GOALS: FutureGoalItem[] = [
  { id: 'goal-1', title: 'Viaje juntos a la playa a ver el atardecer', category: 'viaje', isCompleted: false },
  { id: 'goal-2', title: 'Noche de cocinar pizzas caseras y maratón de pelis', category: 'cita', isCompleted: true, completedDate: 'Cumplido ❤️' },
  { id: 'goal-3', title: 'Comprar una plantita o algo para nuestro futuro hogar', category: 'hogar', isCompleted: false },
  { id: 'goal-4', title: 'Dormir abrazados toda la noche sin alarmas', category: 'experiencia', isCompleted: false },
];
