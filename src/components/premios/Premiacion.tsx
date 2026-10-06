"use client";

import { useEffect, useRef, useState } from "react";
import Diploma from "@/components/premios/Diploma";
import Medalla from "@/components/premios/Medalla";
import Trofeo from "@/components/premios/Trofeo";
import { celebrarAprobacion } from "@/lib/celebrar";
import type { Insignia } from "@/lib/insignias";
import type { Nivel, Trofeo as DatosTrofeo } from "@/lib/meritos";

export type Premio =
  | { tipo: "trofeo"; trofeo: DatosTrofeo }
  | { tipo: "medalla"; insignia: Insignia }
  | { tipo: "nivel"; nivel: Nivel };

/** Posiciones de los destellos alrededor del premio (en % del escenario) y su retraso */
const DESTELLOS = [
  { x: 14, y: 22, d: 0 },
  { x: 84, y: 16, d: 0.4 },
  { x: 8, y: 66, d: 0.8 },
  { x: 90, y: 60, d: 0.2 },
  { x: 28, y: 90, d: 1 },
  { x: 74, y: 88, d: 0.6 },
];

function textos(p: Premio, repeticion: boolean) {
  if (p.tipo === "trofeo")
    return { etiqueta: repeticion ? "Trofeo ganado" : "¡Nuevo trofeo!", titulo: p.trofeo.titulo, descripcion: p.trofeo.descripcion };
  if (p.tipo === "medalla")
    return { etiqueta: repeticion ? "Distinción ganada" : "¡Nueva distinción!", titulo: p.insignia.titulo, descripcion: p.insignia.descripcion };
  return {
    etiqueta: repeticion ? "Nivel alcanzado" : "¡Subiste de nivel!",
    titulo: `Nivel ${p.nivel.numero}: ${p.nivel.nombre}`,
    descripcion: "Tus puntos de mérito te llevaron a un nuevo nivel de formación. ¡Sigue así!",
  };
}

interface Props {
  premios: Premio[];
  onCerrar: () => void;
  /** Se vuelve a ver un premio ya ganado (desde la vitrina o los resultados) */
  repeticion?: boolean;
}

/** Ceremonia a pantalla completa: rayos de luz, el premio cae con rebote, destellos y confeti */
export default function Premiacion({ premios, onCerrar, repeticion = false }: Props) {
  const [indice, setIndice] = useState(0);
  const boton = useRef<HTMLButtonElement>(null);
  const premio = premios[indice];

  useEffect(() => {
    if (!premio) return;
    boton.current?.focus();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) celebrarAprobacion();
  }, [premio]);

  useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [onCerrar]);

  if (!premio) return null;
  const { etiqueta, titulo, descripcion } = textos(premio, repeticion);
  const hayMas = indice < premios.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-premio"
      className="premio-fondo fixed inset-0 z-50 grid place-items-center bg-slate-950/85 p-6 backdrop-blur-sm"
    >
      {/* La clave reinicia las animaciones con cada premio */}
      <div key={indice} className="w-full max-w-sm text-center text-white">
        <div className="relative mx-auto grid size-64 place-items-center">
          <div aria-hidden className="premio-rayos absolute inset-0 rounded-full" />
          <div aria-hidden className="absolute inset-10 rounded-full bg-resaltador/25 blur-2xl" />
          {DESTELLOS.map(({ x, y, d }) => (
            <svg
              key={`${x}-${y}`}
              viewBox="0 0 20 20"
              aria-hidden
              className="premio-chispa absolute size-5 text-resaltador"
              style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }}
            >
              <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="currentColor" />
            </svg>
          ))}
          <div className="premio-caer relative">
            {premio.tipo === "trofeo" && <Trofeo metal={premio.trofeo.metal} forma={premio.trofeo.forma} tamano={140} brillo />}
            {premio.tipo === "medalla" && <Medalla icono={premio.insignia.icono} tamano={120} balanceo />}
            {premio.tipo === "nivel" && <Diploma tamano={170} />}
          </div>
        </div>

        <p className="premio-texto mt-2 text-sm font-bold uppercase tracking-widest text-resaltador">{etiqueta}</p>
        <h2 id="titulo-premio" className="premio-texto mt-1 text-2xl font-extrabold" style={{ animationDelay: "0.1s" }}>
          {titulo}
        </h2>
        <p className="premio-texto mt-2 text-sm text-white/80" style={{ animationDelay: "0.2s" }}>
          {descripcion}
        </p>

        <button
          ref={boton}
          type="button"
          onClick={() => (hayMas ? setIndice((i) => i + 1) : onCerrar())}
          className="mt-6 w-full rounded-2xl bg-resaltador px-5 py-3 font-bold text-tinta outline-none transition focus-visible:ring-4 focus-visible:ring-white/60 active:scale-[0.98]"
        >
          {hayMas ? `Siguiente premio (${indice + 1}/${premios.length})` : repeticion ? "Cerrar" : "¡A seguir estudiando!"}
        </button>
      </div>
    </div>
  );
}
