import banco from "@data/banco_preguntas.json";
import { CATEGORIAS, NOMBRE_GRUPO, obtenerCategoria, type GrupoCategoria } from "@/lib/categorias";
import type { FiltroExamen, Pregunta, RespuestaUsuario, ResultadoExamen } from "@/types/exam";

/** Banco unificado generado por scripts/importar_bancos.py a partir de data/fuentes/ */
export const PREGUNTAS = banco as Pregunta[];

const PREGUNTAS_POR_ID = new Map(PREGUNTAS.map((p) => [p.id, p]));

export function obtenerPregunta(id: string): Pregunta | undefined {
  return PREGUNTAS_POR_ID.get(id);
}

/** Umbrales eliminatorios de la prueba de Aptitudes y Competencias Básicas (escala 0–100) */
export const UMBRAL_DOCENTE_AULA = 60;
export const UMBRAL_DIRECTIVO = 70;

/** Cantidad de preguntas por categoría de la taxonomía */
export const CONTEO_POR_CATEGORIA: Record<string, number> = PREGUNTAS.reduce<Record<string, number>>((acc, p) => {
  acc[p.categoria_id] = (acc[p.categoria_id] ?? 0) + 1;
  return acc;
}, {});

/** Categorías con al menos una pregunta, en el orden de la taxonomía */
export const CATEGORIAS_CON_PREGUNTAS = CATEGORIAS.filter((c) => CONTEO_POR_CATEGORIA[c.id]);

export function nombreCategoria(id: string): string {
  return obtenerCategoria(id)?.nombre ?? id;
}

const sinTildes = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const texto = (p: Pregunta) => sinTildes(`${p.tema} ${p.norma_referencia}`);

/** Filtros temáticos transversales: cruzan categorías según el tema y la norma de cada pregunta */
export const FILTROS_TEMATICOS: { id: FiltroExamen; etiqueta: string; coincide: (p: Pregunta) => boolean }[] = [
  { id: "convivencia", etiqueta: "Convivencia escolar", coincide: (p) => /convivencia|1620|acoso|tipo i/.test(texto(p)) },
  { id: "inclusion", etiqueta: "Inclusión y DUA", coincide: (p) => /inclusion|dua|piar|1421/.test(texto(p)) },
  { id: "evaluacion", etiqueta: "Evaluación y SIEE", coincide: (p) => /evaluacion|siee|1290/.test(texto(p)) },
  { id: "psicotecnica", etiqueta: "Psicotécnica", coincide: (p) => p.categoria_id === "comportamental" },
];

const PREFIJO_GRUPO = "grupo:";

export function filtroDeGrupo(grupo: GrupoCategoria): FiltroExamen {
  return `${PREFIJO_GRUPO}${grupo}`;
}

export function filtrarPreguntas(filtro: FiltroExamen): Pregunta[] {
  if (filtro === "todos") return PREGUNTAS;
  if (filtro.startsWith(PREFIJO_GRUPO)) return PREGUNTAS.filter((p) => p.grupo === filtro.slice(PREFIJO_GRUPO.length));
  const tematico = FILTROS_TEMATICOS.find((f) => f.id === filtro);
  if (tematico) return PREGUNTAS.filter(tematico.coincide);
  return PREGUNTAS.filter((p) => p.categoria_id === filtro);
}

export function etiquetaFiltro(filtro: FiltroExamen): string {
  if (filtro === "todos") return "Todo el banco";
  if (filtro.startsWith(PREFIJO_GRUPO)) return NOMBRE_GRUPO[filtro.slice(PREFIJO_GRUPO.length) as GrupoCategoria] ?? filtro;
  return FILTROS_TEMATICOS.find((f) => f.id === filtro)?.etiqueta ?? nombreCategoria(filtro);
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

/**
 * Arma un simulacro por componentes: toma al azar la cantidad pedida de cada categoría
 * y las presenta en bloques, en el orden de la distribución (como la prueba real).
 */
export function armarPorDistribucion(distribucion: Record<string, number>): Pregunta[] {
  return Object.entries(distribucion).flatMap(([categoria, cantidad]) =>
    mezclar(PREGUNTAS.filter((p) => p.categoria_id === categoria)).slice(0, cantidad),
  );
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
