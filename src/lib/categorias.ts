import {
  Activity,
  Atom,
  Baby,
  BookMarked,
  BookOpen,
  BrainCircuit,
  Briefcase,
  Building2,
  Calculator,
  Compass,
  Cpu,
  Globe,
  GraduationCap,
  HeartHandshake,
  Landmark,
  Languages,
  Microscope,
  Sigma,
  Trees,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import config from "@data/app_config.json";

/** Íconos que la taxonomía nombra por texto; se importan uno a uno para no cargar toda la librería */
const ICONOS: Record<string, LucideIcon> = {
  Activity, Atom, Baby, BookMarked, BookOpen, BrainCircuit, Briefcase, Building2, Calculator, Compass, Cpu,
  Globe, GraduationCap, HeartHandshake, Landmark, Languages, Microscope, Sigma, Trees, UserCheck, Users,
};

export type GrupoCategoria = keyof typeof config.categories_taxonomy;

export const NOMBRE_GRUPO: Record<GrupoCategoria, string> = {
  core_transversal: "Núcleo común",
  especialidades_docentes: "Especialidades docentes",
  directivos_docentes: "Directivos docentes",
  contextos_diferenciados: "Contexto rural y PDET",
};

export interface Categoria {
  id: string;
  nombre: string;
  grupo: GrupoCategoria;
  Icono: LucideIcon;
}

/** Categorías de data/app_config.json → categories_taxonomy, en su orden original */
export const CATEGORIAS: Categoria[] = (Object.entries(config.categories_taxonomy) as [GrupoCategoria, { id: string; name: string; icon: string }[]][])
  .flatMap(([grupo, lista]) =>
    lista.map((c) => ({ id: c.id, nombre: c.name, grupo, Icono: ICONOS[c.icon] ?? BookOpen })),
  );

const POR_ID = new Map(CATEGORIAS.map((c) => [c.id, c]));

export function obtenerCategoria(id: string): Categoria | undefined {
  return POR_ID.get(id);
}

export const GRUPOS = Object.keys(NOMBRE_GRUPO) as GrupoCategoria[];
