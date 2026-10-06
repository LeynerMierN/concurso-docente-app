"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Crown, Lock, Shield, Sparkles, UserRound } from "lucide-react";
import config from "@data/app_config.json";
import IconoInsignia from "@/components/gamificacion/IconoInsignia";
import { usePerfil } from "@/hooks/usePerfil";
import { useProgreso } from "@/hooks/useProgreso";
import { CATEGORIAS } from "@/lib/categorias";
import { INSIGNIAS, avanceInsignias } from "@/lib/insignias";
import { CONTEXTOS, ROLES, guardarPerfil, perfilNuevo, type Perfil } from "@/lib/perfil";
import { COSTO_PROTECTOR_XP } from "@/lib/storage";

const tarjeta = "rounded-3xl bg-white p-5 ring-1 ring-slate-200 dark:bg-tarjeta dark:ring-slate-700/60";
const ESPECIALIDADES = CATEGORIAS.filter((c) => c.grupo === "especialidades_docentes");
const XP = config.gamification.xp_system;
const fechaCorta = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" });

const REGLAS_XP = [
  { texto: "Respuesta correcta", xp: XP.correct_answer },
  { texto: "Correcta la primera vez que ves la pregunta", xp: XP.correct_first_try },
  { texto: "Terminar una práctica o simulacro", xp: XP.complete_quiz },
  { texto: "Terminar el Simulacro Tipo ICFES / CNSC", xp: XP.complete_full_simulation },
  { texto: "Por cada día de racha (una vez al día)", xp: XP.streak_bonus_per_day },
];

export default function Pagina() {
  const { perfil, cargado } = usePerfil();
  const progreso = useProgreso();

  if (!cargado || !progreso) {
    return <div className="h-96 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-700/60" aria-hidden />;
  }

  const avance = avanceInsignias(progreso);
  const desbloqueadas = progreso.insignias ?? {};

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-2xl font-extrabold text-white">
          {perfil?.name ? perfil.name.trim()[0].toUpperCase() : <UserRound className="size-7" />}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold">{perfil?.name || "Mi perfil"}</h1>
          <p className="text-sm text-slate-500">
            {perfil ? ROLES.find((r) => r.id === perfil.role)?.nombre : "Configura tu perfil para personalizar tu preparación"}
          </p>
        </div>
      </header>

      {/* Se monta cuando el perfil ya cargó, así arranca con los datos guardados */}
      <FormularioPerfil inicial={perfil} />

      {/* Experiencia */}
      <section className={tarjeta} aria-labelledby="titulo-xp">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="titulo-xp" className="font-bold">
              Puntos de experiencia
            </h2>
            <p className="mt-1 flex items-baseline gap-1.5">
              <span className="font-heading text-4xl font-extrabold tabular-nums">{(progreso.xp ?? 0).toLocaleString("es-CO")}</span>
              <span className="font-semibold text-slate-500">XP disponibles</span>
            </p>
            <p className="text-xs text-slate-500">{(progreso.xpTotal ?? 0).toLocaleString("es-CO")} XP ganados en total</p>
          </div>
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent/15 text-accent">
            <Sparkles className="size-7" />
          </span>
        </div>
        <ul className="mt-4 divide-y divide-slate-100 text-sm dark:divide-slate-700">
          {REGLAS_XP.map(({ texto, xp }) => (
            <li key={texto} className="flex items-center justify-between gap-3 py-2">
              <span className="text-slate-600 dark:text-slate-300">{texto}</span>
              <span className="shrink-0 font-bold tabular-nums text-secondary">+{xp}</span>
            </li>
          ))}
          <li className="flex items-center justify-between gap-3 py-2">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Shield className="size-4 text-primary-light" /> Protector de racha (cubre un día perdido)
            </span>
            <span className="shrink-0 font-bold tabular-nums text-danger">−{COSTO_PROTECTOR_XP}</span>
          </li>
        </ul>
      </section>

      {/* Insignias */}
      <section className="space-y-3" aria-labelledby="titulo-insignias">
        <h2 id="titulo-insignias" className="font-bold">
          Insignias · {Object.keys(desbloqueadas).length}/{INSIGNIAS.length}
        </h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {INSIGNIAS.map((ins) => {
            const fecha = desbloqueadas[ins.id];
            const valor = Math.min(avance[ins.id] ?? 0, ins.meta);
            return (
              <li key={ins.id} className={`${tarjeta} flex gap-4 ${fecha ? "" : "opacity-90"}`}>
                <span
                  className={`grid size-14 shrink-0 place-items-center rounded-2xl ${
                    fecha ? "bg-accent text-white" : "bg-slate-100 text-slate-400 dark:bg-slate-700/60"
                  }`}
                >
                  {fecha ? <IconoInsignia nombre={ins.icono} className="size-8" /> : <Lock className="size-6" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-bold leading-snug">{ins.titulo}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{ins.descripcion}</p>
                  {fecha ? (
                    <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-secondary">
                      <Check className="size-3.5" /> Desbloqueada el {fechaCorta.format(new Date(fecha))}
                    </p>
                  ) : (
                    <div className="mt-2">
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${(valor / ins.meta) * 100}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-slate-500 tabular-nums">
                        {valor}/{ins.meta} {ins.unidad}
                      </p>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <Link href="/premium" className={`${tarjeta} flex items-center gap-4 transition hover:ring-accent`}>
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
          <Crown className="size-6" />
        </span>
        <span className="flex-1">
          <span className="block font-semibold">Modo Premium</span>
          <span className="block text-sm text-slate-500">Conoce lo que viene</span>
        </span>
        <ChevronRight className="size-5 text-slate-400" />
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
        : "bg-white ring-1 ring-slate-200 dark:bg-tarjeta dark:ring-slate-700/60"
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
      <p className="text-center text-xs text-slate-500">Se guarda solo en este dispositivo.</p>
    </form>
  );
}
