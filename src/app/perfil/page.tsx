"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Crown, FileCheck2, GraduationCap, UserRound } from "lucide-react";
import config from "@data/app_config.json";
import Medalla from "@/components/premios/Medalla";
import Premiacion, { type Premio } from "@/components/premios/Premiacion";
import Trofeo from "@/components/premios/Trofeo";
import { usePerfil } from "@/hooks/usePerfil";
import { useProgreso } from "@/hooks/useProgreso";
import { CATEGORIAS } from "@/lib/categorias";
import { INSIGNIAS, avanceInsignias } from "@/lib/insignias";
import { NIVELES, PUNTOS, PUNTOS_CORTO, TROFEOS, nivelDe, trofeosGanados } from "@/lib/meritos";
import { CONTEXTOS, ROLES, guardarPerfil, perfilNuevo, type Perfil } from "@/lib/perfil";
import { COSTO_PROTECTOR_XP } from "@/lib/storage";

const tarjeta = "rounded-3xl bg-tarjeta p-5 ring-1 ring-slate-200 dark:ring-slate-700/60";
const ESPECIALIDADES = CATEGORIAS.filter((c) => c.grupo === "especialidades_docentes");
const XP = config.gamification.xp_system;
const fechaCorta = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" });

const REGLAS_XP = [
  { texto: "Respuesta correcta", xp: XP.correct_answer },
  { texto: "Correcta la primera vez que ves la pregunta", xp: XP.correct_first_try },
  { texto: "Terminar una práctica o simulacro", xp: XP.complete_quiz },
  { texto: "Terminar el Simulacro Tipo ICFES / CNSC", xp: XP.complete_full_simulation },
  { texto: "Por cada día de constancia (una vez al día)", xp: XP.streak_bonus_per_day },
];

