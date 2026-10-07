"use client";

import Link from "next/link";
import { ChevronRight, FileCheck2 } from "lucide-react";
import { usePerfil } from "@/hooks/usePerfil";
import { useProgreso } from "@/hooks/useProgreso";
import { PUNTOS_CORTO } from "@/lib/meritos";
import { umbralDe } from "@/lib/perfil";
import {
  COSTO_PROTECTOR_XP,
  META_DIARIA_PREGUNTAS,
  calcularRacha,
  diaProtegible,
  diasDeRacha,
  proyeccionPuntaje,
  respondidasEnDia,
  usarProtector,
} from "@/lib/progreso";

/** Resumen de una mirada: tarea de hoy, días seguidos y proyección. El detalle está en Progreso */
export default function TuAvance() {
  const progreso = useProgreso();
  const { perfil } = usePerfil();
  // A quien aún no ha practicado no le mostramos ceros: su único paso es empezar
  if (!progreso || progreso.intentos.length === 0) return null;

  const hechas = Math.min(respondidasEnDia(progreso), META_DIARIA_PREGUNTAS);
  const racha = calcularRacha(diasDeRacha(progreso));
  const proyeccion = proyeccionPuntaje(progreso);
  const umbral = umbralDe(perfil);
  const protegible = diaProtegible(progreso);
  const xp = progreso.xp ?? 0;

  const dato = "rounded-2xl bg-slate-50 p-3 dark:bg-slate-700/40";

  return (
    <section aria-labelledby="titulo-avance" className="rounded-3xl bg-tarjeta p-4 ring-1 ring-slate-200 dark:ring-slate-700/60">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 id="titulo-avance" className="text-base">
          Tu avance
        </h2>
        <Link href="/estadisticas" className="flex items-center gap-0.5 text-sm font-bold text-primary-dark dark:text-secondary-light">
          Ver todo <ChevronRight className="size-4" />
        </Link>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2">
        <div className={dato}>
          <dt className="text-[11px] font-bold leading-tight text-texto-tenue">Tarea de hoy</dt>
          <dd className="mt-1 font-heading text-xl font-extrabold tabular-nums">
            {hechas}
            <span className="text-sm font-bold text-texto-tenue">/{META_DIARIA_PREGUNTAS}</span>
          </dd>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-[3px_10px_6px_2px] bg-slate-200 dark:bg-slate-700" aria-hidden>
            <div className="barra-resaltador h-full" style={{ width: `${(hechas / META_DIARIA_PREGUNTAS) * 100}%` }} />
          </div>
        </div>
        <div className={dato}>
          <dt className="text-[11px] font-bold leading-tight text-texto-tenue">Días seguidos</dt>
          <dd className="mt-1 font-heading text-xl font-extrabold tabular-nums">{racha.actual}</dd>
          <dd className="text-[11px] text-texto-tenue">Mejor: {racha.mejor}</dd>
        </div>
        <div className={dato}>
          <dt className="text-[11px] font-bold leading-tight text-texto-tenue">Proyección</dt>
          <dd className="mt-1 font-heading text-xl font-extrabold tabular-nums">{proyeccion === null ? "—" : proyeccion.toLocaleString("es-CO")}</dd>
          <dd className="text-[11px] leading-tight text-texto-tenue">{proyeccion === null ? "Sin simulacros" : `Para aprobar: ${umbral}`}</dd>
        </div>
      </dl>

      {/* Excusa justificada: solo cuando la constancia se rompió por un único día (ayer) */}
      {protegible && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-resaltador-suave p-3">
          <FileCheck2 className="size-5 shrink-0 text-accent-dark" />
          <p className="min-w-0 flex-1 text-sm leading-snug">Ayer faltaste. Con una excusa justificada conservas tus días seguidos.</p>
          <button
            type="button"
            onClick={() => usarProtector()}
            disabled={xp < COSTO_PROTECTOR_XP}
            title={xp < COSTO_PROTECTOR_XP ? `Necesitas ${COSTO_PROTECTOR_XP} ${PUNTOS_CORTO}` : undefined}
            className="shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
          >
            Usar · {COSTO_PROTECTOR_XP} {PUNTOS_CORTO}
          </button>
        </div>
      )}
    </section>
  );
}
