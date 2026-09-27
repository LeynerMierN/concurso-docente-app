"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BadgeCheck, Calculator, ScrollText } from "lucide-react";

const PESTANAS = [
  { id: "reglas", etiqueta: "Reglas", Icono: ScrollText },
  { id: "salarios", etiqueta: "Salarios", Icono: Calculator },
  { id: "beneficios", etiqueta: "Beneficios", Icono: BadgeCheck },
] as const;

type IdPestana = (typeof PESTANAS)[number]["id"];

/** Pestañas sincronizadas con el hash (#reglas, #salarios, #beneficios) para poder enlazarlas */
export default function PestanasConvocatoria({ paneles }: { paneles: Record<IdPestana, ReactNode> }) {
  const [activa, setActiva] = useState<IdPestana>("reglas");

  useEffect(() => {
    const leerHash = () => {
      const hash = window.location.hash.slice(1);
      if (PESTANAS.some((p) => p.id === hash)) setActiva(hash as IdPestana);
    };
    leerHash();
    window.addEventListener("hashchange", leerHash);
    return () => window.removeEventListener("hashchange", leerHash);
  }, []);

  const elegir = (id: IdPestana) => {
    setActiva(id);
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className="space-y-5">
      <div
        role="tablist"
        aria-label="Secciones de la convocatoria"
        className="sticky top-0 z-20 -mx-4 bg-[var(--fondo)]/90 px-4 py-2 backdrop-blur"
      >
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-200/70 p-1 dark:bg-slate-800">
          {PESTANAS.map(({ id, etiqueta, Icono }) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={activa === id}
              aria-controls={`panel-${id}`}
              onClick={() => elegir(id)}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold transition ${
                activa === id
                  ? "bg-white text-marca-600 shadow-sm dark:bg-slate-950 dark:text-oro"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <Icono className="size-4" /> {etiqueta}
            </button>
          ))}
        </div>
      </div>

      {PESTANAS.map(({ id }) => (
        <div key={id} role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} hidden={activa !== id}>
          {paneles[id]}
        </div>
      ))}
    </div>
  );
}