export default function Pagina() {
  const { perfil, cargado } = usePerfil();
  const progreso = useProgreso();
  const [premioVisto, setPremioVisto] = useState<Premio | null>(null);

  if (!cargado || !progreso) {
    return <div className="h-96 motion-safe:animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-700/60" aria-hidden />;
  }

  const avance = avanceInsignias(progreso);
  const desbloqueadas = progreso.insignias ?? {};
  const trofeos = new Set(trofeosGanados(progreso.intentos));
  const nivel = nivelDe(progreso.xpTotal ?? 0);
  const ganados = trofeos.size + Object.keys(desbloqueadas).length;

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-2xl font-extrabold text-white">
          {perfil?.name ? perfil.name.trim()[0].toUpperCase() : <UserRound className="size-7" />}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold">{perfil?.name || "Mi perfil"}</h1>
          <p className="text-sm text-texto-tenue">
            {perfil ? ROLES.find((r) => r.id === perfil.role)?.nombre : "Configura tu perfil para personalizar tu preparación"}
          </p>
        </div>
      </header>

      {/* Se monta cuando el perfil ya cargó, así arranca con los datos guardados */}
      <FormularioPerfil inicial={perfil} />

      {/* Escalafón del aspirante: nivel según los puntos de mérito acumulados */}
      <section className={tarjeta} aria-labelledby="titulo-nivel">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="titulo-nivel" className="text-sm font-semibold text-texto-tenue">
              Tu escalafón de aspirante
            </h2>
            <p className="mt-1 font-heading text-2xl font-extrabold">
              Nivel {nivel.actual.numero} · {nivel.actual.nombre}
            </p>
            <p className="text-sm text-texto-tenue">
              {(progreso.xpTotal ?? 0).toLocaleString("es-CO")} {PUNTOS} ganados ·{" "}
              {(progreso.xp ?? 0).toLocaleString("es-CO")} disponibles
            </p>
          </div>
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary-light dark:bg-primary-light/15">
            <GraduationCap className="size-7" />
          </span>
        </div>

        <div className="mt-4">
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
            <div className="h-full rounded-full barra-resaltador" style={{ width: `${nivel.avance * 100}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-texto-tenue">
            {nivel.siguiente
              ? `Te faltan ${nivel.faltan.toLocaleString("es-CO")} ${PUNTOS_CORTO} para ${nivel.siguiente.nombre}.`
              : "Llegaste al nivel más alto. ¡Felicitaciones!"}
          </p>
        </div>

        {/* Escalera de niveles */}
        <ol className="mt-4 grid grid-cols-3 gap-2 text-center text-xs md:grid-cols-6">
          {NIVELES.map((n) => {
            const alcanzado = n.numero <= nivel.actual.numero;
            return (
              <li
                key={n.numero}
                className={`rounded-xl px-1 py-2 ${
                  n.numero === nivel.actual.numero
                    ? "bg-primary font-bold text-white"
                    : alcanzado
                      ? "bg-primary/10 font-semibold text-primary-light dark:bg-primary-light/15"
                      : "bg-slate-50 text-texto-tenue dark:bg-slate-700/40"
                }`}
              >
                <span className="block text-[10px] opacity-80">Nivel {n.numero}</span>
                {n.nombre}
              </li>
            );
          })}
        </ol>

        <details className="mt-4 text-sm">
          <summary className="cursor-pointer font-semibold text-primary-light">Cómo ganar {PUNTOS}</summary>
          <ul className="mt-2 divide-y divide-slate-100 dark:divide-slate-700">
            {REGLAS_XP.map(({ texto, xp }) => (
              <li key={texto} className="flex items-center justify-between gap-3 py-2">
                <span className="text-slate-600 dark:text-slate-300">{texto}</span>
                <span className="shrink-0 font-bold tabular-nums text-secondary-light">+{xp}</span>
              </li>
            ))}
            <li className="flex items-center justify-between gap-3 py-2">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <FileCheck2 className="size-4 text-primary-light" /> Excusa justificada (cubre un día que faltaste)
              </span>
              <span className="shrink-0 font-bold tabular-nums text-danger dark:text-danger-light">−{COSTO_PROTECTOR_XP}</span>
            </li>
          </ul>
        </details>
      </section>

      {/* Vitrina: trofeos de simulacros y distinciones temáticas */}
      <section className={tarjeta} aria-labelledby="titulo-vitrina">
        <h2 id="titulo-vitrina" className="font-bold">
          Vitrina de premios · {ganados}/{TROFEOS.length + INSIGNIAS.length}
        </h2>
        <p className="mt-0.5 text-sm text-texto-tenue">Toca un premio ganado para ver su ceremonia.</p>

        <h3 className="mt-4 text-xs font-bold uppercase tracking-wide text-texto-tenue">Trofeos de simulacro</h3>
        <ul className="mt-2 grid grid-cols-2 gap-3 border-b-8 border-tablero-marco pb-3 md:grid-cols-4">
          {TROFEOS.map((t) => {
            const ganado = trofeos.has(t.id);
            return (
              <li key={t.id}>
                <button
                  type="button"
                  disabled={!ganado}
                  onClick={() => setPremioVisto({ tipo: "trofeo", trofeo: t })}
                  className="flex h-full w-full flex-col items-center gap-1 rounded-2xl p-2 text-center transition enabled:hover:bg-slate-50 enabled:active:scale-95 dark:enabled:hover:bg-slate-700/40"
                >
                  <Trofeo metal={t.metal} forma={t.forma} tamano={64} brillo={ganado} bloqueado={!ganado} className={ganado ? "premio-flotar" : ""} />
                  <span className="text-sm font-semibold leading-tight">{t.titulo}</span>
                  <span className="text-xs leading-snug text-texto-tenue">{t.descripcion}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-texto-tenue">Distinciones</h3>
        <ul className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
          {INSIGNIAS.map((ins) => {
            const fecha = desbloqueadas[ins.id];
            const valor = Math.min(avance[ins.id] ?? 0, ins.meta);
            return (
              <li key={ins.id}>
                <button
                  type="button"
                  disabled={!fecha}
                  onClick={() => setPremioVisto({ tipo: "medalla", insignia: ins })}
                  className="flex h-full w-full flex-col items-center gap-1 rounded-2xl p-2 text-center transition enabled:hover:bg-slate-50 enabled:active:scale-95 dark:enabled:hover:bg-slate-700/40"
                >
                  <Medalla icono={ins.icono} tamano={52} bloqueada={!fecha} balanceo={!!fecha} />
                  <span className="text-sm font-semibold leading-tight">{ins.titulo}</span>
                  {fecha ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary-light">
                      <Check className="size-3.5" /> {fechaCorta.format(new Date(fecha))}
                    </span>
                  ) : (
                    <span className="w-full">
                      <span className="block h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
                        <span className="block h-full rounded-full bg-accent" style={{ width: `${(valor / ins.meta) * 100}%` }} />
                      </span>
                      <span className="mt-1 block text-xs tabular-nums text-texto-tenue">
                        {valor}/{ins.meta} {ins.unidad}
                      </span>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {premioVisto && <Premiacion premios={[premioVisto]} repeticion onCerrar={() => setPremioVisto(null)} />}

      <Link href="/premium" className={`${tarjeta} flex items-center gap-4 transition hover:ring-accent`}>
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent-dark">
          <Crown className="size-6" />
        </span>
        <span className="flex-1">
          <span className="block font-semibold">Modo Premium</span>
          <span className="block text-sm text-texto-tenue">Conoce lo que viene</span>
        </span>
        <ChevronRight className="size-5 text-texto-tenue" />
      </Link>
    </div>
  );
}

function FormularioPerfil({ inicial }: { inicial: Perfil | null }) {
  const [datos, setDatos] = useState<Perfil>(inicial ?? perfilNuevo());
  const [guardado, setGuardado] = useState(false);
  const esDirectivo = datos.role === "directivo_docente";

  const cambiar = (cambios: Partial<Perfil>) => {
    setDatos((d) => ({ ...d, ...cambios }));
    setGuardado(false);
  };

  const opcion = (activa: boolean) =>
    `rounded-2xl px-4 py-3 text-left text-sm transition ${
      activa
        ? "bg-primary font-semibold text-white"
        : "bg-tarjeta ring-1 ring-slate-200 dark:ring-slate-700/60"
    }`;

  return (
    <form
      className={`${tarjeta} space-y-5`}
      onSubmit={(e) => {
        e.preventDefault();
        guardarPerfil({ ...datos, name: datos.name.trim(), specialty: esDirectivo ? "" : datos.specialty || "preescolar_primaria" });
        setGuardado(true);
      }}
    >
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">Nombre</span>
        <input
          type="text"
          value={datos.name}
          onChange={(e) => cambiar({ name: e.target.value })}
          placeholder="¿Cómo te llamamos?"
          maxLength={40}
          autoComplete="given-name"
          className="w-full rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary-light dark:bg-slate-700/40 dark:ring-slate-700"
        />
      </label>

      <fieldset className="space-y-1.5">
        <legend className="text-sm font-semibold">Aspiras a</legend>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((r) => (
            <button key={r.id} type="button" aria-pressed={datos.role === r.id} onClick={() => cambiar({ role: r.id })} className={opcion(datos.role === r.id)}>
              <span className="block">{r.nombre}</span>
              <span className="block text-xs opacity-80">Umbral {r.umbral}/100</span>
            </button>
          ))}
        </div>
      </fieldset>

      {esDirectivo ? (
        <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-700/40 dark:text-slate-300">
          Como directivo, tu ruta incluye las cuatro gestiones: directiva, académica, administrativa y comunitaria.
        </p>
      ) : (
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Especialidad</span>
          <select
            value={datos.specialty}
            onChange={(e) => cambiar({ specialty: e.target.value })}
            className="w-full rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary-light dark:bg-slate-700/40 dark:ring-slate-700"
          >
            {ESPECIALIDADES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
      )}

      <fieldset className="space-y-1.5">
        <legend className="text-sm font-semibold">Contexto de la plaza</legend>
        <div className="grid grid-cols-2 gap-2">
          {CONTEXTOS.map((c) => (
            <button key={c.id} type="button" aria-pressed={datos.context === c.id} onClick={() => cambiar({ context: c.id })} className={opcion(datos.context === c.id)}>
              {c.nombre}
            </button>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 font-semibold text-white active:scale-[0.98]"
      >
        {guardado ? (
          <>
            <Check className="size-5" /> Guardado
          </>
        ) : (
          "Guardar perfil"
        )}
      </button>
      <p className="text-center text-xs text-texto-tenue">Se guarda solo en este dispositivo.</p>
    </form>
  );
}
