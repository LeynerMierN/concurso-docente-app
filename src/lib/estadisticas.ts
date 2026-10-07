import { CATEGORIAS } from "@/lib/categorias";
import { CONTEO_POR_CATEGORIA, obtenerPregunta } from "@/lib/preguntas";
import type { Progreso } from "@/lib/progreso";

export { proyeccionPuntaje } from "@/lib/progreso";

/** Categorías del núcleo común con preguntas: las que todo aspirante debería practicar */
export const CATEGORIAS_NUCLEO = CATEGORIAS.filter((c) => c.grupo === "core_transversal" && CONTEO_POR_CATEGORIA[c.id]).map((c) => c.nombre);

export interface AciertoArea {
  area: string;
  respondidas: number;
  pct: number;
}

/** Acierto histórico por categoría de la taxonomía, la más débil primero */
export function aciertoPorArea(progreso: Progreso): AciertoArea[] {
  const acumulado = new Map<string, { respondidas: number; correctas: number }>();
  for (const [id, stats] of Object.entries(progreso.porPregunta)) {
    const pregunta = obtenerPregunta(id);
    if (!pregunta) continue;
    const area = pregunta.area;
    const previo = acumulado.get(area) ?? { respondidas: 0, correctas: 0 };
    acumulado.set(area, { respondidas: previo.respondidas + stats.respondidas, correctas: previo.correctas + stats.correctas });
  }
  return [...acumulado.entries()]
    .map(([area, { respondidas, correctas }]) => ({ area, respondidas, pct: Math.round((correctas / respondidas) * 100) }))
    .sort((a, b) => a.pct - b.pct || b.respondidas - a.respondidas);
}

export function aciertoGlobal(progreso: Progreso): number {
  const correctas = Object.values(progreso.porPregunta).reduce((s, p) => s + p.correctas, 0);
  return progreso.totalRespondidas ? Math.round((correctas / progreso.totalRespondidas) * 100) : 0;
}
