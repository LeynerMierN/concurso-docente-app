import { diaLocal } from "@/lib/racha";

/** Frase motivadora con id estable (para guardar favoritas aunque cambie el orden de la lista) */
export interface Frase {
  id: string;
  texto: string;
}

/** Frases propias, pensadas para quien se prepara para el Concurso Docente */
export const FRASES: Frase[] = [
  "Cada pregunta que respondes hoy es una que no te sorprenderá el día del examen.",
  "Tu vocación ya la tienes; ahora estás afinando la estrategia para demostrarla.",
  "Veinte minutos diarios valen más que una noche entera de estudio a última hora.",
  "Equivocarse en la práctica es la forma más barata de acertar en el examen.",
  "Detrás de cada plaza hay un salón esperando a alguien que crea en sus estudiantes. Esa persona puedes ser tú.",
  "No compites contra los demás aspirantes: compites contra la versión de ti que no estudió hoy.",
  "La constancia le gana al talento cuando el talento no es constante.",
  "Lo que hoy te parece difícil, en un mes será una pregunta fácil.",
  "Enseñar es creer en el futuro de otros. Prepararte es creer en el tuyo.",
  "Un error entendido vale más que diez aciertos de suerte.",
  "Tu constancia no mide lo que sabes: mide lo que construyes cada día.",
  "La norma se olvida si se memoriza; se queda si se entiende.",
  "Cada justificación que lees es una clase que te regalas.",
  "El día del examen solo tendrás que hacer lo que ya practicaste muchas veces.",
  "Si hoy no tienes ganas, haz cinco preguntas. Empezar es la parte más difícil.",
  "Los grandes docentes también fueron aspirantes con dudas y nervios.",
  "Respira, lee con calma y confía en tu preparación.",
  "La carrera docente se construye pregunta a pregunta, igual que una buena clase.",
  "Tu esfuerzo de hoy es la estabilidad de tu familia mañana.",
  "Hay estudiantes que aún no conoces y que ya cuentan contigo.",
  "Una buena lectura crítica empieza por una mente tranquila.",
  "No tienes que saberlo todo; tienes que saber elegir la mejor respuesta.",
  "Cuando una pregunta te cueste, piensa como el docente que quieres ser.",
  "Descansar también es parte del plan. Vuelve mañana con la mente fresca.",
  "El puntaje se construye en silencio, en las mañanas en que nadie te ve estudiar.",
  "Cada simulacro te acerca un poco más a la versión real.",
  "Quien enseña aprende dos veces. Hoy te toca aprender para luego enseñar.",
  "Si fallaste ayer, hoy tienes una nueva oportunidad para mejorar tu puntaje.",
  "Las regiones de Colombia necesitan maestros que no se rinden. Sigue adelante.",
  "La meta no es estudiar mucho un día, es no dejar de estudiar.",
  "Confía en el proceso: los resultados llegan cuando la práctica se vuelve hábito.",
  "Tu nombre en la lista de elegibles empieza a escribirse hoy.",
  "Leer despacio la pregunta ahorra tiempo en la respuesta.",
  "Un buen maestro no nace sabiéndolo todo; nace con ganas de aprender.",
  "Haz hoy lo que tu yo del día del examen te va a agradecer.",
  "Pequeños avances diarios se convierten en grandes resultados.",
].map((texto, i) => ({ id: `f${String(i + 1).padStart(2, "0")}`, texto }));

/** La misma frase para todos durante el día; cambia a medianoche */
export function fraseDelDia(hoy: Date = new Date()): Frase {
  let h = 0;
  for (const c of diaLocal(hoy)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return FRASES[h % FRASES.length];
}

/** Frase al azar distinta de la actual */
export function otraFrase(actualId?: string): Frase {
  const opciones = FRASES.filter((f) => f.id !== actualId);
  return opciones[Math.floor(Math.random() * opciones.length)];
}

const CLAVE_FAVORITAS = "concurso-docente:frases-favoritas";

export function leerFavoritas(): string[] {
  try {
    const crudo = JSON.parse(localStorage.getItem(CLAVE_FAVORITAS) ?? "[]");
    return Array.isArray(crudo) ? crudo.filter((id) => FRASES.some((f) => f.id === id)) : [];
  } catch {
    return [];
  }
}

export function guardarFavoritas(ids: string[]): void {
  try {
    localStorage.setItem(CLAVE_FAVORITAS, JSON.stringify(ids));
  } catch {
    // Sin almacenamiento disponible: las favoritas viven solo en esta visita
  }
}

/** Mensajes flotantes durante un examen: series de aciertos y avance */
export function mensajeRacha(seguidas: number): string | null {
  if (seguidas === 3) return "¡3 aciertos consecutivos! Buen ritmo.";
  if (seguidas === 5) return "¡5 aciertos consecutivos! Así se prepara quien va a ganar.";
  if (seguidas === 10) return "¡10 aciertos consecutivos! Estás en nivel de examen.";
  if (seguidas > 10 && seguidas % 5 === 0) return `¡${seguidas} aciertos consecutivos! Nadie te para.`;
  return null;
}

export function mensajeAvance(respondidas: number, total: number): string | null {
  // En sesiones cortas los hitos saldrían casi seguidos
  if (total < 8) return null;
  if (respondidas === total) return "¡Respondiste todas! Revisa las marcadas y entrega cuando quieras.";
  if (respondidas === Math.ceil(total * 0.75)) return "¡Ya casi! Estás en el último tramo.";
  if (respondidas === Math.ceil(total / 2)) return "¡Mitad del camino! Respira y sigue a tu ritmo.";
  if (respondidas === Math.ceil(total / 4)) return "¡Primer cuarto listo! Buen ritmo.";
  return null;
}
