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
      <div className="relative mb-4 flex-1 rounded-3xl rounded-bl-md bg-white p-4 text-sm leading-relaxed shadow-sm ring-1 ring-slate-200 dark:bg-tarjeta dark:ring-slate-700/60">
        {/* Colita del globo apuntando al capibara */}
        <span
          aria-hidden
          className="absolute -left-1.5 bottom-3 size-3 rotate-45 bg-white ring-1 ring-slate-200 [clip-path:polygon(0_0,0_100%,100%_100%)] dark:bg-tarjeta dark:ring-slate-700/60"
        />
        <p aria-live="polite">
          {mostrandoConsejo && (
            <span className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-accent">
              <Lightbulb className="size-3.5" /> Consejo {consejo + 1}/{CONSEJOS.length}
            </span>
          )}
          {mostrandoConsejo ? CONSEJOS[consejo] : estado.mensaje}
        </p>
        <p className="mt-1.5 text-xs text-slate-500">{mostrandoConsejo ? "Tócame para otro consejo" : "Tócame para un consejo"}</p>
      </div>
    </section>
  );
}
