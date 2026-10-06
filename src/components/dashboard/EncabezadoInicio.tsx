"use client";

import { useEffect, useState } from "react";
import BotonPerfil from "@/components/dashboard/BotonPerfil";

const formatoFecha = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" });

/** Encabezado del inicio en papel cuadriculado: fecha, «Hola, profe.» y la nota a mano */
export default function EncabezadoInicio({ resumen }: { resumen: string }) {
  // La página es estática: la fecha solo se conoce en el navegador
  const [fecha, setFecha] = useState("");
  useEffect(() => setFecha(formatoFecha.format(new Date())), []);

  return (
    <header className="cuadricula rounded-3xl px-5 pt-4 pb-5 ring-1 ring-slate-200 dark:ring-slate-700/60">
      <div className="flex items-center justify-between gap-3">
        <p className="min-h-5 text-sm font-semibold text-texto-tenue first-letter:uppercase">{fecha}</p>
        <BotonPerfil />
      </div>
      <div className="margen-cuaderno mt-3">
        <h1 className="text-[44px] leading-none tracking-[-0.02em]">Hola, profe.</h1>
        <p className="mt-2 font-tiza text-2xl font-bold leading-tight text-secondary-light">
          Cada pregunta de hoy es un paso hacia tu plaza.
        </p>
      </div>
      <p className="mt-4 text-xs text-texto-tenue">{resumen}</p>
    </header>
  );
}
