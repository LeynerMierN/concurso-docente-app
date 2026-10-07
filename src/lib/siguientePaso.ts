import config from "@data/app_config.json";
import type { AnimoMascota } from "@/components/mascota/Capibara";
import { resumenRepaso } from "@/lib/repaso";
import { respondidasEnDia, type Progreso } from "@/lib/progreso";

/** Lo único que el inicio le pide hacer al aspirante en este momento */
export interface SiguientePaso {
  tipo: "primera" | "repaso" | "tarea" | "simulacro" | "listo";
  titulo: string;
  detalle: string;
  boton: string;
  href: string;
  animo: AnimoMascota;
}

const META = config.gamification.streak_system.daily_goal_questions;
/** Ritmo de «Practicar un tema» (20 preguntas en 30 minutos), para estimar el tiempo */
const MINUTOS_POR_PREGUNTA = 1.5;
/** Cada cuánto conviene medirse con un simulacro */
const DIAS_ENTRE_SIMULACROS = 7;
const SIMULACRO_CORTO = config.exam_modes.find((m) => m.id === "simulacro_medio");

const minutos = (preguntas: number) => Math.max(1, Math.round(preguntas * MINUTOS_POR_PREGUNTA));
const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

/**
 * Recomendación por prioridad: primera práctica → repasar errores → tarea de hoy →
 * medirse con un simulacro (si hace una semana no lo hace) → listo por hoy.
 */
export function siguientePaso(progreso: Progreso, hoy: Date = new Date()): SiguientePaso {
  if (progreso.intentos.length === 0) {
    return {
      tipo: "primera",
      titulo: "Haz tu primera práctica",
      detalle: "10 preguntas como las del examen, con la respuesta explicada al instante. Unos 10 minutos.",
      boton: "Empezar",
      href: "/practica?modo=express_10&empezar=1",
      animo: "feliz",
    };
  }

  const pendientes = resumenRepaso(progreso, hoy).hoy;
  if (pendientes > 0) {
    return {
      tipo: "repaso",
      titulo: `Repasa ${plural(pendientes, "pregunta", "preguntas")} que fallaste`,
      detalle: `Volver sobre tus errores es lo que más sube el puntaje. Unos ${minutos(pendientes)} min.`,
      boton: "Repasar ahora",
      href: "/practica?filtro=repaso&empezar=1",
      animo: "pensando",
    };
  }

  const hechas = respondidasEnDia(progreso);
  if (hechas < META) {
    const faltan = META - hechas;
    return {
      tipo: "tarea",
      titulo: hechas > 0 ? "Termina la tarea de hoy" : "Haz la tarea de hoy",
      detalle: `Te ${faltan === 1 ? "falta" : "faltan"} ${plural(faltan, "pregunta", "preguntas")} para la meta de hoy. Unos ${minutos(faltan)} min.`,
      boton: hechas > 0 ? "Continuar" : "Empezar",
      href: "/practica?modo=express_10&empezar=1",
      animo: "feliz",
    };
  }

  const ultimo = progreso.intentos.find((i) => i.modo === "simulacro");
  const diasDesdeUltimo = ultimo ? Math.floor((hoy.getTime() - new Date(ultimo.fecha).getTime()) / 86_400_000) : Infinity;
  if (diasDesdeUltimo >= DIAS_ENTRE_SIMULACROS && SIMULACRO_CORTO) {
    return {
      tipo: "simulacro",
      titulo: ultimo ? "Mide otra vez tu puntaje" : "Mide tu puntaje con un simulacro",
      detalle: `Simulacro corto: ${SIMULACRO_CORTO.question_count} preguntas en unas ${Math.round(SIMULACRO_CORTO.duration_minutes / 60)} horas, como el examen real.`,
      boton: "Ver el simulacro",
      href: `/simulacros?modo=${SIMULACRO_CORTO.id}`,
      animo: "pensando",
    };
  }

  return {
    tipo: "listo",
    titulo: "¡Listo por hoy!",
    detalle: "Cumpliste la tarea de hoy. Si te quedan ganas, repasa una ficha de normas.",
    boton: "Ver las fichas",
    href: "/normatividad",
    animo: "celebrando",
  };
}
