import {
  BarChart3,
  BookOpenCheck,
  Crown,
  FileText,
  LayoutDashboard,
  Timer,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import config from "@data/app_config.json";
import { CONTEO_POR_CATEGORIA, UMBRAL_DOCENTE_AULA, filtrarPreguntas, filtroDeGrupo } from "@/lib/preguntas";
import type { ConfigExamen, FiltroExamen } from "@/types/exam";

export const APP = config.app_metadata;

/** Íconos que el config nombra por texto. Importarlos uno a uno evita cargar toda la librería. */
const ICONOS: Record<string, LucideIcon> = { LayoutDashboard, BookOpenCheck, Timer, FileText, BarChart3, Crown };

/** Módulos del config que no van en la barra inferior del celular (se accede desde Inicio y Perfil) */
const FUERA_DE_BARRA_MOVIL = new Set(["premium"]);

/** Etiquetas cortas para la barra inferior del celular, donde no caben las del config */
const ETIQUETA_CORTA: Record<string, string> = {
  home: "Inicio",
  practica: "Práctica",
  simulacros: "Simulacro",
  normatividad: "Fichas",
  estadisticas: "Progreso",
};

export interface ModuloNavegacion {
  id: string;
  etiqueta: string;
  etiquetaCorta: string;
  descripcion: string;
  ruta: string;
  Icono: LucideIcon;
}

export const MODULOS_NAVEGACION: ModuloNavegacion[] = config.navigation_modules.map((m) => ({
    id: m.id,
    etiqueta: m.label,
    etiquetaCorta: ETIQUETA_CORTA[m.id] ?? m.label,
    descripcion: m.description,
    ruta: m.route,
    Icono: ICONOS[m.icon] ?? FileText,
  }));

/** Barra inferior del celular: módulos de estudio + Convocatoria (que no está en el config) */
export const MODULOS_MOVIL: ModuloNavegacion[] = [
  ...MODULOS_NAVEGACION.filter((m) => !FUERA_DE_BARRA_MOVIL.has(m.id)),
  {
    id: "convocatoria",
    etiqueta: "Convocatoria y salario",
    etiquetaCorta: "Concurso",
    descripcion: "Reglas del examen, calculadora salarial y beneficios.",
    ruta: "/convocatoria",
    Icono: Wallet,
  },
];

export const META_DIARIA_PREGUNTAS = config.gamification.streak_system.daily_goal_questions;

/**
 * Distribución de la Prueba de Aptitudes y Competencias Básicas por componente
 * (30/30/20/20), usada para armar los simulacros desde los bancos reales.
 */
export const DISTRIBUCION_CNSC: Record<string, number> = {
  lectura_critica: 0.3,
  razonamiento_cuantitativo: 0.3,
  juicio_situacional: 0.2,
  comportamental: 0.2,
};

/** Filtro por defecto de los modos de práctica: el núcleo común que presentan todos los aspirantes */
export const FILTRO_NUCLEO_COMUN = filtroDeGrupo("core_transversal");

export interface ModoExamen {
  id: string;
  nombre: string;
  descripcion: string;
  /** Preguntas que pide el config */
  preguntasConfig: number;
  /** Preguntas que se pueden usar con el banco actual (filtro por defecto o distribución) */
  preguntas: number;
  /** Minutos del config ajustados proporcionalmente a las preguntas reales; null = sin límite */
  minutos: number | null;
  /** Minutos por pregunta según el config (duración / preguntas); null = sin límite */
  minutosPorPregunta: number | null;
  feedbackInmediato: boolean;
  permitePausa: boolean;
  /** Los simulacros (sin feedback) se arman por componentes con DISTRIBUCION_CNSC */
  porComponentes: boolean;
  /** Página que ejecuta el modo: los de retroalimentación inmediata van a Práctica */
  href: string;
}

export interface Dimension {
  preguntas: number;
  minutos: number | null;
  /** Preguntas por categoría cuando el modo es por componentes */
  distribucion?: Record<string, number>;
}

/**
 * Preguntas y minutos reales de un modo. Por componentes: cada categoría aporta su porcentaje
 * del total pedido, limitado a lo que hay en el banco. El tiempo se escala a las preguntas reales.
 */
export function dimensionarModo(
  modo: Pick<ModoExamen, "preguntasConfig" | "minutosPorPregunta" | "porComponentes">,
  filtro: FiltroExamen = FILTRO_NUCLEO_COMUN,
): Dimension {
  let preguntas: number;
  let distribucion: Record<string, number> | undefined;
  if (modo.porComponentes) {
    distribucion = Object.fromEntries(
      Object.entries(DISTRIBUCION_CNSC).map(([cat, pct]) => [
        cat,
        Math.min(Math.round(modo.preguntasConfig * pct), CONTEO_POR_CATEGORIA[cat] ?? 0),
      ]),
    );
    preguntas = Object.values(distribucion).reduce((a, b) => a + b, 0);
  } else {
    preguntas = Math.min(modo.preguntasConfig, filtrarPreguntas(filtro).length);
  }
  const minutos = modo.minutosPorPregunta === null ? null : Math.ceil(modo.minutosPorPregunta * preguntas);
  return { preguntas, minutos, distribucion };
}

export const MODOS_EXAMEN: ModoExamen[] = config.exam_modes.map((m) => {
  const base = {
    preguntasConfig: m.question_count,
    minutosPorPregunta: m.duration_minutes > 0 ? m.duration_minutes / m.question_count : null,
    porComponentes: !m.instant_feedback,
  };
  const { preguntas, minutos } = dimensionarModo(base);
  const ruta = m.instant_feedback ? "/practica" : "/simulacros";
  return {
    id: m.id,
    nombre: m.name,
    descripcion: m.description,
    ...base,
    preguntas,
    minutos,
    feedbackInmediato: m.instant_feedback,
    permitePausa: m.allow_pause,
    href: `${ruta}?modo=${m.id}`,
  };
});

export function obtenerModo(id: string | null): ModoExamen | undefined {
  return MODOS_EXAMEN.find((m) => m.id === id);
}

/** Traduce un modo del config a la configuración del motor de examen */
export function configDesdeModo(
  modo: ModoExamen,
  filtro: FiltroExamen = FILTRO_NUCLEO_COMUN,
  umbral: number = UMBRAL_DOCENTE_AULA,
): ConfigExamen {
  const { preguntas, minutos, distribucion } = dimensionarModo(modo, filtro);
  return {
    modo: modo.feedbackInmediato ? "practica" : "simulacro",
    modoId: modo.id,
    filtro: modo.porComponentes ? FILTRO_NUCLEO_COMUN : filtro,
    cantidad: preguntas,
    distribucion,
    limiteSegundos: minutos === null ? null : minutos * 60,
    feedbackInmediato: modo.feedbackInmediato,
    permitirPausa: modo.permitePausa,
    umbral,
  };
}
