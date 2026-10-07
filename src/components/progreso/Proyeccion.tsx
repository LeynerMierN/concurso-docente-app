"use client";

import { usePerfil } from "@/hooks/usePerfil";
import { useProgreso } from "@/hooks/useProgreso";
import { proyeccionPuntaje } from "@/lib/progreso";
import { umbralDe } from "@/lib/perfil";

/** Proyección con los últimos simulacros: número grande, umbral marcado y un mensaje de esperanza concreto */
export default function Proyeccion() {
  const progreso = useProgreso();
  const { perfil, cargado } = usePerfil();
  if (!progreso || !cargado) return null;

  const puntaje = proyeccionPuntaje(progreso);
  if (puntaje === null) return null;

  const umbral = umbralDe(perfil);
  const encima = puntaje >= umbral;
  const faltan = Math.ceil(umbral - puntaje);

  return (
    <section aria-labelledby="titulo-proyeccion" className="rounded-3xl bg-verde-suave p-5">
      <h2 id="titulo-proyeccion" className="text-sm font-bold uppercase tracking-wide text-primary-dark dark:text-secondary-light">
        Tu proyección
      </h2>
      <p className="mt-1 flex items-baseline gap-1">
        <span className="font-heading text-5xl font-extrabold tabular-nums tracking-[-0.02em]">
          {puntaje.toLocaleString("es-CO")}
        </span>
        <span className="text-lg font-bold text-texto-tenue">/100</span>
      </p>

      {/* Barra con la marca del umbral del rol (60 aula, 70 directivo) */}
      <div className="relative mt-3 pt-5">
        <div
          className="h-3 overflow-hidden rounded-full bg-tarjeta"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={puntaje}
          aria-label="Proyección de puntaje"
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, puntaje)}%` }} />
        </div>
        <div className="absolute top-0 bottom-0 flex flex-col items-center" style={{ left: `${umbral}%` }}>
          <span className="-translate-x-1/2 text-[11px] font-bold whitespace-nowrap">Para aprobar: {umbral}</span>
          <span className="mt-0.5 h-5 w-0.5 -translate-x-1/2 bg-texto" aria-hidden />
        </div>
      </div>

      <p className="mt-3 text-[15px] leading-snug">
        {encima
          ? "Ya estás por encima del puntaje para aprobar. Sostenlo hasta el día del examen."
          : `Te faltan ${faltan} ${faltan === 1 ? "punto" : "puntos"} para el umbral. Tus errores repasados son el camino más corto.`}
      </p>
      <p className="mt-1 text-xs text-texto-tenue">Promedio de tus últimos 3 simulacros.</p>
    </section>
  );
}
