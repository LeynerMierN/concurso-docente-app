import datos from "@data/fichas_normativas.json";

export const CATEGORIAS_FICHAS = ["Inclusión", "Convivencia Escolar", "Evaluación", "Normativa General"] as const;
export type CategoriaFicha = (typeof CATEGORIAS_FICHAS)[number];

/** Ficha de repaso, tal como viene en data/fichas_normativas.json */
export interface Ficha {
  id: string;
  categoria: CategoriaFicha;
  concepto: string;
  sigla: string;
  pregunta_disparadora: string;
  definicion: string;
  norma: string;
  puntos_clave: string[];
  /** Distractor típico del examen: la respuesta que parece correcta pero no lo es */
  error_frecuente: string;
}

export const FICHAS = datos as Ficha[];

export function fichasDe(categoria: CategoriaFicha | "Todas"): Ficha[] {
  return categoria === "Todas" ? FICHAS : FICHAS.filter((f) => f.categoria === categoria);
}
