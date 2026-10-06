import config from "@data/app_config.json";

const { local_storage_keys: CLAVES, user_profile_template: PLANTILLA } = config.data_schemas_for_state;
export const CLAVE_PERFIL = CLAVES.user_profile;
const EVENTO = "concurso-docente:perfil";

export type Rol = "docente_aula" | "directivo_docente";
export type Contexto = "no_rural" | "rural_pdet";

/** Perfil local con la forma de user_profile_template del config */
export interface Perfil {
  id: string;
  name: string;
  email: string;
  role: Rol;
  /** Id de la taxonomía (especialidades_docentes); vacío para directivos */
  specialty: string;
  context: Contexto;
  is_premium: boolean;
  /** Copias de lectura, sincronizadas desde el progreso */
  xp: number;
  streak_days: number;
  last_study_date: string;
  badges_unlocked: string[];
}

export const ROLES: { id: Rol; nombre: string; umbral: number }[] = [
  { id: "docente_aula", nombre: "Docente de aula", umbral: 60 },
  { id: "directivo_docente", nombre: "Directivo docente", umbral: 70 },
];

export const CONTEXTOS: { id: Contexto; nombre: string }[] = [
  { id: "no_rural", nombre: "No rural (urbano)" },
  { id: "rural_pdet", nombre: "Rural y zonas PDET" },
];

/** Perfil por defecto: la plantilla del config, con una especialidad válida de la taxonomía */
export function perfilNuevo(): Perfil {
  return {
    ...(PLANTILLA as unknown as Perfil),
    name: "",
    email: "",
    specialty: "preescolar_primaria",
    badges_unlocked: [],
  };
}

export function leerPerfil(): Perfil | null {
  try {
    const crudo = localStorage.getItem(CLAVE_PERFIL);
    return crudo ? { ...perfilNuevo(), ...(JSON.parse(crudo) as Partial<Perfil>) } : null;
  } catch {
    return null;
  }
}

export function guardarPerfil(perfil: Perfil): void {
  try {
    localStorage.setItem(CLAVE_PERFIL, JSON.stringify(perfil));
    window.dispatchEvent(new Event(EVENTO));
  } catch {
    // Sin almacenamiento: el perfil solo vive mientras la página está abierta
  }
}

/** Copia XP, racha e insignias al perfil (si existe) para respetar el esquema del config */
export function sincronizarPerfil(datos: { xp: number; rachaDias: number; ultimoDia: string; insignias: string[] }): void {
  const perfil = leerPerfil();
  if (!perfil) return;
  guardarPerfil({
    ...perfil,
    xp: datos.xp,
    streak_days: datos.rachaDias,
    last_study_date: datos.ultimoDia,
    badges_unlocked: datos.insignias,
  });
}

/** Umbral eliminatorio según el rol (60 docentes de aula, 70 directivos) */
export function umbralDe(perfil: Perfil | null): number {
  return ROLES.find((r) => r.id === perfil?.role)?.umbral ?? 60;
}

export const EVENTO_PERFIL = EVENTO;
