/** Utilidades de fechas locales y racha de estudio (sin dependencias, para evitar ciclos) */

/** Fecha local en formato YYYY-MM-DD */
export function diaLocal(fecha: Date | number): string {
  const d = new Date(fecha);
  const dos = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

export function diaAnterior(dia: string): string {
  const [a, m, d] = dia.split("-").map(Number);
  return diaLocal(new Date(a, m - 1, d - 1));
}

/**
 * Racha de días consecutivos estudiando. Sigue viva si el último día fue hoy o ayer
 * (todavía se puede estudiar hoy para no perderla). `dias` incluye los días protegidos.
 */
export function calcularRacha(dias: string[], hoy: Date = new Date()): { actual: number; mejor: number; estudioHoy: boolean } {
  const conjunto = new Set(dias);
  const diaHoy = diaLocal(hoy);
  const estudioHoy = conjunto.has(diaHoy);

  let actual = 0;
  let cursor = estudioHoy ? diaHoy : diaAnterior(diaHoy);
  while (conjunto.has(cursor)) {
    actual++;
    cursor = diaAnterior(cursor);
  }

  let mejor = 0;
  let corrida = 0;
  let previo: string | null = null;
  for (const dia of [...conjunto].sort()) {
    corrida = previo !== null && diaAnterior(dia) === previo ? corrida + 1 : 1;
    mejor = Math.max(mejor, corrida);
    previo = dia;
  }

  return { actual, mejor, estudioHoy };
}

/** Últimos `n` días (del más antiguo a hoy) con la marca de si hubo estudio o protector */
export function ultimosDias(estudiados: string[], protegidos: string[] = [], n = 7, hoy: Date = new Date()) {
  const e = new Set(estudiados);
  const p = new Set(protegidos);
  return Array.from({ length: n }, (_, i) => {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - (n - 1 - i));
    const dia = diaLocal(fecha);
    return { dia, fecha, estudio: e.has(dia), protegido: p.has(dia) };
  });
}

/** Suma (o resta) días a una fecha YYYY-MM-DD */
export function sumarDias(dia: string, dias: number): string {
  const [a, m, d] = dia.split("-").map(Number);
  return diaLocal(new Date(a, m - 1, d + dias));
}
