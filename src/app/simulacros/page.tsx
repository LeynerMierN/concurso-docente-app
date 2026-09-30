"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Clock, EyeOff, Flag, Info, Play, Target, Timer } from "lucide-react";
import Cargando from "@/components/quiz/Cargando";
import QuizRunner from "@/components/quiz/QuizRunner";
import { useQuizRunner } from "@/hooks/useQuizRunner";
import { DISTRIBUCION_CNSC, MODOS_EXAMEN, configDesdeModo, dimensionarModo, obtenerModo } from "@/lib/appConfig";
import { obtenerCategoria } from "@/lib/categorias";
import { UMBRAL_DOCENTE_AULA } from "@/lib/preguntas";

/** Simulacros cronometrados sin retroalimentación, definidos en data/app_config.json */
const MODOS_SIMULACRO = MODOS_EXAMEN.filter((m) => !m.feedbackInmediato);

export default function Pagina() {
  return (
    <Suspense fallback={<Cargando />}>
      <Simulacros />
    </Suspense>
  );
}

function Simulacros() {
  const pedido = obtenerModo(useSearchParams().get("modo"));
  const inicial = pedido && !pedido.feedbackInmediato ? pedido.id : MODOS_SIMULACRO[MODOS_SIMULACRO.length - 1].id;
  return <Configurar key={inicial} inicial={inicial} />;
}

function Configurar({ inicial }: { inicial: string }) {
  const runner = useQuizRunner("concurso-docente:simulacro");
  const [modoId, setModoId] = useState(inicial);

  if (!runner.cargado) return <Cargando />;
  if (runner.sesion) return <QuizRunner runner={runner} />;

  const modo = obtenerModo(modoId) ?? MODOS_SIMULACRO[0];
  const recortado = modo.preguntas < modo.preguntasConfig;
  const { distribucion = {} } = dimensionarModo(modo);
  const reglas = [
    { Icono: Clock, texto: `${modo.minutos} minutos en total. Al agotarse, se entrega solo.` },
    { Icono: EyeOff, texto: "Sin retroalimentación ni pausa hasta que entregues, como en el examen real." },
    { Icono: Flag, texto: "Navega libremente y marca con bandera las preguntas que quieras revisar." },
    { Icono: Target, texto: `Apruebas con ${UMBRAL_DOCENTE_AULA}/100. Las preguntas sin responder cuentan como incorrectas.` },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Timer className="size-7 text-primary dark:text-oro" /> Simulacros reales
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Núcleo común de la prueba CNSC, armado al azar desde el banco con la distribución oficial por componentes.
        </p>
      </header>

      <section className="space-y-2" aria-label="Tipo de simulacro">
        {MODOS_SIMULACRO.map((m) => {
          const activo = m.id === modo.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setModoId(m.id)}
              aria-pressed={activo}
              className={`w-full rounded-2xl p-4 text-left transition ${
                activo
                  ? "bg-primary text-white shadow-md"
                  : "bg-white ring-1 ring-slate-200 dark:bg-tarjeta dark:ring-slate-700/60"
              }`}
            >
              <span className="block font-semibold">{m.nombre}</span>
              <span className={`mt-0.5 block text-sm ${activo ? "text-marca-100" : "text-slate-500"}`}>{m.descripcion}</span>
              <span className={`mt-2 block text-xs font-medium ${activo ? "text-marca-100" : "text-slate-500"}`}>
                {m.preguntas} preguntas · {m.minutos} min
              </span>
            </button>
          );
        })}
      </section>

      {/* Distribución por componentes */}
      <section className="rounded-3xl bg-white p-5 ring-1 ring-slate-200 dark:bg-tarjeta dark:ring-slate-700/60" aria-labelledby="titulo-distribucion">
        <h2 id="titulo-distribucion" className="font-bold">
          Distribución de este simulacro
        </h2>
        <ul className="mt-3 space-y-2.5">
          {Object.entries(DISTRIBUCION_CNSC).map(([cat, pct]) => {
            const categoria = obtenerCategoria(cat);
            const pedidas = Math.round(modo.preguntasConfig * pct);
            const reales = distribucion[cat] ?? 0;
            const Icono = categoria?.Icono ?? Target;
            return (
              <li key={cat} className="flex items-center gap-3 text-sm">
                <Icono className="size-5 shrink-0 text-primary-light dark:text-oro" />
                <span className="min-w-0 flex-1">{categoria?.nombre ?? cat}</span>
                <span className="shrink-0 text-xs text-slate-500">{Math.round(pct * 100)}%</span>
                <span className="w-14 shrink-0 text-right font-semibold tabular-nums">
                  {reales}
                  {reales < pedidas && <span className="font-normal text-slate-500">/{pedidas}</span>}
                </span>
              </li>
            );
          })}
        </ul>
        {recortado && (
          <p className="mt-4 flex gap-2 rounded-2xl bg-accent/10 p-3 text-sm text-accent-dark dark:text-accent-light">
            <Info className="mt-0.5 size-4 shrink-0" />
            El banco aún no alcanza para todas las preguntas de algunos componentes: se usan {modo.preguntas} de{" "}
            {modo.preguntasConfig} y el tiempo se ajusta en la misma proporción.
          </p>
        )}
      </section>

      <ul className="space-y-3 rounded-3xl bg-white p-5 ring-1 ring-slate-200 dark:bg-tarjeta dark:ring-slate-700/60">
        {reglas.map(({ Icono, texto }) => (
          <li key={texto} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
            <Icono className="size-5 shrink-0 text-primary-light" /> {texto}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => runner.iniciar(configDesdeModo(modo))}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 font-semibold text-white shadow-lg active:scale-[0.98]"
      >
        <Play className="size-5" fill="currentColor" /> Iniciar simulacro
      </button>
    </div>
  );
}
