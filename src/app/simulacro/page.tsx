"use client";

import { useState } from "react";
import { ClipboardList, Clock, Flag, Play, Target } from "lucide-react";
import Cargando from "@/components/quiz/Cargando";
import QuizRunner from "@/components/quiz/QuizRunner";
import { useQuizRunner } from "@/hooks/useQuizRunner";
import { MINUTOS_POR_PREGUNTA, PREGUNTAS, UMBRAL_DOCENTE_AULA } from "@/lib/preguntas";

const TAMANOS = [10, 20, PREGUNTAS.length];

export default function Pagina() {
  const runner = useQuizRunner("concurso-docente:simulacro");
  const [cantidad, setCantidad] = useState(PREGUNTAS.length);

  if (!runner.cargado) return <Cargando />;
  if (runner.sesion) return <QuizRunner runner={runner} />;

  const minutos = cantidad * MINUTOS_POR_PREGUNTA;
  const reglas = [
    { Icono: Clock, texto: `${minutos} minutos en total (${MINUTOS_POR_PREGUNTA} min por pregunta). Al agotarse, se entrega solo.` },
    { Icono: Flag, texto: "Navega libremente y marca con bandera las preguntas que quieras revisar." },
    { Icono: Target, texto: `Apruebas con ${UMBRAL_DOCENTE_AULA}/100. Las preguntas sin responder cuentan como incorrectas.` },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ClipboardList className="size-7 text-marca-600 dark:text-oro" /> Simulacro real
        </h1>
        <p className="mt-1 text-sm text-slate-500">Preguntas aleatorias de todas las áreas, con cronómetro.</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Número de preguntas</h2>
        <div className="grid grid-cols-3 gap-2">
          {TAMANOS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCantidad(n)}
              aria-pressed={cantidad === n}
              className={`rounded-2xl py-3 text-center transition ${
                cantidad === n
                  ? "bg-marca-600 text-white"
                  : "bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
              }`}
            >
              <span className="block text-xl font-bold">{n}</span>
              <span className="block text-xs opacity-75">{n === PREGUNTAS.length ? "Completo" : "preguntas"}</span>
            </button>
          ))}
        </div>
      </section>

      <ul className="space-y-3 rounded-3xl bg-white p-5 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        {reglas.map(({ Icono, texto }) => (
          <li key={texto} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
            <Icono className="size-5 shrink-0 text-marca-500" /> {texto}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() =>
          runner.iniciar({
            modo: "simulacro",
            filtro: "todos",
            cantidad,
            limiteSegundos: minutos * 60,
            feedbackInmediato: false,
            umbral: UMBRAL_DOCENTE_AULA,
          })
        }
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-marca-600 px-4 py-3.5 font-semibold text-white shadow-lg active:scale-[0.98]"
      >
        <Play className="size-5" fill="currentColor" /> Iniciar simulacro
      </button>
    </div>
  );
}
