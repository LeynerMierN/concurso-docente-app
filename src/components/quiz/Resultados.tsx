"use client";

import { useEffect, useRef, useState } from "react";
import { Award, CheckCircle2, ChevronDown, CircleDashed, Clock, Flag, RotateCcw, Scale, XCircle } from "lucide-react";
import type { QuizRunner } from "@/hooks/useQuizRunner";
import { celebrarAprobacion } from "@/lib/celebrar";
import { formatoTiempo } from "@/lib/tiempo";

/** Pantalla final: puntaje, desglose por área y revisión pregunta por pregunta */
export default function Resultados({ runner }: { runner: QuizRunner }) {
  const { sesion, preguntas, resultado, segundosTranscurridos } = runner;
  const [soloErrores, setSoloErrores] = useState(false);
  const celebrado = useRef(false);

  const terminadoMs = sesion?.terminadoMs ?? 0;
  const aprobado = !!resultado?.aprobado;

  useEffect(() => {
    // Solo celebramos al terminar, no al volver a abrir unos resultados guardados
    if (aprobado && !celebrado.current && Date.now() - terminadoMs < 10_000) {
      celebrado.current = true;
      celebrarAprobacion();
    }
  }, [aprobado, terminadoMs]);

  if (!sesion || !resultado) return null;

  const revision = preguntas
    .map((p, i) => ({ p, i, elegida: sesion.respuestas[p.id] }))
    .filter(({ p, elegida }) => !soloErrores || elegida !== p.respuesta_correcta);

  return (
    <div className="space-y-6">
      {/* Puntaje */}
      <header
        className={`rounded-3xl p-6 text-center text-white shadow-lg ${
          aprobado ? "bg-gradient-to-br from-emerald-500 to-emerald-700" : "bg-gradient-to-br from-slate-600 to-slate-800"
        }`}
      >
        <p className="text-sm font-medium opacity-90">
          {sesion.config.modo === "simulacro" ? "Resultado del simulacro" : "Resultado de la práctica"}
        </p>
        <p className="mt-2 text-6xl font-extrabold tabular-nums">
          {resultado.porcentaje.toLocaleString("es-CO")}
          <span className="text-2xl font-semibold opacity-80">/100</span>
        </p>
        <span
          className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold ${
            aprobado ? "bg-oro text-slate-900" : "bg-error text-white"
          }`}
        >
          {aprobado ? <Award className="size-4" /> : <XCircle className="size-4" />}
          {aprobado ? "Aprobado" : "No aprobado"}
        </span>
        <p className="mt-2 text-xs opacity-80">Umbral: {resultado.umbral}/100</p>

        <dl className="mt-5 grid grid-cols-4 gap-2 text-center">
          {[
            { etiqueta: "Correctas", valor: resultado.correctas, Icono: CheckCircle2 },
            { etiqueta: "Incorrectas", valor: resultado.incorrectas, Icono: XCircle },
            { etiqueta: "Sin resp.", valor: resultado.sinResponder, Icono: CircleDashed },
            { etiqueta: "Tiempo", valor: formatoTiempo(segundosTranscurridos), Icono: Clock },
          ].map(({ etiqueta, valor, Icono }) => (
            <div key={etiqueta} className="rounded-2xl bg-white/10 px-1 py-2">
              <Icono className="mx-auto size-4 opacity-80" />
              <dd className="mt-1 font-bold tabular-nums">{valor}</dd>
              <dt className="text-[10px] opacity-80">{etiqueta}</dt>
            </div>
          ))}
        </dl>
      </header>

      {/* Desglose por área */}
      <section className="space-y-3 rounded-3xl bg-white p-5 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <h2 className="font-semibold">Aciertos por área</h2>
        <ul className="space-y-3">
          {Object.entries(resultado.desglosePorArea)
            .sort(([, a], [, b]) => a.correctas / a.total - b.correctas / b.total)
            .map(([area, { total, correctas }]) => {
              const pct = Math.round((correctas / total) * 100);
              return (
                <li key={area} className="space-y-1">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="min-w-0 text-slate-700 dark:text-slate-300">{area}</span>
                    <span className="shrink-0 font-semibold tabular-nums">
                      {correctas}/{total}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${pct >= resultado.umbral ? "bg-exito" : "bg-error"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
        </ul>
      </section>

      <button
        type="button"
        onClick={runner.reiniciar}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-marca-600 px-4 py-3.5 font-semibold text-white active:scale-[0.98]"
      >
        <RotateCcw className="size-5" /> Nuevo intento
      </button>

      {/* Revisión pregunta por pregunta */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Revisión</h2>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={soloErrores}
              onChange={(e) => setSoloErrores(e.target.checked)}
              className="size-4 accent-marca-600"
            />
            Solo errores
          </label>
        </div>

        {revision.length === 0 && (
          <p className="rounded-2xl bg-exito/10 p-4 text-center text-sm">¡Sin errores! Respondiste todo correctamente.</p>
        )}

        <ul className="space-y-3">
          {revision.map(({ p, i, elegida }) => {
            const opciones = runner.opcionesDe(p);
            const tuya = opciones.find((o) => o.id === elegida);
            const correcta = opciones.find((o) => o.id === p.respuesta_correcta);
            const acerto = elegida === p.respuesta_correcta;
            return (
              <li key={p.id}>
                <details className="group rounded-2xl bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                  <summary className="flex cursor-pointer list-none items-start gap-3 p-4">
                    {acerto ? (
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-exito" />
                    ) : elegida ? (
                      <XCircle className="mt-0.5 size-5 shrink-0 text-error" />
                    ) : (
                      <CircleDashed className="mt-0.5 size-5 shrink-0 text-slate-400" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        Pregunta {i + 1} · {p.tema}
                        {sesion.banderas.includes(p.id) && <Flag className="size-3 text-oro" fill="currentColor" />}
                      </span>
                      <span className="mt-0.5 block text-sm font-medium leading-snug">{p.pregunta}</span>
                    </span>
                    <ChevronDown className="mt-0.5 size-5 shrink-0 text-slate-400 transition group-open:rotate-180" />
                  </summary>

                  <div className="space-y-3 border-t border-slate-100 p-4 text-sm dark:border-slate-800">
                    <p className="leading-relaxed text-slate-600 dark:text-slate-400">{p.contexto}</p>
                    <div
                      className={`rounded-xl p-3 ${
                        acerto ? "bg-exito/10" : elegida ? "bg-error/10" : "bg-slate-100 dark:bg-slate-800"
                      }`}
                    >
                      <p className="text-xs font-semibold text-slate-500">Tu respuesta</p>
                      <p>{tuya ? `${tuya.letra}. ${tuya.texto}` : "Sin responder"}</p>
                    </div>
                    {!acerto && correcta && (
                      <div className="rounded-xl bg-exito/10 p-3">
                        <p className="text-xs font-semibold text-slate-500">Respuesta correcta</p>
                        <p>
                          {correcta.letra}. {correcta.texto}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Justificación</p>
                      <p className="leading-relaxed">{p.justificacion}</p>
                    </div>
                    <p className="flex items-start gap-1.5 text-xs text-slate-500">
                      <Scale className="mt-0.5 size-3.5 shrink-0" /> {p.norma_referencia}
                    </p>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
