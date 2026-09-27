"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Award, CheckCircle2, ClipboardList, Flame, TrendingUp, XCircle } from "lucide-react";
import { PREGUNTAS, UMBRAL_DOCENTE_AULA, macroArea, obtenerPregunta } from "@/lib/preguntas";
import { calcularRacha, leerProgreso, type Progreso } from "@/lib/storage";

const formatoFecha = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const TODAS_LAS_MACRO_AREAS = [...new Set(PREGUNTAS.map((p) => macroArea(p.area)))];

function aciertoPorArea(progreso: Progreso) {
  const acumulado = new Map<string, { respondidas: number; correctas: number }>();
  for (const [id, stats] of Object.entries(progreso.porPregunta)) {
    const pregunta = obtenerPregunta(id);
    if (!pregunta) continue;
    const area = macroArea(pregunta.area);
    const previo = acumulado.get(area) ?? { respondidas: 0, correctas: 0 };
    acumulado.set(area, { respondidas: previo.respondidas + stats.respondidas, correctas: previo.correctas + stats.correctas });
  }
  return [...acumulado.entries()]
    .map(([area, { respondidas, correctas }]) => ({ area, respondidas, pct: Math.round((correctas / respondidas) * 100) }))
    .sort((a, b) => a.pct - b.pct || b.respondidas - a.respondidas);
}

const tarjeta = "rounded-3xl bg-white p-5 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800";

/** Resumen de progreso guardado en localStorage: racha, acierto por área y últimos simulacros */
export default function TuProgreso() {
  const [progreso, setProgreso] = useState<Progreso | null>(null);

  useEffect(() => {
    const cargar = () => setProgreso(leerProgreso());
    cargar();
    // Si el usuario termina un intento en otra pestaña, refrescamos
    window.addEventListener("storage", cargar);
    return () => window.removeEventListener("storage", cargar);
  }, []);

  if (!progreso) return <div className="h-40 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" aria-hidden />;

  if (progreso.intentos.length === 0) {
    return (
      <section className={`${tarjeta} text-center`}>
        <TrendingUp className="mx-auto size-8 text-marca-500 dark:text-oro" />
        <h2 className="mt-2 font-semibold">Tu progreso aparecerá aquí</h2>
        <p className="mt-1 text-sm text-slate-500">Termina una práctica o un simulacro para empezar tu racha.</p>
        <Link href="/practica" className="mt-4 inline-block rounded-2xl bg-marca-600 px-5 py-2.5 text-sm font-semibold text-white">
          Practicar ahora
        </Link>
      </section>
    );
  }

  const racha = calcularRacha(progreso.diasEstudio);
  const areas = aciertoPorArea(progreso);
  const sinPracticar = TODAS_LAS_MACRO_AREAS.filter((a) => !areas.some((x) => x.area === a));
  const totalCorrectas = Object.values(progreso.porPregunta).reduce((s, p) => s + p.correctas, 0);
  const aciertoGlobal = progreso.totalRespondidas ? Math.round((totalCorrectas / progreso.totalRespondidas) * 100) : 0;
  const simulacros = progreso.intentos.filter((i) => i.modo === "simulacro").slice(0, 3);

  return (
    <section className="space-y-3" aria-labelledby="titulo-progreso">
      <h2 id="titulo-progreso" className="flex items-center gap-2 font-semibold">
        <TrendingUp className="size-5 text-marca-500" /> Tu progreso
      </h2>

      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-3">
        <div className={tarjeta}>
          <Flame className={`size-6 ${racha.actual > 0 ? "text-orange-500" : "text-slate-400"}`} fill={racha.actual > 0 ? "currentColor" : "none"} />
          <p className="mt-2 text-3xl font-extrabold tabular-nums">
            {racha.actual} <span className="text-base font-semibold text-slate-500">{racha.actual === 1 ? "día" : "días"}</span>
          </p>
          <p className="text-xs text-slate-500">
            {racha.actual > 0 && !racha.estudioHoy ? "¡Estudia hoy para no perderla!" : `Racha · mejor: ${racha.mejor}`}
          </p>
        </div>
        <div className={tarjeta}>
          <CheckCircle2 className="size-6 text-marca-500 dark:text-oro" />
          <p className="mt-2 text-3xl font-extrabold tabular-nums">{progreso.totalRespondidas.toLocaleString("es-CO")}</p>
          <p className="text-xs text-slate-500">preguntas resueltas · {aciertoGlobal}% acierto</p>
        </div>
      </div>

      {/* Acierto por área, la más débil primero */}
      <div className={tarjeta}>
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-semibold">Acierto por área</h3>
          <span className="flex items-center gap-1 text-[11px] text-slate-500">
            <span className="inline-block h-3 w-0.5 rounded bg-slate-500" /> meta {UMBRAL_DOCENTE_AULA}%
          </span>
        </div>
        <ul className="mt-4 space-y-3.5">
          {areas.map(({ area, pct, respondidas }, i) => (
            <li key={area}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate">{area}</span>
                  {i === 0 && areas.length > 1 && pct < 100 && (
                    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                      <AlertTriangle className="size-3" /> Más débil
                    </span>
                  )}
                </span>
                <span className="shrink-0 tabular-nums">
                  <span className="font-semibold">{pct}%</span>{" "}
                  <span className="text-xs text-slate-500">· {respondidas}</span>
                </span>
              </div>
              <div
                className="relative mt-1.5 h-2 rounded-full bg-slate-100 dark:bg-slate-800"
                title={`${area}: ${pct}% de acierto en ${respondidas} respuestas`}
              >
                <div className="h-full rounded-full bg-marca-500 dark:bg-marca-100" style={{ width: `${Math.max(pct, 2)}%` }} />
                <span
                  className="absolute -top-0.5 h-3 w-0.5 rounded bg-slate-500"
                  style={{ left: `${UMBRAL_DOCENTE_AULA}%` }}
                  aria-hidden
                />
              </div>
            </li>
          ))}
        </ul>
        {sinPracticar.length > 0 && (
          <p className="mt-4 text-xs text-slate-500">
            <span className="font-semibold">Sin practicar:</span> {sinPracticar.join(" · ")}
          </p>
        )}
      </div>

      {/* Últimos simulacros */}
      <div className={tarjeta}>
        <h3 className="flex items-center gap-2 font-semibold">
          <ClipboardList className="size-5 text-marca-500 dark:text-oro" /> Últimos simulacros
        </h3>
        {simulacros.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            Aún no has hecho simulacros.{" "}
            <Link href="/simulacro" className="font-semibold text-marca-600 dark:text-oro">
              Haz el primero
            </Link>
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {simulacros.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <span>
                  <span className="block text-sm font-medium">{formatoFecha.format(new Date(s.fecha))}</span>
                  <span className="block text-xs text-slate-500">
                    {s.correctas}/{s.totalPreguntas} correctas
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-lg font-bold tabular-nums">{s.puntaje.toLocaleString("es-CO")}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      s.aprobado ? "bg-exito/15 text-emerald-700 dark:text-emerald-300" : "bg-error/10 text-error"
                    }`}
                  >
                    {s.aprobado ? <Award className="size-3" /> : <XCircle className="size-3" />}
                    {s.aprobado ? "Aprobado" : "No aprobado"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
