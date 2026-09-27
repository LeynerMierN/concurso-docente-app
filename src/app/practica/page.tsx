"use client";

import { useState } from "react";
import { BookOpenCheck, Play } from "lucide-react";
import Cargando from "@/components/quiz/Cargando";
import QuizRunner from "@/components/quiz/QuizRunner";
import { useQuizRunner } from "@/hooks/useQuizRunner";
import { FILTROS_TEMATICOS, PREGUNTAS, UMBRAL_DOCENTE_AULA, filtrarPreguntas, obtenerAreas } from "@/lib/preguntas";
import type { FiltroExamen } from "@/types/exam";

export default function Pagina() {
  const runner = useQuizRunner("concurso-docente:practica");
  const [filtro, setFiltro] = useState<FiltroExamen>("todos");
  const [feedback, setFeedback] = useState(true);

  if (!runner.cargado) return <Cargando />;
  if (runner.sesion) return <QuizRunner runner={runner} />;

  const cantidad = filtrarPreguntas(filtro).length;
  const grupos: { titulo: string; opciones: { id: FiltroExamen; etiqueta: string; total: number }[] }[] = [
    {
      titulo: "Repaso general",
      opciones: [{ id: "todos", etiqueta: "Todas las áreas", total: PREGUNTAS.length }],
    },
    {
      titulo: "Temas clave",
      opciones: FILTROS_TEMATICOS.map((f) => ({ id: f.id, etiqueta: f.etiqueta, total: filtrarPreguntas(f.id).length })),
    },
    {
      titulo: "Por área del banco",
      opciones: obtenerAreas().map(({ area, total }) => ({ id: area, etiqueta: area, total })),
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <BookOpenCheck className="size-7 text-marca-600 dark:text-oro" /> Práctica libre
        </h1>
        <p className="mt-1 text-sm text-slate-500">Elige qué repasar. Sin límite de tiempo.</p>
      </header>

      {grupos.map(({ titulo, opciones }) => (
        <section key={titulo} className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{titulo}</h2>
          <ul className="flex flex-wrap gap-2">
            {opciones.map(({ id, etiqueta, total }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setFiltro(id)}
                  aria-pressed={filtro === id}
                  className={`rounded-full px-3.5 py-2 text-left text-sm transition ${
                    filtro === id
                      ? "bg-marca-600 font-semibold text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800"
                  }`}
                >
                  {etiqueta} <span className="opacity-70">· {total}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <label className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <span>
          <span className="block font-semibold">Retroalimentación inmediata</span>
          <span className="block text-sm text-slate-500">Ver la respuesta y la justificación al responder</span>
        </span>
        <input
          type="checkbox"
          checked={feedback}
          onChange={(e) => setFeedback(e.target.checked)}
          className="size-5 shrink-0 accent-marca-600"
        />
      </label>

      <div className="fixed inset-x-0 bottom-20 z-30 px-4">
        <button
          type="button"
          onClick={() =>
            runner.iniciar({
              modo: "practica",
              filtro,
              limiteSegundos: null,
              feedbackInmediato: feedback,
              umbral: UMBRAL_DOCENTE_AULA,
            })
          }
          className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-marca-600 px-4 py-3.5 font-semibold text-white shadow-lg active:scale-[0.98]"
        >
          <Play className="size-5" fill="currentColor" /> Empezar · {cantidad} {cantidad === 1 ? "pregunta" : "preguntas"}
        </button>
      </div>
    </div>
  );
}
