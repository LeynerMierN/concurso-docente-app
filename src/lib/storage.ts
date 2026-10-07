import config from "@data/app_config.json";
import { insigniasCumplidas } from "@/lib/insignias";
import { guardarProgreso, leerProgreso, type Intento } from "@/lib/progreso";
import { calcularRacha, diaLocal } from "@/lib/racha";
import { estadoRepaso, registrarRespuesta, type MapaRepaso } from "@/lib/repaso";
import type { ModoExamen, Pregunta } from "@/types/exam";

/*
 * Registro de intentos terminados: XP, insignias y repaso. Necesita el banco de preguntas (insignias),
 * así que solo lo importan las pantallas de examen. Todo lo de lectura vive en progreso.ts y se reexporta aquí.
 */
export * from "@/lib/progreso";

const XP = config.gamification.xp_system;
/** Modo del config que otorga el bono de simulacro completo */
const MODO_SIMULACRO_COMPLETO = "simulacro_oficial_100";
const MAX_INTENTOS = 300;

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
