"use client";

import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import Capibara from "@/components/mascota/Capibara";
import { CONSEJOS } from "@/lib/mascota";
import { diaLocal } from "@/lib/racha";

/** Consejo del día en el tablero de Capi; «Otro consejo» o tocar a Capi pasa al siguiente */
export default function ConsejoCapi() {
  // null hasta montar: el consejo del día depende de la fecha local, que solo se conoce en el navegador
  const [indice, setIndice] = useState<number | null>(null);

  useEffect(() => {
    let h = 0;
    for (const c of diaLocal(new Date())) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    setIndice(h % CONSEJOS.length);
  }, []);

  if (indice === null) return <div className="h-40 motion-safe:animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-700/60" aria-hidden />;

  const siguiente = () => setIndice((i) => ((i ?? 0) + 1) % CONSEJOS.length);

  return (
    <section aria-label="Consejo de Capi" className="flex items-end gap-3">
      <Capibara animo="pensando" tamano={76} onToque={siguiente} />
      {/* Tablero de clase: los consejos son contenido de estudio, así que van en letra de lectura, no en tiza */}
      <div className="relative mb-3 flex-1 rounded-xl border-[6px] border-tablero-marco bg-tablero px-4 pt-3 pb-4 text-tiza">
        <div aria-live="polite">
          <p className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-resaltador">
            <Lightbulb className="size-3.5" /> Consejo de Capi
          </p>
          <p className="text-[15px] leading-snug">{CONSEJOS[indice]}</p>
        </div>
        <button
          type="button"
          onClick={siguiente}
          className="mt-3 rounded-full border-2 border-resaltador px-3 py-1 text-sm font-bold text-tiza transition hover:bg-resaltador/10 active:scale-95"
        >
          Otro consejo
        </button>
        {/* Repisa con una tiza */}
        <span aria-hidden className="absolute inset-x-3 -bottom-[6px] h-1.5 rounded-sm bg-tablero-marco brightness-75">
          <span className="absolute -top-1 right-4 h-1.5 w-5 rounded-sm bg-tiza" />
        </span>
      </div>
    </section>
  );
}
