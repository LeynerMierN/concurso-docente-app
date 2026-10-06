import config from "@data/app_config.json";
import { FILTROS_TEMATICOS, obtenerPregunta } from "@/lib/preguntas";
import { calcularRacha } from "@/lib/racha";
import type { Pregunta } from "@/types/exam";

/** Forma mínima del progreso que necesitan las insignias (evita importar storage y crear un ciclo) */
interface ProgresoInsignias {
  diasEstudio: string[];
  diasProtegidos?: string[];
  porPregunta: Record<string, { respondidas: number; correctas: number }>;
}

/**
 * El config identifica cada insignia por una etiqueta de tema ("Inclusión y DUA", "Convivencia Escolar",
 * "Evaluación Formativa"); se traduce a los filtros temáticos del banco.
 */
const ETIQUETA_A_FILTRO: Record<string, string> = {
  "Inclusión y DUA": "inclusion",
  "Convivencia Escolar": "convivencia",
  "Evaluación Formativa": "evaluacion",
};

export interface Insignia {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  meta: number;
  /** Texto corto de la unidad del avance: "aciertos" o "días" */
  unidad: string;
}

export const INSIGNIAS: Insignia[] = config.gamification.badges.map((b) => ({
  id: b.id,
  titulo: b.title,
  descripcion: b.description,
  icono: b.icon,
  meta: "req_streak_days" in b ? (b.req_streak_days as number) : (b.count as number),
  unidad: "req_streak_days" in b ? "días de racha" : "aciertos",
}));

function coincideTema(etiqueta: string): (p: Pregunta) => boolean {
  const filtro = FILTROS_TEMATICOS.find((f) => f.id === ETIQUETA_A_FILTRO[etiqueta]);
  return filtro ? filtro.coincide : () => false;
}

/** Avance actual de cada insignia (0..meta) */
export function avanceInsignias(progreso: ProgresoInsignias): Record<string, number> {
  const avance: Record<string, number> = {};
  for (const b of config.gamification.badges) {
    if ("req_streak_days" in b) {
      const { mejor } = calcularRacha([...progreso.diasEstudio, ...(progreso.diasProtegidos ?? [])]);
      avance[b.id] = mejor;
    } else {
      const coincide = coincideTema(b.req_correct_tag as string);
      avance[b.id] = Object.entries(progreso.porPregunta).reduce((suma, [id, stats]) => {
        const p = obtenerPregunta(id);
        return p && coincide(p) ? suma + stats.correctas : suma;
      }, 0);
    }
  }
  return avance;
}

/** Ids de las insignias cuyo requisito ya se cumple */
export function insigniasCumplidas(progreso: ProgresoInsignias): string[] {
  const avance = avanceInsignias(progreso);
  return INSIGNIAS.filter((i) => avance[i.id] >= i.meta).map((i) => i.id);
}
