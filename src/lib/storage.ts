import config from "@data/app_config.json";
import { insigniasCumplidas } from "@/lib/insignias";
import { sincronizarPerfil } from "@/lib/perfil";
import { calcularRacha, diaAnterior, diaLocal } from "@/lib/racha";
import { estadoRepaso, registrarRespuesta, type MapaRepaso } from "@/lib/repaso";
import type { ModoExamen, Pregunta } from "@/types/exam";

export { calcularRacha, diaLocal, ultimosDias } from "@/lib/racha";

const XP = config.gamification.xp_system;
export const COSTO_PROTECTOR_XP = config.gamification.streak_system.freeze_streak_cost_xp;
/** Modo del config que otorga el bono de simulacro completo */
const MODO_SIMULACRO_COMPLETO = "simulacro_oficial_100";

const CLAVE = "concurso-docente:progreso";
const MAX_INTENTOS = 300;

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

function guardarProgreso(p: Progreso) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(p));
    // Avisa a otros componentes de la misma pestaña (el evento "storage" solo llega a otras pestañas)
    window.dispatchEvent(new Event("concurso-docente:progreso"));
  } catch {
    // Sin almacenamiento disponible: el progreso no se conserva, la app sigue funcionando
  }
  sincronizarPerfil({ xp: p.xp ?? 0, rachaDias: calcularRacha(diasDeRacha(p)).actual, ultimoDia: p.diasEstudio.at(-1) ?? "", insignias: Object.keys(p.insignias ?? {}) });
}

export interface DatosIntento {
  modo: ModoExamen;
  area: string;
  inicioMs: number;
  terminadoMs: number;
  preguntas: Pregunta[];
  respuestas: Record<string, string>;
  puntaje: number;
  aprobado: boolean;
  modoId?: string;
}

/**
 * Registra un intento terminado y otorga XP e insignias según data/app_config.json (gamification).
 * Es idempotente: una misma sesión solo cuenta una vez; si ya existe, devuelve el intento guardado.
 */
export function registrarIntento(datos: DatosIntento): Intento {
  const progreso = leerProgreso();
  const id = `${datos.modo}-${datos.inicioMs}`;
  const existente = progreso.intentos.find((i) => i.id === id);
  if (existente) return existente;

  const porPregunta = { ...progreso.porPregunta };
  let respondidas = 0;
  let correctas = 0;
  let xp = 0;
  let dominadas = 0;
  const repaso: MapaRepaso = { ...estadoRepaso(progreso, new Date(datos.terminadoMs)) };
  for (const p of datos.preguntas) {
    const r = datos.respuestas[p.id];
    if (!r) continue;
    const acierto = r === p.respuesta_correcta;
    respondidas++;
    if (registrarRespuesta(repaso, p.id, acierto, new Date(datos.terminadoMs))) dominadas++;
    const previo = porPregunta[p.id] ?? { respondidas: 0, correctas: 0 };
    if (acierto) {
      correctas++;
      // Acertar una pregunta que nunca se había respondido vale más
      xp += previo.respondidas === 0 ? XP.correct_first_try : XP.correct_answer;
    }
    porPregunta[p.id] = { respondidas: previo.respondidas + 1, correctas: previo.correctas + (acierto ? 1 : 0) };
  }

  if (respondidas > 0) xp += XP.complete_quiz;
  if (respondidas > 0 && datos.modoId === MODO_SIMULACRO_COMPLETO) xp += XP.complete_full_simulation;

  // Un intento sin respuestas no cuenta como día de estudio
  const dia = diaLocal(datos.terminadoMs);
  const diaNuevo = respondidas > 0 && !progreso.diasEstudio.includes(dia);
  const diasEstudio = diaNuevo ? [...progreso.diasEstudio, dia].sort() : progreso.diasEstudio;
  if (diaNuevo) {
    // Bono por racha: una vez al día, proporcional a los días seguidos
    xp += XP.streak_bonus_per_day * calcularRacha([...diasEstudio, ...(progreso.diasProtegidos ?? [])]).actual;
  }

  const base = { ...progreso, diasEstudio, porPregunta, repaso };
  const yaTenia = progreso.insignias ?? {};
  const insigniasNuevas = insigniasCumplidas(base).filter((b) => !yaTenia[b]);
  const fechaIso = new Date(datos.terminadoMs).toISOString();

  const intento: Intento = {
    id,
    fecha: fechaIso,
    modo: datos.modo,
    modoId: datos.modoId,
    area: datos.area,
    puntaje: datos.puntaje,
    totalPreguntas: datos.preguntas.length,
    respondidas,
    correctas,
    aprobado: datos.aprobado,
    duracionSegundos: Math.round((datos.terminadoMs - datos.inicioMs) / 1000),
    xp,
    insigniasNuevas,
    dominadas,
  };

  guardarProgreso({
    ...base,
    version: 1,
    intentos: [intento, ...progreso.intentos].slice(0, MAX_INTENTOS),
    totalRespondidas: progreso.totalRespondidas + respondidas,
    xp: (progreso.xp ?? 0) + xp,
    xpTotal: (progreso.xpTotal ?? 0) + xp,
    insignias: { ...yaTenia, ...Object.fromEntries(insigniasNuevas.map((b) => [b, fechaIso])) },
  });
  return intento;
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
