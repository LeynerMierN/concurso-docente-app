"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, EyeOff, Layers } from "lucide-react";
import Volver from "@/components/Volver";
import TarjetaFicha from "@/components/fichas/TarjetaFicha";
import { CATEGORIAS_FICHAS, FICHAS, fichasDe, type CategoriaFicha } from "@/lib/fichas";

type Filtro = CategoriaFicha | "Todas";

export default function Pagina() {
  const [categoria, setCategoria] = useState<Filtro>("Todas");
  const [indice, setIndice] = useState(0);
  const [volteada, setVolteada] = useState(false);

  const fichas = fichasDe(categoria);
  const ficha = fichas[indice];

  const irA = useCallback(
    (nuevo: number) => {
      setIndice(Math.max(0, Math.min(nuevo, fichas.length - 1)));
      setVolteada(false);
    },
    [fichas.length],
  );

  const elegirCategoria = (c: Filtro) => {
    setCategoria(c);
    setIndice(0);
    setVolteada(false);
  };

  // Atajos de teclado: ← → para navegar
  useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") irA(indice - 1);
      if (e.key === "ArrowRight") irA(indice + 1);
    };
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [indice, irA]);

  const filtros: { id: Filtro; total: number }[] = [
    { id: "Todas", total: FICHAS.length },
    ...CATEGORIAS_FICHAS.map((c) => ({ id: c, total: fichasDe(c).length })),
  ];

  return (
    <div className="space-y-5">
      <header>
        <Volver href="/estudiar" etiqueta="Estudiar" />
        <h1 className="mt-1 flex items-center gap-2 text-2xl">
          <Layers className="size-7 text-secondary-light" /> Fichas de normas
        </h1>
        <p className="mt-1 text-sm text-texto-tenue">Repasa los conceptos que más se preguntan en el examen.</p>
      </header>

      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
        <ul className="flex w-max gap-2">
          {filtros.map(({ id, total }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => elegirCategoria(id)}
                aria-pressed={categoria === id}
                className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm transition ${
                  categoria === id
                    ? "bg-marca-600 font-semibold text-white"
                    : "bg-tarjeta text-slate-700 ring-1 ring-slate-200 dark:text-slate-300 dark:ring-slate-700/60"
                }`}
              >
                {id} <span className="opacity-70">· {total}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {ficha && (
        <>
          <div className="flex items-center justify-between text-sm">
            <p className="font-semibold" aria-live="polite">
              Ficha {indice + 1} de {fichas.length}
            </p>
            <div className="flex gap-1" aria-hidden>
              {fichas.map((f, i) => (
                <span
                  key={f.id}
                  className={`h-1.5 rounded-full transition-all ${i === indice ? "w-5 bg-marca-600 dark:bg-secondary-light" : "w-1.5 bg-slate-300 dark:bg-slate-700"}`}
                />
              ))}
            </div>
          </div>

          <TarjetaFicha key={ficha.id} ficha={ficha} volteada={volteada} onVoltear={() => setVolteada((v) => !v)} />

          <div className="grid grid-cols-[auto_1fr_auto] gap-2">
            <button
              type="button"
              onClick={() => irA(indice - 1)}
              disabled={indice === 0}
              aria-label="Ficha anterior"
              className="grid size-12 place-items-center rounded-2xl bg-tarjeta ring-1 ring-slate-200 disabled:opacity-40 dark:ring-slate-700/60"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={() => setVolteada((v) => !v)}
              aria-pressed={volteada}
              className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl bg-primary px-2 text-[13px] font-bold text-white active:scale-[0.98]"
            >
              {volteada ? <EyeOff className="size-5 shrink-0" /> : <Eye className="size-5 shrink-0" />}
              {volteada ? "Ver la pregunta" : "Ver respuesta / sustento"}
            </button>
            <button
              type="button"
              onClick={() => irA(indice + 1)}
              disabled={indice === fichas.length - 1}
              aria-label="Ficha siguiente"
              className="grid size-12 place-items-center rounded-2xl bg-marca-600 text-white disabled:opacity-40 active:scale-[0.98]"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
