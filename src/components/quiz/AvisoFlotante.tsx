"use client";

import { useEffect } from "react";
import Capibara, { type AnimoMascota } from "@/components/mascota/Capibara";

export interface Aviso {
  /** Cambia en cada aviso para reiniciar la animación y el temporizador */
  id: number;
  texto: string;
  animo: AnimoMascota;
}

/** Mensaje de Sabino que aparece abajo unos segundos sin tapar el cronómetro; se cierra al tocarlo */
export default function AvisoFlotante({ aviso, onCerrar }: { aviso: Aviso | null; onCerrar: () => void }) {
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(onCerrar, 3200);
    return () => clearTimeout(t);
  }, [aviso, onCerrar]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 lg:bottom-6 lg:pl-64">
      {aviso && (
        <button
          key={aviso.id}
          type="button"
          onClick={onCerrar}
          className="aviso-entrar pointer-events-auto flex max-w-sm items-center gap-3 rounded-3xl bg-white py-2 pr-4 pl-2 text-left text-sm font-semibold shadow-lg ring-1 ring-slate-200 dark:bg-tarjeta dark:ring-slate-700"
        >
          <Capibara animo={aviso.animo} tamano={40} mirarPuntero={false} />
          <span>{aviso.texto}</span>
        </button>
      )}
    </div>
  );
}
