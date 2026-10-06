"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Award, CheckCircle2, ChevronDown, CircleDashed, Clock, Flag, RotateCcw, Scale, Sparkles, XCircle } from "lucide-react";
import Capibara from "@/components/mascota/Capibara";
import Diploma from "@/components/premios/Diploma";
import Medalla from "@/components/premios/Medalla";
import Premiacion, { type Premio } from "@/components/premios/Premiacion";
import Trofeo from "@/components/premios/Trofeo";
import { useProgreso } from "@/hooks/useProgreso";
import type { QuizRunner } from "@/hooks/useQuizRunner";
import { INSIGNIAS } from "@/lib/insignias";
import { PUNTOS, TROFEOS, nivelDe, trofeosGanados } from "@/lib/meritos";
import { celebrarAprobacion } from "@/lib/celebrar";
import { formatoTiempo } from "@/lib/tiempo";

/** Pantalla final: puntaje, desglose por área y revisión pregunta por pregunta */
export default function Resultados({ runner }: { runner: QuizRunner }) {
  const { sesion, preguntas, resultado, segundosTranscurridos, registro } = runner;
  const [soloErrores, setSoloErrores] = useState(false);
  const [ceremonia, setCeremonia] = useState<"nueva" | "repeticion" | null>(null);
  const celebrado = useRef(false);
  const progreso = useProgreso();

  const terminadoMs = sesion?.terminadoMs ?? 0;
  const aprobado = !!resultado?.aprobado;

  /** Trofeos, distinciones y subida de nivel que se ganaron justo en este intento */
  const premios = useMemo<Premio[]>(() => {
    if (!registro || !progreso || !progreso.intentos.some((i) => i.id === registro.id)) return [];
    const lista: Premio[] = [];
    const antes = new Set(trofeosGanados(progreso.intentos.filter((i) => i.id !== registro.id)));
    for (const id of trofeosGanados(progreso.intentos)) {
      const trofeo = TROFEOS.find((t) => t.id === id);
      if (trofeo && !antes.has(id)) lista.push({ tipo: "trofeo", trofeo });
    }
    for (const id of registro.insigniasNuevas ?? []) {
      const insignia = INSIGNIAS.find((x) => x.id === id);
      if (insignia) lista.push({ tipo: "medalla", insignia });
    }
    // La subida de nivel solo se puede saber si este es el intento más reciente
    if (progreso.intentos[0]?.id === registro.id) {
      const total = progreso.xpTotal ?? 0;
      const ahora = nivelDe(total).actual;
      if (ahora.numero > nivelDe(total - (registro.xp ?? 0)).actual.numero) lista.push({ tipo: "nivel", nivel: ahora });
    }
    return lista;
  }, [registro, progreso]);

  // La ceremonia se abre sola al terminar; al volver a abrir resultados guardados se puede repetir a mano
  const ceremoniaMostrada = useRef(false);
  useEffect(() => {
    if (premios.length > 0 && !ceremoniaMostrada.current && Date.now() - terminadoMs < 10_000) {
      ceremoniaMostrada.current = true;
      setCeremonia("nueva");
    }
  }, [premios, terminadoMs]);

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
        <Capibara animo={aprobado ? "celebrando" : "animando"} tamano={72} className="mx-auto mb-2 block" />
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
        <p className="mx-auto mt-2 max-w-sm text-sm font-medium">
          {aprobado
            ? "Capi: ¡Lo lograste! Sigue así y el día del examen será uno más."
            : `Capi: Te faltaron ${Math.max(0, Math.ceil(resultado.umbral - resultado.porcentaje))} puntos. Repasa tus errores y vuelve a intentarlo.`}
        </p>
        {registro?.xp ? (
          <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-sm font-bold">
            <Sparkles className="size-4 text-oro" /> +{registro.xp} {PUNTOS}
          </p>
        ) : null}

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

      {/* Preguntas que salieron del repaso de errores */}
      {registro?.dominadas ? (
        <p className="flex items-center gap-2 rounded-2xl bg-secondary/10 p-4 text-sm font-semibold text-secondary-dark ring-1 ring-secondary/30 dark:text-secondary-light">
          <CheckCircle2 className="size-5 shrink-0" />
          Dominaste {registro.dominadas} {registro.dominadas === 1 ? "pregunta" : "preguntas"}: ya no {registro.dominadas === 1 ? "volverá" : "volverán"} al repaso.
        </p>
      ) : null}

      {/* Premios ganados en este intento */}
      {premios.length > 0 && (
        <section className="space-y-3 rounded-3xl bg-accent/10 p-5 ring-1 ring-accent/30" aria-labelledby="titulo-premios">
          <h2 id="titulo-premios" className="font-bold">
            Premios de este intento
          </h2>
          <ul className="space-y-3">
            {premios.map((p) => (
              <li key={p.tipo === "trofeo" ? p.trofeo.id : p.tipo === "medalla" ? p.insignia.id : "nivel"} className="flex items-center gap-4">
                <span className="grid w-14 shrink-0 place-items-center">
                  {p.tipo === "trofeo" && <Trofeo metal={p.trofeo.metal} forma={p.trofeo.forma} tamano={44} />}
                  {p.tipo === "medalla" && <Medalla icono={p.insignia.icono} tamano={38} />}
                  {p.tipo === "nivel" && <Diploma tamano={56} />}
                </span>
                <div className="min-w-0">
                  <p className="font-heading font-bold leading-snug">
                    {p.tipo === "trofeo" ? p.trofeo.titulo : p.tipo === "medalla" ? p.insignia.titulo : `Nivel ${p.nivel.numero}: ${p.nivel.nombre}`}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {p.tipo === "trofeo" ? p.trofeo.descripcion : p.tipo === "medalla" ? p.insignia.descripcion : "Subiste de nivel de formación."}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setCeremonia("repeticion")}
            className="w-full rounded-2xl bg-accent px-4 py-2.5 text-sm font-bold text-tinta active:scale-[0.98]"
          >
            Ver la premiación otra vez
          </button>
        </section>
      )}
      {ceremonia && <Premiacion premios={premios} repeticion={ceremonia === "repeticion"} onCerrar={() => setCeremonia(null)} />}

      {/* Desglose por área */}
      <section className="space-y-3 rounded-3xl bg-white p-5 ring-1 ring-slate-200 dark:bg-tarjeta dark:ring-slate-700/60">
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
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
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
                <details className="group rounded-2xl bg-white ring-1 ring-slate-200 dark:bg-tarjeta dark:ring-slate-700/60">
                  <summary className="flex cursor-pointer list-none items-start gap-3 p-4">
                    {acerto ? (
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-secondary-light" />
                    ) : elegida ? (
                      <XCircle className="mt-0.5 size-5 shrink-0 text-danger dark:text-danger-light" />
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

                  <div className="space-y-3 border-t border-slate-100 p-4 text-sm dark:border-slate-700">
                    <p className="leading-relaxed text-slate-600 dark:text-slate-300">{p.contexto}</p>
                    <div
                      className={`rounded-xl p-3 ${
                        acerto ? "bg-exito/10" : elegida ? "bg-error/10" : "bg-slate-100 dark:bg-slate-700/60"
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
