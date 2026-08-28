export interface DailyPhrase {
  id: number;
  phrase: string;
  author: string;
}

export const DAILY_PHRASES: DailyPhrase[] = [
  { id: 1, phrase: "Hoy va a ser un gran día. No olvides tomar agua y sonreír.", author: "Tu persona favorita" },
  { id: 2, phrase: "Tu paz mental vale más que cualquier problema exterior.", author: "Botiquín del Corazón" },
  { id: 3, phrase: "Aquí pensando en ti desde primera hora de la mañana.", author: "Con amor" },
  { id: 4, phrase: "Eres capaz de lograr cosas extraordinarias hoy.", author: "Tu mayor fan" },
  { id: 5, phrase: "Si te sientes cansado/a hoy, descansa, pero no te rindas.", author: "Siempre contigo" },
  { id: 6, phrase: "Cada latido de este widget te recuerda cuánto te amo.", author: "Tu botiquín" },
  { id: 7, phrase: "Un pasito a la vez. No hay prisa.", author: "Modo calma" },
  { id: 8, phrase: "Recuerda que tienes la sonrisa más linda de este planeta.", author: "Te lo juro" },
  { id: 9, phrase: "Todo lo que necesitas ya está dentro de ti.", author: "Fuerza interior" },
  { id: 10, phrase: "Si hoy el mundo pesa, déjame ayudarte a cargarlo.", author: "Tu refugio" },
  { id: 11, phrase: "Cuenta regresiva para nuestro próximo abrazo...", author: "Tic tac" },
  { id: 12, phrase: "Inhala calma, exhala preocupaciones.", author: "Respiración 4-7-8" },
  { id: 13, phrase: "Estoy muy orgulloso/a de la persona en la que te estás convirtiendo.", author: "De corazón" },
  { id: 14, phrase: "Hoy permítete disfrutar de los pequeños detalles.", author: "Aquí y ahora" },
  { id: 15, phrase: "No hay distancia que pueda borrar lo que siento por ti.", author: "Cero kilómetros" },
  { id: 16, phrase: "Haz una pausa de 2 minutos. Relaja los hombros.", author: "Check corporal" },
  { id: 17, phrase: "Eres mi lugar seguro en el mundo.", author: "Hogar" },
  { id: 18, phrase: "Tu esfuerzo silencioso de cada día dará grandes frutos.", author: "Paciencia y fe" },
  { id: 19, phrase: "Gracias por existir y por hacer mi vida más bonita.", author: "Gratitud pura" },
  { id: 20, phrase: "Si necesitas desahogarte, pulsa este corazón.", author: "Tu botiquín activo" },
  { id: 21, phrase: "Que nada ni nadie te robe tu energía positiva hoy.", author: "Escudo protector" },
  { id: 22, phrase: "Te mando un beso volador con destino a tu frente.", author: "En camino" },
  { id: 23, phrase: "Lo estás haciendo mucho mejor de lo que crees.", author: "Confianza" },
  { id: 24, phrase: "Toca el corazón si quieres escuchar mi voz.", author: "Playlist de emergencia" },
  { id: 25, phrase: "Que hoy te sobren motivos para sonreír.", author: "Buenos deseos" },
  { id: 26, phrase: "Eres mi persona favorita en todo el universo.", author: "Oficial" },
  { id: 27, phrase: "Respira hondo: este momento difícil va a pasar.", author: "Firmeza" },
  { id: 28, phrase: "Eres luz para quienes te rodean.", author: "Brillo propio" },
  { id: 29, phrase: "Nunca olvides lo valioso/a e irrepetible que eres.", author: "Recordatorio clave" },
  { id: 30, phrase: "Te amo hoy más que ayer y menos que mañana.", author: "Infinito" },
];

export function getTodayPhrase(): DailyPhrase {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const index = Math.abs(dayOfYear % DAILY_PHRASES.length);
  return DAILY_PHRASES[index];
}
