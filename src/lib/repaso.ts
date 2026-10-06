import { diaLocal, sumarDias } from "@/lib/racha";

/**
 * Repaso de errores con repetición espaciada (sistema de cajas de Leitner):
 * - Fallar una pregunta la pone en la caja 1, para repasar hoy mismo.
 * - Acertarla cuando le toca repaso la sube de caja y aleja el próximo repaso.
 * - Al acertarla en la última caja queda dominada y sale del repaso.
 */
export const FILTRO_REPASO = "repaso";

/** Días de espera tras acertar en cada caja (caja 1 → +1 día, caja 2 → +3 días, caja 3 → dominada) */
const ESPERA_TRAS_ACIERTO: Record<number, number> = { 1: 1, 2: 3 };
const ULTIMA_CAJA = 3;

export interface EntradaRepaso {
  caja: number;
  /** Fecha (YYYY-MM-DD) a partir de la cual toca repasarla */
  proximo: string;
}

export type MapaRepaso = Record<string, EntradaRepaso>;

interface ProgresoRepaso {
  repaso?: MapaRepaso;
  porPregunta: Record<string, { respondidas: number; correctas: number }>;
}

/**
 * Estado del repaso. Para progresos guardados antes de esta función (sin `repaso`),
 * toda pregunta con algún error entra a la caja 1 para repasar hoy.
 */
export function estadoRepaso(p: ProgresoRepaso, hoy: Date = new Date()): MapaRepaso {
  if (p.repaso) return p.repaso;
  const dia = diaLocal(hoy);
  return Object.fromEntries(
    Object.entries(p.porPregunta)
      .filter(([, s]) => s.correctas < s.respondidas)
      .map(([id]) => [id, { caja: 1, proximo: dia }]),
  );
}

/**
 * Actualiza el repaso con una respuesta. Devuelve si la pregunta quedó dominada.
 * Un acierto solo avanza la caja si ya le tocaba repaso (evita «adelantar» el ciclo).
 */
export function registrarRespuesta(repaso: MapaRepaso, id: string, acierto: boolean, hoy: Date = new Date()): boolean {
  const dia = diaLocal(hoy);
  const entrada = repaso[id];
  if (!acierto) {
    repaso[id] = { caja: 1, proximo: dia };
    return false;
  }
  if (!entrada || entrada.proximo > dia) return false;
  if (entrada.caja >= ULTIMA_CAJA) {
    delete repaso[id];
    return true;
  }
  repaso[id] = { caja: entrada.caja + 1, proximo: sumarDias(dia, ESPERA_TRAS_ACIERTO[entrada.caja]) };
  return false;
}

/** Ids que toca repasar hoy, primero los de cajas más bajas (los más frágiles) */
export function pendientesHoy(p: ProgresoRepaso, hoy: Date = new Date()): string[] {
  const dia = diaLocal(hoy);
  return Object.entries(estadoRepaso(p, hoy))
    .filter(([, e]) => e.proximo <= dia)
    .sort(([, a], [, b]) => a.caja - b.caja)
    .map(([id]) => id);
}

/** Resumen para el inicio: pendientes de hoy, total en el ciclo y la fecha del siguiente repaso */
export function resumenRepaso(p: ProgresoRepaso, hoy: Date = new Date()) {
  const estado = estadoRepaso(p, hoy);
  const dia = diaLocal(hoy);
  const futuros = Object.values(estado).filter((e) => e.proximo > dia).map((e) => e.proximo).sort();
  return {
    hoy: pendientesHoy(p, hoy).length,
    enCiclo: Object.keys(estado).length,
    proximaFecha: futuros[0] ?? null,
    proximosEseDia: futuros.filter((f) => f === futuros[0]).length,
  };
}
