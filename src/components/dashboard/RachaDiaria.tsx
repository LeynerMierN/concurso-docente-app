"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, ChevronRight, Flame, Shield, Sparkles, Target } from "lucide-react";
import { useProgreso } from "@/hooks/useProgreso";
import { META_DIARIA_PREGUNTAS } from "@/lib/appConfig";
import { aciertoPorArea } from "@/lib/estadisticas";
import { COSTO_PROTECTOR_XP, calcularRacha, diaProtegible, diasDeRacha, respondidasEnDia, ultimosDias, usarProtector } from "@/lib/storage";

const letraDia = new Intl.DateTimeFormat("es-CO", { weekday: "narrow" });
const nombreDia = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" });

/** Estado de la racha diaria: días seguidos, meta de preguntas de hoy y la semana */
export default function RachaDiaria() {
  const progreso = useProgreso();

  if (!progreso) return <div className="h-56 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-700/60" aria-hidden />;

  const racha = calcularRacha(diasDeRacha(progreso));
  const xp = progreso.xp ?? 0;
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
            Racha diaria
          </h2>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tabular-nums">{racha.actual}</span>
            <span className="font-semibold text-slate-500">{racha.actual === 1 ? "día seguido" : "días seguidos"}</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-500">Mejor racha: {racha.mejor}</p>
          <Link
            href="/perfil"
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent-dark dark:text-accent-light"
          >
            <Sparkles className="size-3.5" /> {xp.toLocaleString("es-CO")} XP
          </Link>
        </div>
        <span
          className={`grid size-14 shrink-0 place-items-center rounded-2xl ${
            racha.actual > 0 ? "bg-accent/15 text-accent" : "bg-slate-100 text-slate-400 dark:bg-slate-700/60"
          }`}
        >
          <Flame className="size-8" fill={racha.actual > 0 ? "currentColor" : "none"} />
        </span>
      </div>

      {/* Protector de racha: solo cuando la racha se rompió por un único día (ayer) */}
      {protegible && (
        <div className="flex items-center gap-3 rounded-2xl bg-primary/5 p-3 ring-1 ring-primary/20 dark:bg-primary-light/10">
          <Shield className="size-6 shrink-0 text-primary-light" />
          <p className="min-w-0 flex-1 text-sm">
            Ayer no estudiaste. Usa un protector para no perder tu racha.
          </p>
          <button
            type="button"
            onClick={() => usarProtector()}
            disabled={xp < COSTO_PROTECTOR_XP}
            title={xp < COSTO_PROTECTOR_XP ? `Necesitas ${COSTO_PROTECTOR_XP} XP` : undefined}
            className="shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
          >
            {COSTO_PROTECTOR_XP} XP
          </button>
        </div>
      )}

      {/* Meta de hoy */}
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            {metaCumplida ? <CheckCircle2 className="size-4 text-secondary" /> : <Target className="size-4 text-primary-light" />}
            Meta de hoy
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
            ? "¡Meta cumplida! Tu racha de hoy está asegurada."
            : enRiesgo
              ? "Termina una práctica hoy para no perder tu racha."
              : `Te faltan ${META_DIARIA_PREGUNTAS - hoy} preguntas para la meta.`}
        </p>
      </div>

      {/* Últimos 7 días */}
      <ol className="grid grid-cols-7 gap-1.5 text-center" aria-label="Estudio de los últimos 7 días">
        {semana.map(({ dia, fecha, estudio, protegido }, i) => {
          const esHoy = i === semana.length - 1;
          return (
            <li key={dia} className="space-y-1" aria-label={`${nombreDia.format(fecha)}: ${estudio ? "estudiaste" : protegido ? "día protegido" : "sin estudio"}`}>
              <span className="block text-[11px] font-medium uppercase text-slate-500">{letraDia.format(fecha)}</span>
              <span
                className={`mx-auto grid size-8 place-items-center rounded-full text-xs ${
                  estudio
                    ? "bg-accent text-white"
                    : protegido
                      ? "bg-primary-light/15 text-primary-light"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-700/60"
                } ${esHoy ? "ring-2 ring-primary-light ring-offset-2 ring-offset-white dark:ring-offset-tarjeta" : ""}`}
              >
                {estudio ? (
                  <Flame className="size-4" fill="currentColor" />
                ) : protegido ? (
                  <Shield className="size-4" fill="currentColor" />
                ) : (
                  fecha.getDate()
                )}
              </span>
            </li>
          );
        })}
      </ol>

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
