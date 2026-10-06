"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import Capibara from "@/components/mascota/Capibara";
import { usePerfil } from "@/hooks/usePerfil";
import { useProgreso } from "@/hooks/useProgreso";
import { CONSEJOS, estadoMascota } from "@/lib/mascota";

/** Capi en el inicio: comenta tu progreso de hoy y, al tocarlo, da un consejo de estudio */
export default function MascotaInicio() {
  const progreso = useProgreso();
  const { perfil, cargado } = usePerfil();
  // -1 = mensaje de progreso; 0..n = índice del consejo actual
  const [consejo, setConsejo] = useState(-1);

  if (!progreso || !cargado) return <div className="h-28 motion-safe:animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-700/60" aria-hidden />;

  const estado = estadoMascota(progreso, perfil);
  const mostrandoConsejo = consejo >= 0;

  const siguienteConsejo = () => setConsejo((c) => (c + 1) % CONSEJOS.length);

  return (
    <section aria-label="Capi, tu capibara de estudio" className="flex items-end gap-3">
      <Capibara animo={mostrandoConsejo ? "pensando" : estado.animo} tamano={84} onToque={siguienteConsejo} />
      {/* Tablero de clase con marco de madera: Capi escribe con tiza */}
      <div className="relative mb-3 flex-1 rounded-xl border-[6px] border-tablero-marco bg-tablero px-4 pt-3 pb-4 text-tiza">
        {/* Ánimo corto en letra a mano; los consejos son contenido de estudio y van en letra de lectura */}
        <div aria-live="polite">
          {mostrandoConsejo ? (
            <>
              <p className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-resaltador">
                <Lightbulb className="size-3.5" /> Consejo {consejo + 1}/{CONSEJOS.length}
              </p>
              <p className="text-[15px] leading-snug">{CONSEJOS[consejo]}</p>
            </>
          ) : (
            <p className="font-tiza text-2xl font-bold leading-snug">{estado.mensaje}</p>
          )}
        </div>
        <button
          type="button"
          onClick={siguienteConsejo}
          className="mt-3 rounded-full border-2 border-resaltador px-3 py-1 text-sm font-bold text-tiza transition hover:bg-resaltador/10 active:scale-95"
        >
          {mostrandoConsejo ? "Otro consejo" : "Dame un consejo"}
        </button>
        {/* Repisa con una tiza */}
        <span aria-hidden className="absolute inset-x-3 -bottom-[6px] h-1.5 rounded-sm bg-tablero-marco brightness-75">
          <span className="absolute -top-1 right-4 h-1.5 w-5 rounded-sm bg-tiza" />
        </span>
      </div>
    </section>
  );
}
