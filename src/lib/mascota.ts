import type { AnimoMascota } from "@/components/mascota/Capibara";
import { META_DIARIA_PREGUNTAS } from "@/lib/appConfig";
import { FICHAS } from "@/lib/fichas";
import type { Perfil } from "@/lib/perfil";
import { resumenRepaso } from "@/lib/repaso";
import { calcularRacha, diasDeRacha, respondidasEnDia, type Progreso } from "@/lib/storage";

export interface EstadoMascota {
  animo: AnimoMascota;
  mensaje: string;
}

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

/** Lo que Sabino dice en el inicio según el progreso de hoy (en orden de prioridad) */
export function estadoMascota(progreso: Progreso, perfil: Perfil | null, hoy: Date = new Date()): EstadoMascota {
  const nombre = perfil?.name.trim().split(/\s+/)[0];
  const saludo = nombre ? `¡Hola, ${nombre}! ` : "¡Hola! ";

  if (progreso.intentos.length === 0) {
    return {
      animo: "feliz",
      mensaje: `${saludo}Soy Sabino y te acompaño en tu preparación. Empieza con una práctica corta y tócame cuando quieras un consejo.`,
    };
  }

  const racha = calcularRacha(diasDeRacha(progreso), hoy);
  const respondidas = respondidasEnDia(progreso);
  const repaso = resumenRepaso(progreso, hoy);

  if (respondidas >= META_DIARIA_PREGUNTAS) {
    return {
      animo: "celebrando",
      mensaje: `¡Meta del día cumplida! Llevas ${plural(racha.actual, "día", "días")} de racha. Así se gana el concurso.`,
    };
  }
  if (racha.actual > 0 && !racha.estudioHoy) {
    return {
      animo: "animando",
      mensaje: `${saludo}Tu racha de ${plural(racha.actual, "día", "días")} está en riesgo: responde al menos una pregunta hoy para no perderla.`,
    };
  }
  if (repaso.hoy > 0) {
    return {
      animo: "pensando",
      mensaje: `Tienes ${plural(repaso.hoy, "pregunta", "preguntas")} por repasar hoy. Repasar lo que fallaste es lo que más sube el puntaje.`,
    };
  }
  if (racha.estudioHoy) {
    const faltan = META_DIARIA_PREGUNTAS - respondidas;
    return { animo: "feliz", mensaje: `¡Vas bien! Te ${faltan === 1 ? "falta" : "faltan"} ${plural(faltan, "pregunta", "preguntas")} para la meta de hoy.` };
  }
  return { animo: "feliz", mensaje: `${saludo}Hoy es un buen día para empezar una racha nueva.` };
}

const CONSEJOS_GENERALES = [
  "Lee primero la pregunta y luego el contexto: así sabes qué buscar.",
  "En las preguntas de juicio situacional, la mejor respuesta suele ser la que dialoga y sigue la ruta institucional.",
  "Si dudas entre dos opciones, descarta la que usa palabras absolutas como «siempre» o «nunca».",
  "La prueba de aptitudes es eliminatoria: necesitas 60/100 si eres docente de aula y 70/100 si eres directivo.",
  "Estudiar 20 minutos todos los días rinde más que tres horas un solo día.",
];

/** Consejos que da Sabino al tocarlo: trampas frecuentes de las fichas y consejos generales, intercalados */
export const CONSEJOS: string[] = FICHAS.flatMap((f, i) => {
  const trampa = `Trampa frecuente sobre ${f.sigla || f.concepto}: ${f.error_frecuente}`;
  const general = CONSEJOS_GENERALES[i];
  return general ? [trampa, general] : [trampa];
});

/** Frases cortas para la retroalimentación de cada respuesta */
const FRASES_ACIERTO = ["¡Eso es!", "¡Muy bien!", "¡Excelente!", "¡Así se hace!", "¡Vas volando!"];
const FRASES_ERROR = [
  "Con calma: de los errores se aprende.",
  "Lee la justificación: la próxima no falla.",
  "Esta irá a tu repaso para dominarla.",
  "¡Ánimo! Cada error es un punto ganado el día del examen.",
];

/** Elige una frase estable para la misma pregunta (no cambia al volver a renderizar) */
export function fraseRespuesta(acierto: boolean, semilla: string): string {
  const lista = acierto ? FRASES_ACIERTO : FRASES_ERROR;
  let h = 0;
  for (const c of semilla) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return lista[h % lista.length];
}
