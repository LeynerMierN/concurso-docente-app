"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import Capibara from "@/components/mascota/Capibara";
import { usePerfil } from "@/hooks/usePerfil";
import { useProgreso } from "@/hooks/useProgreso";
import { CONSEJOS, estadoMascota } from "@/lib/mascota";

/** Sabino en el inicio: comenta tu progreso de hoy y, al tocarlo, da un consejo de estudio */
export default function MascotaInicio() {
  const progreso = useProgreso();
  const { perfil, cargado } = usePerfil();
  // -1 = mensaje de progreso; 0..n = índice del consejo actual
  const [consejo, setConsejo] = useState(-1);

  if (!progreso || !cargado) return <div className="h-28 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-700/60" aria-hidden />;

  const estado = estadoMascota(progreso, perfil);
  const mostrandoConsejo = consejo >= 0;

  return (
    <section aria-label="Sabino, tu capibara de estudio" className="flex items-end gap-3">
      <Capibara
        animo={mostrandoConsejo ? "pensando" : estado.animo}
        tamano={84}
        onToque={() => setConsejo((c) => (c + 1) % CONSEJOS.length)}
      />
      {/* Tablero de clase con marco de madera: Sabino escribe con tiza */}
      <div className="relative mb-3 flex-1 rounded-xl border-[6px] border-tablero-marco bg-tablero bg-[radial-gradient(circle_at_30%_20%,rgb(255_255_255/0.08),transparent_60%)] px-4 pt-3 pb-4 text-slate-50 shadow-md">
        <p aria-live="polite" className="font-tiza text-xl leading-snug">
          {mostrandoConsejo && (
            <span className="mb-0.5 flex items-center gap-1 font-sans text-xs font-bold uppercase tracking-wide text-oro">
              <Lightbulb className="size-3.5" /> Consejo {consejo + 1}/{CONSEJOS.length}
            </span>
          )}
          {mostrandoConsejo ? CONSEJOS[consejo] : estado.mensaje}
        </p>
        <p className="mt-1.5 text-xs text-white/60">{mostrandoConsejo ? "Toca a Sabino para otro consejo" : "Toca a Sabino para un consejo"}</p>
        {/* Repisa con una tiza */}
        <span aria-hidden className="absolute inset-x-3 -bottom-[6px] h-1.5 rounded-sm bg-amber-950/70">
          <span className="absolute -top-1 right-4 h-1.5 w-5 rounded-sm bg-white/90" />
        </span>
      </div>
    </section>
  );
}
