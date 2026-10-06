"use client";

import Link from "next/link";
import { CalendarClock, ChevronRight, RotateCcw } from "lucide-react";
import { useProgreso } from "@/hooks/useProgreso";
import { resumenRepaso } from "@/lib/repaso";

const fechaCorta = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "short" });

/** Recordatorio del repaso de errores: lo que toca hoy o cuándo es el próximo */
export default function RepasoErrores() {
  const progreso = useProgreso();
  if (!progreso) return null;

  const { hoy, enCiclo, proximaFecha, proximosEseDia } = resumenRepaso(progreso);
  // Sin errores registrados todavía: no hay nada que mostrar
  if (enCiclo === 0) return null;

  if (hoy > 0) {
    return (
      <Link
        href="/practica?filtro=repaso"
        className="flex items-center gap-4 rounded-3xl bg-tarjeta p-5 ring-1 ring-slate-200 transition active:scale-[0.99] dark:ring-slate-700/60"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-mora-suave text-danger dark:text-danger-light">
          <RotateCcw className="size-7" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-heading text-lg font-bold leading-snug">
            {hoy} {hoy === 1 ? "pregunta" : "preguntas"} para reforzar hoy
          </span>
          <span className="block text-sm text-texto-tenue">Vuelve sobre lo que fallaste antes de que se te olvide.</span>
        </span>
        <ChevronRight className="size-6 shrink-0 text-texto-tenue" />
      </Link>
    );
  }

  const [a, m, d] = (proximaFecha ?? "").split("-").map(Number);
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-white p-5 ring-1 ring-slate-200 dark:bg-tarjeta dark:ring-slate-700/60">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary/15 text-secondary-light">
        <CalendarClock className="size-7" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">Repaso de errores al día</span>
        <span className="block text-sm text-slate-500">
          {proximaFecha
            ? `Próximo repaso: ${fechaCorta.format(new Date(a, m - 1, d))} (${proximosEseDia} ${proximosEseDia === 1 ? "pregunta" : "preguntas"}).`
            : "Sigue practicando para mantenerlo así."}
        </span>
      </span>
    </div>
  );
}
