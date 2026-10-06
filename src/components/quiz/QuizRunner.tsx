"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock, Flag, Pause, Play, Scale, X, XCircle } from "lucide-react";
import AvisoFlotante, { type Aviso } from "./AvisoFlotante";
import Confirmacion from "./Confirmacion";
import Resultados from "./Resultados";
import Capibara, { type AnimoMascota } from "@/components/mascota/Capibara";
import type { QuizRunner as Runner } from "@/hooks/useQuizRunner";
import { obtenerModo } from "@/lib/appConfig";
import { mensajeAvance, mensajeRacha, otraFrase } from "@/lib/frases";
import { fraseRespuesta } from "@/lib/mascota";
import { etiquetaFiltro } from "@/lib/preguntas";
import { formatoTiempo } from "@/lib/tiempo";
import type { OpcionId } from "@/types/exam";

type Dialogo = "finalizar" | "abandonar" | null;

/** Con más preguntas que esto, el mapa empieza plegado para no ocupar media pantalla */
const MAPA_PLEGADO_DESDE = 40;
const LETRAS_TECLADO = ["a", "b", "c", "d"];

/** Ejecuta una sesión de Práctica o Simulacro y, al terminar, muestra los resultados */
export default function QuizRunner({ runner }: { runner: Runner }) {
  const { sesion, preguntas, preguntaActual, resultado, segundosRestantes, segundosTranscurridos } = runner;
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [mapaAbierto, setMapaAbierto] = useState<boolean | null>(null);
  const seguidas = useRef(0);
  const raiz = useRef<HTMLDivElement>(null);
  const cerrarAviso = useCallback(() => setAviso(null), []);

  /** Responde y, si toca, celebra la serie de aciertos o el avance con un aviso de Sabino */
  const elegir = (opcion: OpcionId) => {
    if (!sesion || !preguntaActual || sesion.terminadoMs !== null) return;
    const previa = sesion.respuestas[preguntaActual.id];
    if (sesion.config.feedbackInmediato && previa) return;
    runner.responder(opcion);
    // Cambiar una respuesta ya dada no cuenta como avance
    if (previa) return;

    let texto: string | null = null;
    let animo: AnimoMascota = "feliz";
    if (sesion.config.feedbackInmediato) {
      if (opcion === preguntaActual.respuesta_correcta) {
        seguidas.current += 1;
        texto = mensajeRacha(seguidas.current);
        animo = "celebrando";
      } else {
        if (seguidas.current >= 3) {
          texto = `Se cortó tu serie de ${seguidas.current} aciertos, pero cada error te enseña algo. ¡Sigue!`;
          animo = "animando";
        }
        seguidas.current = 0;
      }
    }
    if (!texto) {
      texto = mensajeAvance(Object.keys(sesion.respuestas).length + 1, sesion.preguntaIds.length);
      animo = "feliz";
    }
    if (texto) setAviso({ id: Date.now(), texto, animo });
  };

  // Al cambiar de pregunta, vuelve arriba si la pregunta quedó fuera de la vista (p. ej. tras «Siguiente»)
  const indiceActual = sesion?.indice;
  useEffect(() => {
    const el = raiz.current;
    // Salto inmediato: una animación suave se interrumpe si se responde rápido
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start" });
  }, [indiceActual]);

  // Atajos de teclado: A–D o 1–4 para responder, ← → para moverse
  useEffect(() => {
    if (!sesion || !preguntaActual || resultado || runner.pausado || dialogo) return;
    const alPresionar = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, select")) return;
      const tecla = e.key.toLowerCase();
      const posicion = LETRAS_TECLADO.includes(tecla) ? LETRAS_TECLADO.indexOf(tecla) : ["1", "2", "3", "4"].indexOf(tecla);
      if (posicion >= 0) {
        const opcion = runner.opcionesDe(preguntaActual)[posicion];
        if (opcion) elegir(opcion.id);
      } else if (e.key === "ArrowRight" && sesion.indice < sesion.preguntaIds.length - 1) {
        e.preventDefault();
        runner.irA(sesion.indice + 1);
      } else if (e.key === "ArrowLeft" && sesion.indice > 0) {
        e.preventDefault();
        runner.irA(sesion.indice - 1);
      }
    };
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  });

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
  const verMapa = mapaAbierto ?? preguntas.length <= MAPA_PLEGADO_DESDE;

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
                ? "animate-pulse bg-error/10 text-danger dark:text-danger-light"
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
          <Pause className="mx-auto size-10 text-primary-light dark:text-oro" />
          <div>
            <h2 className="text-xl font-bold">En pausa</h2>
            <p className="mt-1 text-sm text-slate-500">
              El cronómetro está detenido. La pregunta se oculta hasta que continúes.
            </p>
          </div>
          <FrasePausa />
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
    <div ref={raiz} className="scroll-mt-4 space-y-4">
      <AvisoFlotante aviso={aviso} onCerrar={cerrarAviso} />
      {encabezado}

      {/* Pregunta */}
      <article className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-tarjeta dark:ring-slate-700/60">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-primary-light dark:text-oro">{preguntaActual.area}</p>
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
                  onClick={() => elegir(opcion.id)}
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
              acerto ? "bg-verde-suave" : "bg-mora-suave"
            }`}
          >
            <div className="flex items-center gap-3">
              <Capibara animo={acerto ? "celebrando" : "animando"} tamano={44} mirarPuntero={false} />
              <div>
                <p className="flex items-center gap-2 font-bold">
                  {acerto ? <CheckCircle2 className="size-5 text-secondary-light" /> : <XCircle className="size-5 text-danger dark:text-danger-light" />}
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
      <p className="hidden text-center text-xs text-slate-500 lg:block">
        Atajos: <kbd className="font-sans font-semibold">A–D</kbd> o <kbd className="font-sans font-semibold">1–4</kbd> para
        responder · <kbd className="font-sans font-semibold">← →</kbd> para moverte
      </p>

      {/* Mapa de preguntas: navegación libre */}
      <section className="rounded-3xl bg-white p-4 ring-1 ring-slate-200 dark:bg-tarjeta dark:ring-slate-700/60">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            {respondidas}/{preguntas.length} respondidas
          </span>
          {banderas.length > 0 && (
            <span className="flex items-center gap-1">
              <Flag className="size-3 text-oro" fill="currentColor" /> {banderas.length} por revisar
            </span>
          )}
          <button
            type="button"
            onClick={() => setMapaAbierto(!verMapa)}
            aria-expanded={verMapa}
            className="ml-auto flex items-center gap-1 rounded-full px-2 py-1 font-semibold text-primary-light dark:text-oro"
          >
            {verMapa ? "Ocultar mapa" : "Ver mapa"}
            <ChevronDown className={`size-4 transition ${verMapa ? "rotate-180" : ""}`} />
          </button>
        </div>
        {verMapa && (
          <ol className="mt-3 grid grid-cols-8 gap-1.5">
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
        )}
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

/** Frase motivadora al azar mientras el examen está en pausa */
function FrasePausa() {
  const [frase] = useState(() => otraFrase());
  return (
    <p className="mx-auto max-w-sm rounded-2xl bg-secondary/10 p-4 text-sm font-medium italic leading-relaxed text-secondary-dark dark:text-secondary-light">
      «{frase.texto}»
    </p>
  );
}
