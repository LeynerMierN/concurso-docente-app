import { FICHAS } from "@/lib/fichas";

/** Lo que dice Capi: consejos de estudio y frases cortas tras cada respuesta. El inicio usa `siguientePaso.ts` */
const CONSEJOS_GENERALES = [
  "Lee primero la pregunta y luego el contexto: así sabes qué buscar.",
  "En las preguntas de juicio situacional, la mejor respuesta suele ser la que dialoga y sigue la ruta institucional.",
  "Si dudas entre dos opciones, descarta la que usa palabras absolutas como «siempre» o «nunca».",
  "La prueba de aptitudes es eliminatoria: necesitas 60/100 si eres docente de aula y 70/100 si eres directivo.",
  "Estudiar 20 minutos todos los días rinde más que tres horas un solo día.",
];

/** Consejos que da Capi al tocarlo: trampas frecuentes de las fichas y consejos generales, intercalados */
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
