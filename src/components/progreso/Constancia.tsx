"use client";

import Link from "next/link";
import { FileCheck2, GraduationCap } from "lucide-react";
import { useProgreso } from "@/hooks/useProgreso";
import { PUNTOS_CORTO, nivelDe } from "@/lib/meritos";
import { COSTO_PROTECTOR_XP, calcularRacha, diaProtegible, diasDeRacha, ultimosDias, usarProtector } from "@/lib/storage";

const letraDia = new Intl.DateTimeFormat("es-CO", { weekday: "narrow" });
const nombreDia = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" });

/** Chulito dibujado a mano (trazo curvo), como el del profe en el cuaderno */
function Chulito() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 text-secondary-light" aria-hidden>
      <path d="M4 13.5 C6 15 7.6 17 9 19.5 C11.5 13 15.5 7.5 20.5 4" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Constancia de estudio (la «racha» internamente): días seguidos, nivel y asistencia de la semana.
 * Usa vocabulario de aula a propósito para no parecer otra app de idiomas.
 */
export default function Constancia() {
  const progreso = useProgreso();

  if (!progreso) return <div className="h-56 motion-safe:animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-700/60" aria-hidden />;

  const racha = calcularRacha(diasDeRacha(progreso));
  const xp = progreso.xp ?? 0;
  const nivel = nivelDe(progreso.xpTotal ?? 0).actual;
  const protegible = diaProtegible(progreso);
  const semana = ultimosDias(progreso.diasEstudio, progreso.diasProtegidos);
  // Si hoy ya estudió, el siguiente número se alcanza mañana
  const siguiente = racha.actual + 1;

  return (
    <section aria-labelledby="titulo-racha" className="space-y-5 rounded-3xl bg-tarjeta p-5 ring-1 ring-slate-200 dark:ring-slate-700/60">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="titulo-racha" className="text-lg">
            Constancia
          </h2>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="font-heading text-4xl font-extrabold tabular-nums">{racha.actual}</span>
            <span className="font-bold text-texto-tenue">{racha.actual === 1 ? "día de estudio" : "días de estudio seguidos"}</span>
          </p>
          <p className="mt-0.5 text-xs text-texto-tenue">Mejor marca: {racha.mejor}</p>
        </div>
        <Link
          href="/perfil"
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-resaltador-suave px-2.5 py-1 text-xs font-bold text-accent-dark"
        >
          <GraduationCap className="size-3.5" /> {nivel.nombre} · {xp.toLocaleString("es-CO")} {PUNTOS_CORTO}
        </Link>
      </div>

      {/* Excusa justificada (protector): solo cuando la constancia se rompió por un único día (ayer) */}
      {protegible && (
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200 dark:bg-slate-700/40 dark:ring-slate-700">
          <FileCheck2 className="size-6 shrink-0 text-secondary-light" />
          <p className="min-w-0 flex-1 text-sm">Ayer faltaste. Presenta una excusa justificada para conservar tu constancia.</p>
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

      {/* Asistencia de los últimos 7 días: chulitos a mano */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-texto-tenue">Asistencia de la semana</p>
        <ol className="grid grid-cols-7 gap-1.5 text-center" aria-label="Asistencia de los últimos 7 días">
          {semana.map(({ dia, fecha, estudio, protegido }, i) => {
            const esHoy = i === semana.length - 1;
            const hoyPendiente = esHoy && !estudio && !protegido;
            return (
              <li
                key={dia}
                className="space-y-1"
                aria-label={`${nombreDia.format(fecha)}: ${estudio ? "asististe" : protegido ? "falta excusada" : esHoy ? "pendiente" : "sin asistencia"}`}
              >
                <span className={`block text-[11px] font-bold uppercase ${esHoy ? "text-texto" : "text-texto-tenue"}`}>{letraDia.format(fecha)}</span>
                <span
                  className={`mx-auto grid size-9 place-items-center rounded-md text-xs ${
                    estudio
                      ? "bg-verde-suave"
                      : hoyPendiente
                        ? "border-2 border-dashed border-secondary-light bg-resaltador-suave font-bold"
                        : "border border-slate-200 text-texto-tenue dark:border-slate-700"
                  }`}
                >
                  {estudio ? <Chulito /> : protegido ? <FileCheck2 className="size-4 text-texto-tenue" /> : fecha.getDate()}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="text-sm">
          {racha.estudioHoy ? (
            <>Hoy ya cuenta. Vuelve mañana y llegas a <span className="font-bold">{siguiente}</span>.</>
          ) : (
            <>Termina la tarea de hoy y llegas a <span className="font-bold">{siguiente}</span>.</>
          )}
        </p>
      </div>

    </section>
  );
}
