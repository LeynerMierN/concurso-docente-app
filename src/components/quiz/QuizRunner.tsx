"use client";

import { useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Flag, Pause, Play, Scale, X, XCircle } from "lucide-react";
import Confirmacion from "./Confirmacion";
import Resultados from "./Resultados";
import Buho from "@/components/mascota/Buho";
import type { QuizRunner as Runner } from "@/hooks/useQuizRunner";
import { obtenerModo } from "@/lib/appConfig";
import { fraseRespuesta } from "@/lib/mascota";
import { etiquetaFiltro } from "@/lib/preguntas";
import { formatoTiempo } from "@/lib/tiempo";

type Dialogo = "finalizar" | "abandonar" | null;

/** Ejecuta una sesión de Práctica o Simulacro y, al terminar, muestra los resultados */
export default function QuizRunner({ runner }: { runner: Runner }) {
  const { sesion, preguntas, preguntaActual, resultado, segundosRestantes, segundosTranscurridos } = runner;
  const [dialogo, setDialogo] = useState<Dialogo>(null);

  if (!sesion || !preguntaActual) return null;
  if (resultado) return <Resultados runner={runner} />;

  const { config, indice, respuestas, banderas } = sesion;
  const esSimulacro = config.modo === "simulacro";
  const seleccion = respuestas[preguntaActual.id];
  const revelada = config.feedbackInmediato && !!seleccion;
  const acerto = seleccion === preguntaActual.respuesta_correcta;
  const marcada = banderas.includes(preguntaActual.id);
  const esUltima = indice === preguntas.length - 1;
  const respondidas = Object.keys(respuestas).length;
  const sinResponder = preguntas.length - respondidas;
  const poco = segundosRestantes !== null && segundosRestantes <= 60 && !runner.pausado;
  const nombreModo = obtenerModo(config.modoId ?? null)?.nombre;

  const encabezado = (
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDialogo("abandonar")}
            aria-label="Salir"
            className="grid size-9 place-items-center rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">
              {nombreModo ?? (esSimulacro ? "Simulacro" : etiquetaFiltro(config.filtro))}
            </p>
            <p className="text-sm font-semibold">
              Pregunta {indice + 1} de {preguntas.length}
            </p>
          </div>
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums ${
              poco
                ? "animate-pulse bg-error/10 text-error"
                : "bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-200"
            }`}
            aria-label={segundosRestantes !== null ? "Tiempo restante" : "Tiempo transcurrido"}
          >
            <Clock className="size-4" />
            {formatoTiempo(segundosRestantes ?? segundosTranscurridos)}
          </span>
          {config.permitirPausa && sesion.finMs !== null && !runner.pausado && (
            <button
              type="button"
              onClick={runner.pausar}
              aria-label="Pausar"
              className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-200"
            >
              <Pause className="size-4" fill="currentColor" />
            </button>
          )}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700/60">
          <div
            className="h-full rounded-full bg-marca-500 transition-all"
            style={{ width: `${(respondidas / preguntas.length) * 100}%` }}
          />
        </div>
      </header>
  );

  if (runner.pausado) {
    return (
      <div className="space-y-4">
        {encabezado}
        <section className="space-y-4 rounded-3xl bg-white p-8 text-center ring-1 ring-slate-200 dark:bg-tarjeta dark:ring-slate-700/60">
          <Pause className="mx-auto size-10 text-primary dark:text-oro" />
          <div>
            <h2 className="text-xl font-bold">En pausa</h2>
            <p className="mt-1 text-sm text-slate-500">
              El cronómetro está detenido. La pregunta se oculta hasta que continúes.
            </p>
          </div>
          <button
            type="button"
            onClick={runner.reanudar}
            className="mx-auto flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-white active:scale-[0.98]"
          >
            <Play className="size-5" fill="currentColor" /> Continuar
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {encabezado}

      {/* Pregunta */}
      <article className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-tarjeta dark:ring-slate-700/60">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-marca-600 dark:text-oro">{preguntaActual.area}</p>
            <p className="text-xs text-slate-500">{preguntaActual.tema}</p>
          </div>
          <button
            type="button"
            onClick={runner.alternarBandera}
            aria-pressed={marcada}
            className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              marcada
                ? "bg-oro text-slate-900"
                : "bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300"
            }`}
          >
            <Flag className="size-3.5" fill={marcada ? "currentColor" : "none"} />
            {marcada ? "Marcada" : "Revisar"}
          </button>
        </div>

        <p className="rounded-2xl bg-slate-50 p-4 text-[15px] leading-relaxed text-slate-700 dark:bg-slate-700/40 dark:text-slate-300">
          {preguntaActual.contexto}
        </p>
        <h2 className="font-semibold leading-snug">{preguntaActual.pregunta}</h2>

        <ul className="space-y-2.5">
          {runner.opcionesDe(preguntaActual).map((opcion) => {
            const elegida = seleccion === opcion.id;
            const correcta = opcion.id === preguntaActual.respuesta_correcta;
            let estilo = "ring-slate-200 dark:ring-slate-700 hover:ring-marca-500";
            let letra = "bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300";
            if (revelada && correcta) {
              estilo = "ring-2 ring-exito bg-exito/10";
              letra = "bg-exito text-white";
            } else if (revelada && elegida) {
              estilo = "ring-2 ring-error bg-error/10";
              letra = "bg-error text-white";
            } else if (revelada) {
              estilo = "ring-slate-200 opacity-60 dark:ring-slate-700";
            } else if (elegida) {
              estilo = "ring-2 ring-marca-500 bg-marca-50 dark:bg-marca-700/30";
              letra = "bg-marca-600 text-white";
            }
            return (
              <li key={opcion.id}>
                <button
                  type="button"
                  disabled={revelada}
                  onClick={() => runner.responder(opcion.id)}
                  className={`flex w-full items-start gap-3 rounded-2xl p-3.5 text-left text-sm leading-snug ring-1 transition active:scale-[0.99] disabled:active:scale-100 ${estilo}`}
                >
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${letra}`}>
                    {opcion.letra}
                  </span>
                  <span className="pt-1">{opcion.texto}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {revelada && (
          <div
            className={`space-y-2 rounded-2xl p-4 text-sm ${
              acerto ? "bg-exito/10 text-emerald-900 dark:text-emerald-100" : "bg-error/10 text-red-900 dark:text-red-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <Buho animo={acerto ? "celebrando" : "animando"} tamano={44} mirarPuntero={false} />
              <div>
                <p className="flex items-center gap-2 font-bold">
                  {acerto ? <CheckCircle2 className="size-5 text-exito" /> : <XCircle className="size-5 text-error" />}
                  {acerto ? "¡Correcto!" : "Respuesta incorrecta"}
                </p>
                <p className="text-xs opacity-80">{fraseRespuesta(acerto, preguntaActual.id)}</p>
              </div>
            </div>
            <p className="leading-relaxed">{preguntaActual.justificacion}</p>
            <p className="flex items-start gap-1.5 text-xs opacity-80">
              <Scale className="mt-0.5 size-3.5 shrink-0" /> {preguntaActual.norma_referencia}
            </p>
          </div>
        )}
      </article>

      {/* Navegación */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => runner.irA(indice - 1)}
          disabled={indice === 0}
          className="flex items-center justify-center gap-1 rounded-2xl bg-white px-4 py-3 font-semibold ring-1 ring-slate-200 disabled:opacity-40 dark:bg-tarjeta dark:ring-slate-700/60"
        >
          <ChevronLeft className="size-5" /> Anterior
        </button>
        {esUltima ? (
          <button
            type="button"
            onClick={() => setDialogo("finalizar")}
            className="rounded-2xl bg-marca-600 px-4 py-3 font-semibold text-white active:scale-[0.98]"
          >
            Finalizar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => runner.irA(indice + 1)}
            className="flex items-center justify-center gap-1 rounded-2xl bg-marca-600 px-4 py-3 font-semibold text-white active:scale-[0.98]"
          >
            Siguiente <ChevronRight className="size-5" />
          </button>
        )}
      </div>

      {/* Mapa de preguntas: navegación libre */}
      <section className="rounded-3xl bg-white p-4 ring-1 ring-slate-200 dark:bg-tarjeta dark:ring-slate-700/60">
        <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            {respondidas}/{preguntas.length} respondidas
          </span>
          {banderas.length > 0 && (
            <span className="flex items-center gap-1">
              <Flag className="size-3 text-oro" fill="currentColor" /> {banderas.length} por revisar
            </span>
          )}
        </div>
        <ol className="grid grid-cols-8 gap-1.5">
          {preguntas.map((p, i) => {
            const r = respuestas[p.id];
            let color = "bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300";
            if (r && config.feedbackInmediato) {
              color = r === p.respuesta_correcta ? "bg-exito text-white" : "bg-error text-white";
            } else if (r) {
              color = "bg-marca-600 text-white";
            }
            return (
              <li key={p.id} className="relative">
                <button
                  type="button"
                  onClick={() => runner.irA(i)}
                  aria-label={`Ir a la pregunta ${i + 1}`}
                  aria-current={i === indice}
                  className={`aspect-square w-full rounded-lg text-xs font-semibold tabular-nums ${color} ${
                    i === indice ? "ring-2 ring-oro ring-offset-2 ring-offset-white dark:ring-offset-slate-900" : ""
                  }`}
                >
                  {i + 1}
                </button>
                {banderas.includes(p.id) && (
                  <Flag className="absolute -top-1 -right-1 size-3 text-oro" fill="currentColor" />
                )}
              </li>
            );
          })}
        </ol>
        {!esUltima && (
          <button
            type="button"
            onClick={() => setDialogo("finalizar")}
            className="mt-4 w-full rounded-2xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
          >
            {esSimulacro ? "Entregar simulacro" : "Terminar práctica"}
          </button>
        )}
      </section>

      {dialogo === "finalizar" && (
        <Confirmacion
          titulo={esSimulacro ? "¿Entregar el simulacro?" : "¿Terminar la práctica?"}
          textoConfirmar="Ver resultados"
          onCancelar={() => setDialogo(null)}
          onConfirmar={() => {
            setDialogo(null);
            runner.finalizar();
          }}
        >
          {sinResponder === 0 && banderas.length === 0 ? (
            <p>Respondiste todas las preguntas.</p>
          ) : (
            <ul className="list-disc space-y-1 pl-5">
              {sinResponder > 0 && <li>{sinResponder} sin responder (cuentan como incorrectas).</li>}
              {banderas.length > 0 && <li>{banderas.length} marcadas para revisar.</li>}
            </ul>
          )}
        </Confirmacion>
      )}
      {dialogo === "abandonar" && (
        <Confirmacion
          titulo="¿Salir sin calificar?"
          textoConfirmar="Salir"
          peligro
          onCancelar={() => setDialogo(null)}
          onConfirmar={() => {
            setDialogo(null);
            runner.reiniciar();
          }}
        >
          <p>Se perderá el progreso de esta sesión.</p>
        </Confirmacion>
      )}
    </div>
  );
}
