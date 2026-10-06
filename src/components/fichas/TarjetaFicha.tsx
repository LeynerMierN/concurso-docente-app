"use client";

import { AlertTriangle, CheckCircle2, HelpCircle, RotateCw, Scale } from "lucide-react";
import type { Ficha } from "@/lib/fichas";

interface Props {
  ficha: Ficha;
  volteada: boolean;
  onVoltear: () => void;
}

const cara =
  "[grid-area:1/1] h-[min(30rem,calc(100dvh-24rem))] min-h-72 backface-hidden rounded-3xl p-6 cursor-pointer select-none";

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
        {/* Frente: papel cuadriculado con el concepto */}
        <section aria-hidden={volteada} inert={volteada} className={`${cara} cuadricula flex flex-col ring-1 ring-slate-200 dark:ring-slate-700/60`}>
          <span className="self-start rounded-full bg-tarjeta px-3 py-1 text-xs font-bold ring-1 ring-slate-200 dark:ring-slate-700">{ficha.categoria}</span>
          <div className="my-auto py-6 text-center">
            <p className="font-heading text-4xl font-extrabold tracking-[-0.02em]">{ficha.sigla}</p>
            <h2 className="mt-2 text-lg leading-snug font-bold">{ficha.concepto}</h2>
            <p className="mx-auto mt-6 flex max-w-xs items-start justify-center gap-2 text-left text-base leading-relaxed">
              <HelpCircle className="mt-0.5 size-5 shrink-0 text-secondary-light" />
              {ficha.pregunta_disparadora}
            </p>
          </div>
          <p className="flex items-center justify-center gap-1.5 text-xs text-texto-tenue">
            <RotateCw className="size-3.5" /> Toca la ficha para ver la respuesta
          </p>
        </section>

        {/* Reverso: tablero. La tiza solo en el título corto; el contenido de estudio va en letra de lectura */}
        <section
          aria-hidden={!volteada}
          inert={!volteada}
          className={`${cara} rotate-y-180 space-y-4 overflow-y-auto overscroll-contain border-[6px] border-tablero-marco bg-tablero text-[15px] text-tiza`}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-tiza text-3xl font-bold leading-none">{ficha.sigla}</p>
            <RotateCw className="size-4 text-tiza/70" aria-hidden />
          </div>
          <p className="leading-relaxed">{ficha.definicion}</p>

          <p className="flex items-start gap-2 rounded-xl bg-white/10 p-3 text-xs font-bold">
            <Scale className="mt-0.5 size-4 shrink-0" /> {ficha.norma}
          </p>

          <div>
            <h3 className="mb-2 font-sans text-xs font-bold uppercase tracking-wide text-tiza/80">Claves para el examen</h3>
            <ul className="space-y-2">
              {ficha.puntos_clave.map((punto) => (
                <li key={punto} className="flex gap-2 leading-snug">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-verde-claro" />
                  <span>{punto}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border-2 border-resaltador p-3">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-resaltador">
              <AlertTriangle className="size-4" /> Trampa frecuente
            </p>
            <p className="mt-1 leading-snug">{ficha.error_frecuente}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
