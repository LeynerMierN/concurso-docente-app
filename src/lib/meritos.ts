/**
 * Identidad propia de la gamificación: «puntos de mérito» (el concurso docente es un concurso de méritos),
 * niveles con nombre de formación académica y trofeos por simulacros.
 * Internamente siguen siendo los campos `xp` / `xpTotal` del progreso.
 */

export const PUNTOS = "puntos de mérito";
export const PUNTOS_CORTO = "pts";

export interface Nivel {
  numero: number;
  nombre: string;
  /** Puntos de mérito acumulados (xpTotal) necesarios para alcanzarlo */
  desde: number;
}

export const NIVELES: Nivel[] = [
  { numero: 1, nombre: "Aspirante", desde: 0 },
  { numero: 2, nombre: "Normalista", desde: 300 },
  { numero: 3, nombre: "Licenciatura", desde: 1000 },
  { numero: 4, nombre: "Especialización", desde: 2500 },
  { numero: 5, nombre: "Maestría", desde: 5000 },
  { numero: 6, nombre: "Doctorado", desde: 10000 },
];

/** Nivel actual, el siguiente y el avance (0–1) hacia él */
export function nivelDe(puntosTotales: number) {
  // Último nivel alcanzado (los niveles van en orden ascendente)
  const indice = NIVELES.reduce((ultimo, n, i) => (puntosTotales >= n.desde ? i : ultimo), 0);
  const actual = NIVELES[indice];
  const siguiente = NIVELES[indice + 1] ?? null;
  const avance = siguiente ? (puntosTotales - actual.desde) / (siguiente.desde - actual.desde) : 1;
  return { actual, siguiente, avance: Math.min(1, Math.max(0, avance)), faltan: siguiente ? siguiente.desde - puntosTotales : 0 };
}

export type Metal = "bronce" | "plata" | "oro";

export interface Trofeo {
  id: string;
  titulo: string;
  descripcion: string;
  metal: Metal;
  /** La copa es la forma del trofeo mayor (simulacro oficial) */
  forma: "trofeo" | "copa";
}

export const TROFEOS: Trofeo[] = [
  { id: "trofeo_bronce", titulo: "Trofeo de Bronce", descripcion: "Aprueba tu primer simulacro.", metal: "bronce", forma: "trofeo" },
  { id: "trofeo_plata", titulo: "Trofeo de Plata", descripcion: "Saca 75 o más en un simulacro.", metal: "plata", forma: "trofeo" },
  { id: "trofeo_oro", titulo: "Trofeo de Oro", descripcion: "Saca 90 o más en un simulacro.", metal: "oro", forma: "trofeo" },
  {
    id: "copa_cnsc",
    titulo: "Copa CNSC",
    descripcion: "Aprueba el Simulacro Tipo ICFES / CNSC completo.",
    metal: "oro",
    forma: "copa",
  },
];

/** Forma mínima de un intento para calcular trofeos (evita depender de storage) */
interface IntentoTrofeo {
  id: string;
  modo: string;
  modoId?: string;
  puntaje: number;
  aprobado: boolean;
}

/** Ids de los trofeos ganados con estos intentos (se calculan, no se guardan) */
export function trofeosGanados(intentos: IntentoTrofeo[]): string[] {
  const simulacros = intentos.filter((i) => i.modo === "simulacro");
  const ganados = new Set<string>();
  for (const s of simulacros) {
    if (s.aprobado) ganados.add("trofeo_bronce");
    if (s.puntaje >= 75) ganados.add("trofeo_plata");
    if (s.puntaje >= 90) ganados.add("trofeo_oro");
    if (s.aprobado && s.modoId === "simulacro_oficial_100") ganados.add("copa_cnsc");
  }
  return TROFEOS.filter((t) => ganados.has(t.id)).map((t) => t.id);
}
