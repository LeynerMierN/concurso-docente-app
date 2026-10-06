"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bookmark, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock, Pause, Play, Scale, X, XCircle } from "lucide-react";
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

  /** Responde y, si toca, celebra la serie de aciertos o el avance con un aviso de Capi */
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

  // Modo enfoque: mientras haya una sesión en curso se ocultan las barras de navegación
  const enCurso = !!sesion && !resultado;
  useEffect(() => {
    if (!enCurso) return;
    document.body.dataset.enfoque = "";
    return () => {
      delete document.body.dataset.enfoque;
    };
  }, [enCurso]);

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
          className="grid size-10 place-items-center rounded-full text-texto-tenue hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold uppercase tracking-wide text-texto-tenue">
            {nombreModo ?? (esSimulacro ? "Simulacro" : etiquetaFiltro(config.filtro))}
          </p>
          <p className="font-heading text-base font-bold">
            Pregunta {indice + 1} de {preguntas.length}
          </p>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums ${
            poco ? "bg-mora-suave text-danger motion-safe:animate-pulse dark:text-danger-light" : "bg-slate-100 dark:bg-slate-700/60"
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
            className="grid size-10 place-items-center rounded-full bg-slate-100 dark:bg-slate-700/60"
          >
            <Pause className="size-4" fill="currentColor" />
          </button>
        )}
        <button
          type="button"
          onClick={runner.alternarBandera}
          aria-pressed={marcada}
          aria-label={marcada ? "Quitar de guardadas para revisar" : "Guardar para revisar"}
          className={`grid size-10 place-items-center rounded-full transition ${
            marcada ? "bg-resaltador text-tinta" : "bg-slate-100 dark:bg-slate-700/60"
          }`}
        >
          <Bookmark className="size-5" fill={marcada ? "currentColor" : "none"} />
        </button>
      </div>
      {/* Progreso en segmentos: respondidas en verde, la actual en resaltador */}
      <ol className={`flex ${preguntas.length > 40 ? "gap-px" : "gap-0.5"}`} aria-label={`${respondidas} de ${preguntas.length} respondidas`}>
        {preguntas.map((p, i) => (
          <li
            key={p.id}
            className={`h-1.5 flex-1 rounded-full ${
              i === indice ? "bg-resaltador" : respuestas[p.id] ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </ol>
    </header>
  );

  if (runner.pausado) {
    return (
      <div className="space-y-4">
        {encabezado}
        <section className="space-y-4 rounded-3xl bg-tarjeta p-8 text-center ring-1 ring-slate-200 dark:ring-slate-700/60">
          <Pause className="mx-auto size-10 text-secondary-light" />
          <div>
            <h2 className="text-xl">En pausa</h2>
            <p className="mt-1 text-sm text-texto-tenue">El cronómetro está detenido. La pregunta se oculta hasta que continúes.</p>
          </div>
          <FrasePausa />
          <button
            type="button"
            onClick={runner.reanudar}
            className="mx-auto flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-white active:scale-[0.98]"
          >
            <Play className="size-5" fill="currentColor" /> Continuar
          </button>
        </section>
      </div>
    );
  }

  const letraCorrecta = runner.opcionesDe(preguntaActual).find((o) => o.id === preguntaActual.respuesta_correcta)?.letra;
  const esTrampa = /trampa/i.test(`${preguntaActual.id} ${preguntaActual.tema}`);

  return (
    <div ref={raiz} className="scroll-mt-4 space-y-5">
      <AvisoFlotante aviso={aviso} onCerrar={cerrarAviso} />
      {encabezado}

      {/* Pregunta: pantalla en calma, sin decoración; el color aparece solo en la retroalimentación */}
      <article className="space-y-5">
        <p className="text-xs font-bold text-texto-tenue">
          {preguntaActual.area} · {preguntaActual.tema}
        </p>

        <div className="margen-cuaderno">
          <p className="font-tiza text-xl font-bold leading-none text-secondary-light">El caso</p>
          <p className="mt-2 text-[17px] leading-[1.6]">{preguntaActual.contexto}</p>
        </div>
        <h2 className="font-sans text-[17px] font-bold leading-[1.5]">{preguntaActual.pregunta}</h2>

        <ul className="space-y-3">
          {runner.opcionesDe(preguntaActual).map((opcion) => {
            const elegida = seleccion === opcion.id;
            const correcta = opcion.id === preguntaActual.respuesta_correcta;
            let estilo = "bg-tarjeta ring-1 ring-slate-200 hover:ring-primary-light dark:ring-slate-700";
            let circulo = "border border-slate-300 dark:border-slate-600";
            let contenido: React.ReactNode = opcion.letra;
            let etiqueta: string | null = null;
            if (revelada && correcta) {
              estilo = "bg-verde-suave ring-2 ring-primary-light";
              circulo = "bg-primary text-white";
              contenido = <Check className="size-4" strokeWidth={3} />;
              etiqueta = "Respuesta correcta";
            } else if (revelada && elegida) {
              estilo = "bg-mora-suave ring-2 ring-danger dark:ring-danger-light";
              circulo = "bg-danger text-white";
              contenido = <X className="size-4" strokeWidth={3} />;
              etiqueta = "Tu respuesta";
            } else if (revelada) {
              estilo = "bg-tarjeta ring-1 ring-slate-200 text-texto-tenue dark:ring-slate-700";
            } else if (elegida) {
              estilo = "bg-marca-50 ring-2 ring-primary-light dark:bg-marca-700/30";
              circulo = "bg-primary text-white";
            }
            return (
              <li key={opcion.id}>
                <button
                  type="button"
                  disabled={revelada}
                  onClick={() => elegir(opcion.id)}
                  className={`flex w-full items-start gap-3 rounded-2xl p-4 text-left text-base leading-[1.5] transition active:scale-[0.99] disabled:active:scale-100 ${estilo}`}
                >
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${circulo}`}>{contenido}</span>
                  <span className="pt-0.5">
                    {etiqueta && (
                      <span className={`mb-0.5 block text-xs font-bold uppercase tracking-wide ${correcta ? "text-secondary-light" : "text-danger dark:text-danger-light"}`}>
                        {etiqueta}
                      </span>
                    )}
                    {opcion.texto}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {revelada && (
          <div className="space-y-3 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200 dark:bg-slate-700/40 dark:ring-slate-700">
            <div className="flex items-center gap-3">
              <Capibara animo={acerto ? "feliz" : "pensando"} tamano={52} mirarPuntero={false} />
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-heading text-lg font-extrabold leading-tight">
                  {acerto ? (
                    <CheckCircle2 className="size-5 shrink-0 text-secondary-light" />
                  ) : (
                    <XCircle className="size-5 shrink-0 text-danger dark:text-danger-light" />
                  )}
                  {acerto ? `¡Bien! Era la ${letraCorrecta}` : `Casi. La clave está en la ${letraCorrecta}`}
                </p>
                <p className="font-tiza text-lg font-bold leading-tight text-secondary-light">
                  {!acerto && esTrampa ? "Esta trampa es de las más comunes." : fraseRespuesta(acerto, preguntaActual.id)}
                </p>
              </div>
            </div>
            <p className="text-base leading-[1.6]">{preguntaActual.justificacion}</p>
            <p className="inline-flex items-start gap-1.5 rounded-xl bg-verde-suave px-3 py-1.5 text-xs font-bold text-secondary-light">
              <Scale className="mt-px size-3.5 shrink-0" /> {preguntaActual.norma_referencia}
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
          className="flex items-center justify-center gap-1 rounded-2xl bg-tarjeta px-4 py-3 font-bold ring-1 ring-slate-200 disabled:opacity-40 dark:ring-slate-700/60"
        >
          <ChevronLeft className="size-5" /> Anterior
        </button>
        {esUltima ? (
          <button
            type="button"
            onClick={() => setDialogo("finalizar")}
            className="rounded-2xl bg-primary px-4 py-3 font-bold text-white active:scale-[0.98]"
          >
            Finalizar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => runner.irA(indice + 1)}
            className="flex items-center justify-center gap-1 rounded-2xl bg-primary px-4 py-3 font-bold text-white active:scale-[0.98]"
          >
            Siguiente <ChevronRight className="size-5" />
          </button>
        )}
      </div>
      <p className="hidden text-center text-xs text-texto-tenue lg:block">
        Atajos: <kbd className="font-sans font-semibold">A–D</kbd> o <kbd className="font-sans font-semibold">1–4</kbd> para
        responder · <kbd className="font-sans font-semibold">← →</kbd> para moverte
      </p>

      {/* Mapa de preguntas: navegación libre */}
      <section className="rounded-3xl bg-tarjeta p-4 ring-1 ring-slate-200 dark:ring-slate-700/60">
        <div className="flex items-center justify-between gap-2 text-xs text-texto-tenue">
          <span>
            {respondidas}/{preguntas.length} respondidas
          </span>
          {banderas.length > 0 && (
            <span className="flex items-center gap-1">
              <Bookmark className="size-3 text-accent-dark" fill="currentColor" /> {banderas.length} guardadas para revisar
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
                      i === indice ? "ring-2 ring-resaltador ring-offset-2 ring-offset-fondo" : ""
                    }`}
                  >
                    {i + 1}
                  </button>
                  {banderas.includes(p.id) && (
                    <Bookmark className="absolute -top-1 -right-1 size-3 text-accent-dark" fill="currentColor" />
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
