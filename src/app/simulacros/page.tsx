"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bookmark, Clock, EyeOff, Info, Play, Target, Timer } from "lucide-react";
import Volver from "@/components/Volver";
import Cargando from "@/components/quiz/Cargando";
import QuizRunner from "@/components/quiz/QuizRunner";
import { usePerfil } from "@/hooks/usePerfil";
import { useQuizRunner } from "@/hooks/useQuizRunner";
import { ROLES, umbralDe } from "@/lib/perfil";
import { DISTRIBUCION_CNSC, MODOS_EXAMEN, configDesdeModo, dimensionarModo, obtenerModo } from "@/lib/appConfig";
import { obtenerCategoria } from "@/lib/categorias";

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
  const { perfil } = usePerfil();
  const umbral = umbralDe(perfil);
  const rol = ROLES.find((r) => r.id === perfil?.role);
  const [modoId, setModoId] = useState(inicial);

  if (!runner.cargado) return <Cargando />;
  if (runner.sesion) return <QuizRunner runner={runner} />;

  const modo = obtenerModo(modoId) ?? MODOS_SIMULACRO[0];
  const recortado = modo.preguntas < modo.preguntasConfig;
  const { distribucion = {} } = dimensionarModo(modo);
  const reglas = [
    { Icono: Clock, texto: `${modo.minutos} minutos en total. Al agotarse, se entrega solo.` },
    { Icono: EyeOff, texto: "No ves las respuestas ni puedes pausar hasta que entregues, como en el examen real." },
    { Icono: Bookmark, texto: "Puedes ir y volver entre preguntas, y guardar las que quieras revisar antes de entregar." },
    { Icono: Target, texto: `Apruebas con ${umbral}/100${rol ? ` (umbral de ${rol.nombre.toLowerCase()})` : ""}. Las preguntas sin responder cuentan como incorrectas.` },
  ];

  return (
    <div className="space-y-6">
      <header>
        <Volver href="/estudiar" etiqueta="Estudiar" />
        <h1 className="mt-1 flex items-center gap-2 text-2xl">
          <Timer className="size-7 text-secondary-light" /> Simulacro
        </h1>
        <p className="mt-1 text-[15px] text-texto-tenue">
          Mide tu puntaje como el día del examen: con tiempo y con las mismas áreas y proporciones de la prueba de la CNSC.
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
                  : "bg-tarjeta ring-1 ring-slate-200 dark:ring-slate-700/60"
              }`}
            >
              <span className="block font-semibold">{m.nombre}</span>
              <span className={`mt-0.5 block text-sm ${activo ? "text-white/90" : "text-texto-tenue"}`}>{m.descripcion}</span>
              <span className={`mt-2 block text-xs font-medium ${activo ? "text-white/90" : "text-texto-tenue"}`}>
                {m.preguntas} preguntas · {m.minutos} min
              </span>
            </button>
          );
        })}
      </section>

      {/* Distribución por componentes */}
      <section className="rounded-3xl bg-tarjeta p-5 ring-1 ring-slate-200 dark:ring-slate-700/60" aria-labelledby="titulo-distribucion">
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
                <Icono className="size-5 shrink-0 text-primary-light" />
                <span className="min-w-0 flex-1">{categoria?.nombre ?? cat}</span>
                <span className="shrink-0 text-xs text-texto-tenue">{Math.round(pct * 100)}%</span>
                <span className="w-14 shrink-0 text-right font-semibold tabular-nums">
                  {reales}
                  {reales < pedidas && <span className="font-normal text-texto-tenue">/{pedidas}</span>}
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

      <ul className="space-y-3 rounded-3xl bg-tarjeta p-5 ring-1 ring-slate-200 dark:ring-slate-700/60">
        {reglas.map(({ Icono, texto }) => (
          <li key={texto} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
            <Icono className="size-5 shrink-0 text-primary-light" /> {texto}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => runner.iniciar(configDesdeModo(modo, undefined, umbral))}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 font-bold text-white active:scale-[0.98]"
      >
        <Play className="size-5" fill="currentColor" /> Empezar el {modo.nombre.toLowerCase()}
      </button>
    </div>
  );
}
