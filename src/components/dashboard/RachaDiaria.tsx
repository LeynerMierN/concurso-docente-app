"use client";

import Link from "next/link";
import { AlertTriangle, CalendarCheck2, Check, CheckCircle2, ChevronRight, ClipboardList, FileCheck2, GraduationCap } from "lucide-react";
import { useProgreso } from "@/hooks/useProgreso";
import { META_DIARIA_PREGUNTAS } from "@/lib/appConfig";
import { aciertoPorArea } from "@/lib/estadisticas";
import { PUNTOS_CORTO, nivelDe } from "@/lib/meritos";
import { COSTO_PROTECTOR_XP, calcularRacha, diaProtegible, diasDeRacha, respondidasEnDia, ultimosDias, usarProtector } from "@/lib/storage";

const letraDia = new Intl.DateTimeFormat("es-CO", { weekday: "narrow" });
const nombreDia = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" });

/**
 * Constancia de estudio (la «racha» internamente): días seguidos, tarea de hoy y asistencia de la semana.
 * Usa vocabulario de aula a propósito para no parecer otra app de idiomas.
 */
export default function RachaDiaria() {
  const progreso = useProgreso();

  if (!progreso) return <div className="h-56 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-700/60" aria-hidden />;

  const racha = calcularRacha(diasDeRacha(progreso));
  const xp = progreso.xp ?? 0;
  const nivel = nivelDe(progreso.xpTotal ?? 0).actual;
  const protegible = diaProtegible(progreso);
  const hoy = respondidasEnDia(progreso);
  const metaCumplida = hoy >= META_DIARIA_PREGUNTAS;
  const semana = ultimosDias(progreso.diasEstudio, progreso.diasProtegidos);
  const masDebil = aciertoPorArea(progreso)[0];
  const enRiesgo = racha.actual > 0 && !racha.estudioHoy;

  return (
    <section
      aria-labelledby="titulo-racha"
      className="space-y-5 rounded-3xl bg-white p-5 ring-1 ring-slate-200 dark:bg-tarjeta dark:ring-slate-700/60"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="titulo-racha" className="text-sm font-semibold text-slate-500">
            Constancia
          </h2>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tabular-nums">{racha.actual}</span>
            <span className="font-semibold text-slate-500">{racha.actual === 1 ? "día de estudio" : "días de estudio seguidos"}</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-500">Mejor marca: {racha.mejor}</p>
          <Link
            href="/perfil"
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary dark:bg-primary-light/15 dark:text-oro"
          >
            <GraduationCap className="size-3.5" /> {nivel.nombre} · {xp.toLocaleString("es-CO")} {PUNTOS_CORTO}
          </Link>
        </div>
        <span
          className={`grid size-14 shrink-0 place-items-center rounded-2xl ${
            racha.actual > 0 ? "bg-primary/10 text-primary dark:bg-primary-light/15 dark:text-oro" : "bg-slate-100 text-slate-400 dark:bg-slate-700/60"
          }`}
        >
          <CalendarCheck2 className="size-8" />
        </span>
      </div>

      {/* Excusa justificada (protector): solo cuando la constancia se rompió por un único día (ayer) */}
      {protegible && (
        <div className="flex items-center gap-3 rounded-2xl bg-primary/5 p-3 ring-1 ring-primary/20 dark:bg-primary-light/10">
          <FileCheck2 className="size-6 shrink-0 text-primary-light" />
          <p className="min-w-0 flex-1 text-sm">
            Ayer faltaste. Presenta una excusa justificada para conservar tu constancia.
          </p>
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

      {/* Meta de hoy */}
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            {metaCumplida ? <CheckCircle2 className="size-4 text-secondary" /> : <ClipboardList className="size-4 text-primary-light" />}
            Tarea de hoy
          </span>
          <span className="tabular-nums">
            <span className="font-bold">{Math.min(hoy, META_DIARIA_PREGUNTAS)}</span>
            <span className="text-slate-500">/{META_DIARIA_PREGUNTAS} preguntas</span>
          </span>
        </div>
        <div
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={META_DIARIA_PREGUNTAS}
          aria-valuenow={Math.min(hoy, META_DIARIA_PREGUNTAS)}
          aria-label="Preguntas respondidas hoy"
        >
          <div
            className={`h-full rounded-full transition-all ${metaCumplida ? "bg-secondary" : "bg-primary-light"}`}
            style={{ width: `${Math.min(100, (hoy / META_DIARIA_PREGUNTAS) * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {metaCumplida
            ? "¡Tarea cumplida! Tu constancia de hoy está asegurada."
            : enRiesgo
              ? "Termina una práctica hoy para conservar tu constancia."
              : `Te faltan ${META_DIARIA_PREGUNTAS - hoy} preguntas para completar la tarea.`}
        </p>
      </div>

      {/* Asistencia de los últimos 7 días */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Asistencia de la semana</p>
        <ol className="grid grid-cols-7 gap-1.5 text-center" aria-label="Asistencia de los últimos 7 días">
          {semana.map(({ dia, fecha, estudio, protegido }, i) => {
            const esHoy = i === semana.length - 1;
            return (
              <li key={dia} className="space-y-1" aria-label={`${nombreDia.format(fecha)}: ${estudio ? "asististe" : protegido ? "falta excusada" : "sin asistencia"}`}>
                <span className="block text-[11px] font-medium uppercase text-slate-500">{letraDia.format(fecha)}</span>
                <span
                  className={`mx-auto grid size-8 place-items-center rounded-lg text-xs ${
                    estudio
                      ? "bg-secondary text-white"
                      : protegido
                        ? "bg-primary-light/15 text-primary-light"
                        : "bg-slate-100 text-slate-400 dark:bg-slate-700/60"
                  } ${esHoy ? "ring-2 ring-primary-light ring-offset-2 ring-offset-white dark:ring-offset-tarjeta" : ""}`}
                >
                  {estudio ? (
                    <Check className="size-4" strokeWidth={3} />
                  ) : protegido ? (
                    <FileCheck2 className="size-4" />
                  ) : (
                    fecha.getDate()
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {masDebil && (
        <Link
          href="/estadisticas"
          className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm transition hover:bg-slate-100 dark:bg-slate-700/40 dark:hover:bg-slate-700/60"
        >
          <AlertTriangle className="size-5 shrink-0 text-accent" />
          <span className="min-w-0 flex-1">
            Tu área más débil: <span className="font-semibold">{masDebil.area}</span> ({masDebil.pct}%)
          </span>
          <ChevronRight className="size-4 shrink-0 text-slate-400" />
        </Link>
      )}
    </section>
  );
}
