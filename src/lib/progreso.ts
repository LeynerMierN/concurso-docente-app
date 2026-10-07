import config from "@data/app_config.json";
import { sincronizarPerfil } from "@/lib/perfil";
import { calcularRacha, diaAnterior, diaLocal } from "@/lib/racha";
import type { MapaRepaso } from "@/lib/repaso";
import type { ModoExamen } from "@/types/exam";

/*
 * Lectura del progreso guardado y cálculos livianos (racha, tarea de hoy, protector, proyección).
 * No importa el banco de preguntas: el inicio lo usa sin descargar las 296 preguntas.
 * Registrar un intento (que sí necesita el banco para las insignias) está en storage.ts.
 */

export { calcularRacha, diaLocal, ultimosDias } from "@/lib/racha";

export const COSTO_PROTECTOR_XP = config.gamification.streak_system.freeze_streak_cost_xp;
export const META_DIARIA_PREGUNTAS = config.gamification.streak_system.daily_goal_questions;

const CLAVE = "concurso-docente:progreso";

export interface Intento {
  /** `${modo}-${inicioMs}`: identifica la sesión y evita registrarla dos veces */
  id: string;
  /** ISO 8601 del momento en que terminó */
  fecha: string;
  modo: ModoExamen;
  /** Área o filtro practicado ("Todas las áreas" en simulacros) */
  area: string;
  puntaje: number;
  totalPreguntas: number;
  /** Preguntas contestadas (ausente en intentos guardados antes de este campo) */
  respondidas?: number;
  correctas: number;
  aprobado: boolean;
  duracionSegundos: number;
  /** Id del modo en app_config (exam_modes) */
  modoId?: string;
  /** XP ganada en este intento */
  xp?: number;
  /** Insignias desbloqueadas al terminar este intento */
  insigniasNuevas?: string[];
  /** Preguntas que salieron del repaso de errores por quedar dominadas */
  dominadas?: number;
}

export interface Progreso {
  version: 1;
  /** Más reciente primero */
  intentos: Intento[];
  /** Días (YYYY-MM-DD, hora local) con al menos un intento terminado, ordenados */
  diasEstudio: string[];
  totalRespondidas: number;
  /** Estadística por pregunta: permite agrupar después por área, macro-área o tema */
  porPregunta: Record<string, { respondidas: number; correctas: number }>;
  /** Saldo de XP (lo ganado menos lo gastado en protectores) */
  xp?: number;
  /** XP ganada en total, sin descontar gastos */
  xpTotal?: number;
  /** Días sin estudio cubiertos con un protector de racha (YYYY-MM-DD) */
  diasProtegidos?: string[];
  /** Insignias desbloqueadas: id → fecha ISO */
  insignias?: Record<string, string>;
  /** Repaso de errores (repetición espaciada): id de pregunta → caja y próxima fecha */
  repaso?: MapaRepaso;
}

const VACIO: Progreso = { version: 1, intentos: [], diasEstudio: [], totalRespondidas: 0, porPregunta: {} };

/** Días que cuentan para la racha: estudiados más protegidos */
export function diasDeRacha(p: Progreso): string[] {
  return [...p.diasEstudio, ...(p.diasProtegidos ?? [])];
}

export function leerProgreso(): Progreso {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return VACIO;
    const p = JSON.parse(crudo) as Progreso;
    return p?.version === 1 && Array.isArray(p.intentos) ? p : VACIO;
  } catch {
    return VACIO;
  }
}

/** Guarda el progreso y avisa a la app (lo usan registrarIntento y el protector) */
export function guardarProgreso(p: Progreso) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(p));
    // Avisa a otros componentes de la misma pestaña (el evento "storage" solo llega a otras pestañas)
    window.dispatchEvent(new Event("concurso-docente:progreso"));
  } catch {
    // Sin almacenamiento disponible: el progreso no se conserva, la app sigue funcionando
  }
  sincronizarPerfil({ xp: p.xp ?? 0, rachaDias: calcularRacha(diasDeRacha(p)).actual, ultimoDia: p.diasEstudio.at(-1) ?? "", insignias: Object.keys(p.insignias ?? {}) });
}

/**
 * Día que un protector puede cubrir: ayer, si ayer no se estudió y anteayer sí cuenta para la racha
 * (es decir, la racha se rompió por un solo día). Devuelve null si no aplica.
 */
export function diaProtegible(p: Progreso, hoy: Date = new Date()): string | null {
  const ayer = diaAnterior(diaLocal(hoy));
  const anteayer = diaAnterior(ayer);
  const dias = new Set(diasDeRacha(p));
  return !dias.has(ayer) && dias.has(anteayer) ? ayer : null;
}

/** Gasta XP para cubrir el día perdido. Devuelve el progreso actualizado, o null si no se pudo. */
export function usarProtector(hoy: Date = new Date()): Progreso | null {
  const p = leerProgreso();
  const dia = diaProtegible(p, hoy);
  if (!dia || (p.xp ?? 0) < COSTO_PROTECTOR_XP) return null;
  const actualizado: Progreso = {
    ...p,
    xp: (p.xp ?? 0) - COSTO_PROTECTOR_XP,
    diasProtegidos: [...(p.diasProtegidos ?? []), dia].sort(),
  };
  guardarProgreso(actualizado);
  return actualizado;
}

/** Preguntas contestadas en un día (por defecto hoy), para la meta diaria */
export function respondidasEnDia(progreso: Progreso, dia: string = diaLocal(new Date())): number {
  return progreso.intentos
    .filter((i) => diaLocal(new Date(i.fecha)) === dia)
    .reduce((suma, i) => suma + (i.respondidas ?? i.totalPreguntas), 0);
}

/**
 * Proyección simple: promedio de los últimos 3 simulacros.
 * Es una referencia de tendencia, no una predicción del puntaje oficial.
 */
export function proyeccionPuntaje(progreso: Progreso): number | null {
  const ultimos = progreso.intentos.filter((i) => i.modo === "simulacro").slice(0, 3);
  if (ultimos.length === 0) return null;
  return Math.round((ultimos.reduce((s, i) => s + i.puntaje, 0) / ultimos.length) * 10) / 10;
}
