export type OpcionId = "A" | "B" | "C" | "D";

export interface Opcion {
  id: OpcionId;
  texto: string;
}

/** Pregunta de Juicio Situacional (PJS), tal como viene en data/banco_preguntas_pjs_concurso_docente.json */
export interface Pregunta {
  id: string;
  area: string;
  tema: string;
  norma_referencia: string;
  contexto: string;
  pregunta: string;
  opciones: Opcion[];
  respuesta_correcta: OpcionId;
  justificacion: string;
}

/** Filtros temáticos predefinidos; cualquier otro string se interpreta como nombre exacto de área */
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
  filtro: FiltroExamen;
  /** Máximo de preguntas; si se omite se usan todas las del filtro */
  cantidad?: number;
  /** Límite de tiempo total en segundos; null = sin límite */
  limiteSegundos: number | null;
  /** Muestra la respuesta correcta y la justificación apenas se responde */
  feedbackInmediato: boolean;
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
}
