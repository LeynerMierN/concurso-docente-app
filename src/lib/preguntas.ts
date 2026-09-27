import banco from "@data/banco_preguntas_pjs_concurso_docente.json";
import type { FiltroExamen, Pregunta, RespuestaUsuario, ResultadoExamen } from "@/types/exam";

export const PREGUNTAS = banco as Pregunta[];

const PREGUNTAS_POR_ID = new Map(PREGUNTAS.map((p) => [p.id, p]));

export function obtenerPregunta(id: string): Pregunta | undefined {
  return PREGUNTAS_POR_ID.get(id);
}

/** Umbrales eliminatorios de la prueba de Aptitudes y Competencias Básicas (escala 0–100) */
export const UMBRAL_DOCENTE_AULA = 60;
export const UMBRAL_DIRECTIVO = 70;

/** Minutos por pregunta usados en el simulacro cronometrado */
export const MINUTOS_POR_PREGUNTA = 2;

/** Áreas únicas del banco, ordenadas por cantidad de preguntas */
export function obtenerAreas(): { area: string; total: number }[] {
  const conteo = new Map<string, number>();
  for (const p of PREGUNTAS) conteo.set(p.area, (conteo.get(p.area) ?? 0) + 1);
  return [...conteo.entries()]
    .map(([area, total]) => ({ area, total }))
    .sort((a, b) => b.total - a.total);
}

const sinTildes = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Agrupa las variantes de área del banco (p. ej. "Convivencia Escolar y Prevención")
 * en macro-áreas sin solaparse, para estadísticas de progreso.
 */
const MACRO_AREAS: { prefijo: string; nombre: string }[] = [
  { prefijo: "convivencia", nombre: "Convivencia escolar" },
  { prefijo: "competencias comportamentales", nombre: "Psicotécnica" },
  { prefijo: "pedagogia", nombre: "Pedagogía y currículo" },
  { prefijo: "gestion institucional", nombre: "Gestión institucional" },
  { prefijo: "lectura critica", nombre: "Lectura crítica" },
  { prefijo: "razonamiento cuantitativo", nombre: "Razonamiento cuantitativo" },
  { prefijo: "aptitud verbal", nombre: "Aptitud verbal" },
];

export function macroArea(area: string): string {
  const normal = sinTildes(area);
  return MACRO_AREAS.find((m) => normal.startsWith(m.prefijo))?.nombre ?? area;
}

/** Filtros temáticos transversales: agrupan variantes de área y temas afines */
export const FILTROS_TEMATICOS: { id: FiltroExamen; etiqueta: string; coincide: (p: Pregunta) => boolean }[] = [
  { id: "convivencia", etiqueta: "Convivencia escolar", coincide: (p) => sinTildes(p.area).includes("convivencia") },
  { id: "inclusion", etiqueta: "Inclusión y DUA", coincide: (p) => sinTildes(p.tema).includes("inclusion") },
  { id: "evaluacion", etiqueta: "Evaluación y SIEE", coincide: (p) => /evaluacion|siee/.test(sinTildes(p.tema)) },
  { id: "psicotecnica", etiqueta: "Psicotécnica", coincide: (p) => sinTildes(p.area).includes("psicotecnica") },
];

export function filtrarPreguntas(filtro: FiltroExamen): Pregunta[] {
  if (filtro === "todos") return PREGUNTAS;
  const tematico = FILTROS_TEMATICOS.find((f) => f.id === filtro);
  return PREGUNTAS.filter(tematico ? tematico.coincide : (p) => p.area === filtro);
}

export function etiquetaFiltro(filtro: FiltroExamen): string {
  if (filtro === "todos") return "Todas las áreas";
  return FILTROS_TEMATICOS.find((f) => f.id === filtro)?.etiqueta ?? filtro;
}

/** Mezcla (Fisher–Yates) sin mutar el arreglo original */
export function mezclar<T>(items: readonly T[]): T[] {
  const copia = [...items];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Arma un set aleatorio de preguntas para el filtro dado */
export function armarExamen(filtro: FiltroExamen, cantidad?: number): Pregunta[] {
  const fuente = filtrarPreguntas(filtro);
  return mezclar(fuente).slice(0, Math.min(cantidad ?? fuente.length, fuente.length));
}

export function listarRespuestas(preguntas: Pregunta[], respuestas: Record<string, string>): RespuestaUsuario[] {
  return preguntas
    .filter((p) => respuestas[p.id])
    .map((p) => ({
      preguntaId: p.id,
      opcionSeleccionada: respuestas[p.id],
      esCorrecta: respuestas[p.id] === p.respuesta_correcta,
    }));
}

export function calificar(
  preguntas: Pregunta[],
  respuestas: Record<string, string>,
  umbral: number = UMBRAL_DOCENTE_AULA,
): ResultadoExamen {
  const desglosePorArea: ResultadoExamen["desglosePorArea"] = {};
  let correctas = 0;
  let respondidas = 0;

  for (const p of preguntas) {
    const area = (desglosePorArea[p.area] ??= { total: 0, correctas: 0 });
    area.total++;
    if (respuestas[p.id]) respondidas++;
    if (respuestas[p.id] === p.respuesta_correcta) {
      correctas++;
      area.correctas++;
    }
  }

  const total = preguntas.length;
  const porcentaje = total === 0 ? 0 : Math.round((correctas / total) * 1000) / 10;
  return {
    totalPreguntas: total,
    correctas,
    incorrectas: respondidas - correctas,
    sinResponder: total - respondidas,
    porcentaje,
    umbral,
    aprobado: porcentaje >= umbral,
    desglosePorArea,
  };
}
