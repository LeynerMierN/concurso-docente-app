export type OpcionId = "A" | "B" | "C" | "D";

export interface Opcion {
  id: OpcionId;
  texto: string;
}

/** Pregunta del banco unificado data/banco_preguntas.json (generado por scripts/importar_bancos.py) */
export interface Pregunta {
  id: string;
  /** Id de la taxonomía de data/app_config.json (categories_taxonomy) */
  categoria_id: string;
  /** Grupo de la taxonomía: core_transversal, especialidades_docentes, directivos_docentes, contextos_diferenciados */
  grupo: string;
  /** Nombre de la categoría (para mostrar) */
  area: string;
  tema: string;
  norma_referencia: string;
  contexto: string;
  pregunta: string;
  opciones: Opcion[];
  respuesta_correcta: OpcionId;
  justificacion: string;
  /** Módulo especial de origen: casos_juridicos, analisis_distractores, simulacro_icfes */
  modulo?: string;
}

/**
 * "todos", un filtro temático predefinido, "grupo:<grupo de la taxonomía>" o el id de una categoría
 */
export type FiltroExamen = "todos" | "convivencia" | "inclusion" | "evaluacion" | "psicotecnica" | (string & {});

export interface RespuestaUsuario {
  preguntaId: string;
  /** Id original de la opción (A–D en el banco), independiente del orden mostrado */
  opcionSeleccionada: string;
  esCorrecta: boolean;
}

export interface ResultadoExamen {
  totalPreguntas: number;
  correctas: number;
  /** Respondidas de forma incorrecta (no incluye las que quedaron sin responder) */
  incorrectas: number;
  sinResponder: number;
  /** Escala 0–100, comparable con el umbral eliminatorio */
  porcentaje: number;
  umbral: number;
  aprobado: boolean;
  desglosePorArea: Record<string, { total: number; correctas: number }>;
}

export type ModoExamen = "practica" | "simulacro";

export interface ConfigExamen {
  modo: ModoExamen;
  /** Id del modo en data/app_config.json (exam_modes), si la sesión salió de uno */
  modoId?: string;
  filtro: FiltroExamen;
  /** Máximo de preguntas; si se omite se usan todas las del filtro */
  cantidad?: number;
  /** Límite de tiempo total en segundos; null = sin límite */
  limiteSegundos: number | null;
  /** Muestra la respuesta correcta y la justificación apenas se responde */
  feedbackInmediato: boolean;
  /** Lista exacta de preguntas (repaso de errores); si existe, reemplaza a filtro/cantidad */
  preguntaIds?: string[];
  /** Preguntas por categoría (simulacros por componentes); si existe, reemplaza a filtro/cantidad */
  distribucion?: Record<string, number>;
  /** Permite pausar el cronómetro (allow_pause del config) */
  permitirPausa?: boolean;
  umbral: number;
}

/** Estado serializable de una sesión, se guarda en localStorage */
export interface SesionExamen {
  version: 1;
  config: ConfigExamen;
  preguntaIds: string[];
  /** Orden aleatorio de opciones por pregunta, para no favorecer una letra */
  ordenOpciones: Record<string, OpcionId[]>;
  respuestas: Record<string, OpcionId>;
  banderas: string[];
  indice: number;
  inicioMs: number;
  finMs: number | null;
  terminadoMs: number | null;
  /** Momento en que se pausó; null o ausente = corriendo */
  pausadoMs?: number | null;
}
