import type { ModoExamen, Pregunta } from "@/types/exam";

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
}

const VACIO: Progreso = { version: 1, intentos: [], diasEstudio: [], totalRespondidas: 0, porPregunta: {} };

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
  } catch {
    // Sin almacenamiento disponible: el progreso no se conserva, la app sigue funcionando
  }
}

/** Fecha local en formato YYYY-MM-DD */
export function diaLocal(fecha: Date | number): string {
  const d = new Date(fecha);
  const dos = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

function diaAnterior(dia: string): string {
  const [a, m, d] = dia.split("-").map(Number);
  return diaLocal(new Date(a, m - 1, d - 1));
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
}

/** Registra un intento terminado. Es idempotente: una misma sesión solo cuenta una vez. */
export function registrarIntento(datos: DatosIntento): void {
  const progreso = leerProgreso();
  const id = `${datos.modo}-${datos.inicioMs}`;
  if (progreso.intentos.some((i) => i.id === id)) return;

  const porPregunta = { ...progreso.porPregunta };
  let respondidas = 0;
  let correctas = 0;
  for (const p of datos.preguntas) {
    const r = datos.respuestas[p.id];
    if (!r) continue;
    const acierto = r === p.respuesta_correcta;
    respondidas++;
    if (acierto) correctas++;
    const previo = porPregunta[p.id] ?? { respondidas: 0, correctas: 0 };
    porPregunta[p.id] = { respondidas: previo.respondidas + 1, correctas: previo.correctas + (acierto ? 1 : 0) };
  }

  const intento: Intento = {
    id,
    fecha: new Date(datos.terminadoMs).toISOString(),
    modo: datos.modo,
    area: datos.area,
    puntaje: datos.puntaje,
    totalPreguntas: datos.preguntas.length,
    respondidas,
    correctas,
    aprobado: datos.aprobado,
    duracionSegundos: Math.round((datos.terminadoMs - datos.inicioMs) / 1000),
  };

  // Un intento sin respuestas no cuenta como día de estudio
  const dia = diaLocal(datos.terminadoMs);
  const diasEstudio =
    respondidas > 0 && !progreso.diasEstudio.includes(dia) ? [...progreso.diasEstudio, dia].sort() : progreso.diasEstudio;

  guardarProgreso({
    version: 1,
    intentos: [intento, ...progreso.intentos].slice(0, MAX_INTENTOS),
    diasEstudio,
    totalRespondidas: progreso.totalRespondidas + respondidas,
    porPregunta,
  });
}

/**
 * Racha de días consecutivos estudiando. Sigue viva si el último día fue hoy o ayer
 * (todavía se puede estudiar hoy para no perderla).
 */
export function calcularRacha(diasEstudio: string[], hoy: Date = new Date()): { actual: number; mejor: number; estudioHoy: boolean } {
  const dias = new Set(diasEstudio);
  const diaHoy = diaLocal(hoy);
  const estudioHoy = dias.has(diaHoy);

  let actual = 0;
  let cursor = estudioHoy ? diaHoy : diaAnterior(diaHoy);
  while (dias.has(cursor)) {
    actual++;
    cursor = diaAnterior(cursor);
  }

  let mejor = 0;
  let corrida = 0;
  let previo: string | null = null;
  for (const dia of [...dias].sort()) {
    corrida = previo !== null && diaAnterior(dia) === previo ? corrida + 1 : 1;
    mejor = Math.max(mejor, corrida);
    previo = dia;
  }

  return { actual, mejor, estudioHoy };
}

/** Preguntas contestadas en un día (por defecto hoy), para la meta diaria */
export function respondidasEnDia(progreso: Progreso, dia: string = diaLocal(new Date())): number {
  return progreso.intentos
    .filter((i) => diaLocal(new Date(i.fecha)) === dia)
    .reduce((suma, i) => suma + (i.respondidas ?? i.totalPreguntas), 0);
}

/** Últimos `n` días (del más antiguo a hoy) con la marca de si hubo estudio */
export function ultimosDias(diasEstudio: string[], n = 7, hoy: Date = new Date()) {
  const estudiados = new Set(diasEstudio);
  return Array.from({ length: n }, (_, i) => {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - (n - 1 - i));
    const dia = diaLocal(fecha);
    return { dia, fecha, estudio: estudiados.has(dia) };
  });
}
