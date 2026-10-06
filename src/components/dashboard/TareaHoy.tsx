"use client";

import Link from "next/link";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { useProgreso } from "@/hooks/useProgreso";
import { META_DIARIA_PREGUNTAS } from "@/lib/appConfig";
import { respondidasEnDia } from "@/lib/storage";

/** Ritmo de la Prueba por Competencia (20 preguntas en 30 minutos) para estimar lo que falta */
const MINUTOS_POR_PREGUNTA = 1.5;

/** Tarea de hoy: cuánto falta (no cuánto se hizo) y un botón para seguir */
export default function TareaHoy() {
  const progreso = useProgreso();
  if (!progreso) return <div className="h-36 motion-safe:animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-700/60" aria-hidden />;

  const hoy = Math.min(respondidasEnDia(progreso), META_DIARIA_PREGUNTAS);
  const faltan = META_DIARIA_PREGUNTAS - hoy;
  const cumplida = faltan === 0;
  const minutos = Math.max(1, Math.round(faltan * MINUTOS_POR_PREGUNTA));

  return (
    <section aria-labelledby="titulo-tarea" className="rounded-3xl bg-tarjeta p-5 ring-1 ring-slate-200 dark:ring-slate-700/60">
      <div className="flex items-center justify-between gap-3">
        <h2 id="titulo-tarea" className="flex items-center gap-2 text-lg">
          {cumplida ? <CheckCircle2 className="size-5 text-secondary-light" /> : <ClipboardList className="size-5 text-secondary-light" />}
          Tarea de hoy
        </h2>
        <span className="text-sm tabular-nums text-texto-tenue">
          <span className="font-bold text-texto">{hoy}</span>/{META_DIARIA_PREGUNTAS} preguntas
        </span>
      </div>

      <div
        className="mt-3 h-3 overflow-hidden rounded-[3px_10px_6px_2px] bg-slate-100 dark:bg-slate-700/60"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={META_DIARIA_PREGUNTAS}
        aria-valuenow={hoy}
        aria-label="Preguntas respondidas hoy"
      >
        <div className="barra-resaltador h-full transition-all" style={{ width: `${(hoy / META_DIARIA_PREGUNTAS) * 100}%` }} />
      </div>

      <p className="mt-3 text-[15px]">
        {cumplida ? (
          <>
            <span className="font-bold">¡Tarea cumplida!</span> Hoy ya cuenta para tu constancia.
          </>
        ) : (
          <>
            Te faltan <span className="font-bold">{faltan} {faltan === 1 ? "pregunta" : "preguntas"}</span>, unos {minutos}{" "}
            {minutos === 1 ? "minuto" : "minutos"}.
          </>
        )}
      </p>

      {!cumplida && (
        <Link
          href="/practica?modo=express_10"
          className="mt-4 flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 font-bold text-white transition active:scale-[0.98]"
        >
          {hoy > 0 ? "Continuar la tarea" : "Empezar la tarea"}
        </Link>
      )}
    </section>
  );
}
