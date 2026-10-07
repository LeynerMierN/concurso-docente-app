"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, Check, ChevronRight, Crown, UserRound } from "lucide-react";
import { usePerfil } from "@/hooks/usePerfil";
import { CATEGORIAS } from "@/lib/categorias";
import { CONTEXTOS, ROLES, guardarPerfil, perfilNuevo, type Perfil } from "@/lib/perfil";

const tarjeta = "rounded-3xl bg-tarjeta p-5 ring-1 ring-slate-200 dark:ring-slate-700/60";
const ESPECIALIDADES = CATEGORIAS.filter((c) => c.grupo === "especialidades_docentes");

/** Perfil = configuración (nombre, cargo, especialidad, contexto). El nivel y los premios viven en Progreso */
export default function Pagina() {
  const { perfil, cargado } = usePerfil();

  if (!cargado) {
    return <div className="h-96 motion-safe:animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-700/60" aria-hidden />;
  }

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

      <Link href="/estadisticas#escalafon" className={`${tarjeta} flex items-center gap-4 transition hover:ring-primary-light`}>
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-verde-suave text-secondary-light">
          <BarChart3 className="size-6" />
        </span>
        <span className="flex-1">
          <span className="block font-bold">Tu nivel y tus premios</span>
          <span className="block text-sm text-texto-tenue">Están en Progreso, junto con tu avance</span>
        </span>
        <ChevronRight className="size-5 text-texto-tenue" />
      </Link>

      <Link href="/premium" className={`${tarjeta} flex items-center gap-4 transition hover:ring-accent`}>
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent-dark">
          <Crown className="size-6" />
        </span>
        <span className="flex-1">
          <span className="block font-bold">Modo Premium</span>
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
        guardarPerfil({ ...datos, name: datos.name.trim(), specialty: esDirectivo ? "" : datos.specialty });
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
          <span className="text-sm font-semibold">
            Especialidad <span className="font-normal text-texto-tenue">(opcional)</span>
          </span>
          <select
            value={datos.specialty}
            onChange={(e) => cambiar({ specialty: e.target.value })}
            className="w-full rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary-light dark:bg-slate-700/40 dark:ring-slate-700"
          >
            <option value="">Todavía no lo sé</option>
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
