import { BarChart3, BookOpenCheck, House, Landmark, type LucideIcon } from "lucide-react";

export interface Subenlace {
  ruta: string;
  etiqueta: string;
}

export interface Pestana {
  id: string;
  etiqueta: string;
  ruta: string;
  Icono: LucideIcon;
  /** Rutas que cuentan como «dentro» de la pestaña (para marcarla activa) */
  activas: string[];
  /** Páginas de la pestaña que la barra lateral de escritorio lista debajo */
  subenlaces?: Subenlace[];
}

/**
 * Las cuatro pestañas de la app, iguales en la barra inferior y en la lateral.
 * Agrupan los módulos del config (navigation_modules) para que haya pocas puertas y claras:
 * todo lo que es estudiar va en Estudiar; todo lo que es avance, en Progreso.
 */
export const PESTANAS: Pestana[] = [
  { id: "inicio", etiqueta: "Inicio", ruta: "/", Icono: House, activas: ["/"] },
  {
    id: "estudiar",
    etiqueta: "Estudiar",
    ruta: "/estudiar",
    Icono: BookOpenCheck,
    activas: ["/estudiar", "/practica", "/simulacros", "/normatividad"],
    subenlaces: [
      { ruta: "/practica", etiqueta: "Práctica" },
      { ruta: "/simulacros", etiqueta: "Simulacro" },
      { ruta: "/normatividad", etiqueta: "Fichas de normas" },
    ],
  },
  {
    id: "progreso",
    etiqueta: "Progreso",
    ruta: "/estadisticas",
    Icono: BarChart3,
    activas: ["/estadisticas", "/perfil", "/premium"],
    subenlaces: [{ ruta: "/perfil", etiqueta: "Mi perfil" }],
  },
  { id: "concurso", etiqueta: "Concurso", ruta: "/convocatoria", Icono: Landmark, activas: ["/convocatoria"] },
];

/** Una ruta pertenece a otra si es igual o está debajo de ella («/» solo coincide consigo misma) */
export function coincideRuta(actual: string, ruta: string): boolean {
  return ruta === "/" ? actual === "/" : actual === ruta || actual.startsWith(`${ruta}/`);
}

export function pestanaActiva(actual: string): Pestana | undefined {
  return PESTANAS.find((p) => p.activas.some((r) => coincideRuta(actual, r)));
}
