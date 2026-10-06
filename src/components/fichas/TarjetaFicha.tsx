"use client";

import { AlertTriangle, CheckCircle2, HelpCircle, RotateCw, Scale } from "lucide-react";
import type { Ficha } from "@/lib/fichas";

interface Props {
  ficha: Ficha;
  volteada: boolean;
  onVoltear: () => void;
}

const cara =
  "[grid-area:1/1] h-[min(30rem,calc(100dvh-24rem))] min-h-72 backface-hidden rounded-3xl p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700/60 cursor-pointer select-none";

/**
 * Tarjeta con giro 3D. Ambas caras ocupan la misma celda del grid con una altura fija
 * (para que los controles no salten al cambiar de ficha); el reverso se desplaza por dentro.
 */
export default function TarjetaFicha({ ficha, volteada, onVoltear }: Props) {
  return (
    <div className="perspective-distant">
      <div
        onClick={onVoltear}
        className={`grid transition-transform duration-500 transform-3d motion-reduce:transition-none ${
          volteada ? "rotate-y-180" : ""
        }`}
      >
        {/* Frente */}
        <section
          aria-hidden={volteada}
          inert={volteada}
          className={`${cara} flex flex-col bg-gradient-to-br from-marca-600 to-marca-700 text-white`}
        >
          <span className="self-start rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{ficha.categoria}</span>
          <div className="my-auto py-6 text-center">
            <p className="text-4xl font-extrabold tracking-tight text-oro">{ficha.sigla}</p>
            <h2 className="mt-2 text-lg font-semibold leading-snug">{ficha.concepto}</h2>
            <p className="mx-auto mt-6 flex max-w-xs items-start justify-center gap-2 text-left text-[15px] leading-relaxed text-marca-100">
              <HelpCircle className="mt-0.5 size-5 shrink-0 text-oro" />
              {ficha.pregunta_disparadora}
            </p>
          </div>
          <p className="flex items-center justify-center gap-1.5 text-xs text-marca-100">
            <RotateCw className="size-3.5" /> Toca la ficha para ver la respuesta
          </p>
        </section>

        {/* Reverso */}
        <section
          aria-hidden={!volteada}
          inert={!volteada}
          className={`${cara} rotate-y-180 space-y-4 overflow-y-auto overscroll-contain bg-white text-sm dark:bg-tarjeta`}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-lg font-bold text-primary-light dark:text-oro">{ficha.sigla}</p>
            <RotateCw className="size-4 text-slate-400" aria-hidden />
          </div>
          <p className="leading-relaxed text-slate-700 dark:text-slate-300">{ficha.definicion}</p>

          <p className="flex items-start gap-2 rounded-2xl bg-slate-100 p-3 text-xs font-medium text-slate-600 dark:bg-slate-700/60 dark:text-slate-300">
            <Scale className="mt-0.5 size-4 shrink-0" /> {ficha.norma}
          </p>

          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Claves para el examen</h3>
            <ul className="space-y-2">
              {ficha.puntos_clave.map((punto) => (
                <li key={punto} className="flex gap-2 leading-snug">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary-light" />
                  <span>{punto}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-amber-50 p-3 dark:bg-amber-500/10">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">
              <AlertTriangle className="size-4" /> Trampa frecuente
            </p>
            <p className="mt-1 leading-snug text-amber-900 dark:text-amber-100">{ficha.error_frecuente}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
