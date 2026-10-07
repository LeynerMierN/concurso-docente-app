"use client";

import { useEffect, useState } from "react";
import BotonPerfil from "@/components/inicio/BotonPerfil";
import { useProgreso } from "@/hooks/useProgreso";

const formatoFecha = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" });

/**
 * Encabezado del inicio en papel cuadriculado. A quien llega por primera vez le dice para qué sirve la app;
 * a quien ya practica, la nota a mano de ánimo.
 */
export default function EncabezadoInicio() {
  const progreso = useProgreso();
  // La página es estática: la fecha solo se conoce en el navegador
  const [fecha, setFecha] = useState("");
  useEffect(() => setFecha(formatoFecha.format(new Date())), []);
  const nuevo = !!progreso && progreso.intentos.length === 0;

  return (
    <header className="cuadricula rounded-3xl px-5 pt-4 pb-4 ring-1 ring-slate-200 dark:ring-slate-700/60">
      <div className="margen-cuaderno">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="min-h-5 text-sm font-semibold text-texto-tenue first-letter:uppercase">{fecha}</p>
            <h1 className="mt-1 text-[40px] leading-none tracking-[-0.02em]">Hola, profe.</h1>
          </div>
          <BotonPerfil />
        </div>
        {nuevo ? (
          <p className="mt-2 text-[15px] leading-snug">Aquí te preparas para la prueba escrita del Concurso Docente de la CNSC.</p>
        ) : (
          <p className="mt-2 font-tiza text-xl font-bold leading-tight text-secondary-light">
            Cada pregunta de hoy es un paso hacia tu plaza.
          </p>
        )}
      </div>
    </header>
  );
}
