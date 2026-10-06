"use client";

import { Layers, Library, RotateCcw } from "lucide-react";
import { GRUPOS, NOMBRE_GRUPO } from "@/lib/categorias";
import { CATEGORIAS_CON_PREGUNTAS, CONTEO_POR_CATEGORIA, FILTROS_TEMATICOS, PREGUNTAS, filtrarPreguntas, filtroDeGrupo } from "@/lib/preguntas";
import type { FiltroExamen } from "@/types/exam";

interface Props {
  filtro: FiltroExamen | null;
  onElegir: (filtro: FiltroExamen) => void;
  /** Oculta las opciones que mezclan áreas (para modos enfocados en una sola) */
  soloUnaArea?: boolean;
  /** Preguntas falladas que toca repasar hoy */
  pendientesRepaso?: number;
}

const chip = (activo: boolean) =>
  `rounded-full px-3.5 py-2 text-left text-sm transition ${
    activo
      ? "bg-primary font-semibold text-white"
      : "bg-tarjeta text-slate-700 ring-1 ring-slate-200 dark:text-slate-300 dark:ring-slate-700/60"
  }`;

/** Selector de qué practicar, organizado por la taxonomía de data/app_config.json */
export default function SelectorCategorias({ filtro, onElegir, soloUnaArea, pendientesRepaso = 0 }: Props) {
  const nucleo = filtroDeGrupo("core_transversal");
  const repaso = filtro === "repaso";

  return (
    <div className="space-y-6">
      {pendientesRepaso > 0 && (
        <button
          type="button"
          onClick={() => onElegir("repaso")}
          aria-pressed={repaso}
          className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left transition active:scale-[0.99] ${
            repaso ? "bg-accent text-tinta shadow-md" : "bg-accent/10 ring-1 ring-accent/30"
          }`}
        >
          <RotateCcw className={`size-6 shrink-0 ${repaso ? "text-white" : "text-accent-dark"}`} />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Repaso de errores</span>
            <span className={`block text-sm ${repaso ? "text-white/90" : "text-slate-600 dark:text-slate-300"}`}>
              {pendientesRepaso} {pendientesRepaso === 1 ? "pregunta" : "preguntas"} que fallaste te esperan hoy
            </span>
          </span>
        </button>
      )}

      {!soloUnaArea && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-texto-tenue">Repaso general</h2>
          <ul className="flex flex-wrap gap-2">
            <li>
              <button type="button" onClick={() => onElegir(nucleo)} aria-pressed={filtro === nucleo} className={chip(filtro === nucleo)}>
                <Layers className="mr-1.5 inline size-4 align-[-3px]" />
                Núcleo común <span className="opacity-70">· {filtrarPreguntas(nucleo).length}</span>
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onElegir("todos")} aria-pressed={filtro === "todos"} className={chip(filtro === "todos")}>
                <Library className="mr-1.5 inline size-4 align-[-3px]" />
                Todo el banco <span className="opacity-70">· {PREGUNTAS.length}</span>
              </button>
            </li>
          </ul>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-texto-tenue">Temas clave</h2>
        <ul className="flex flex-wrap gap-2">
          {FILTROS_TEMATICOS.map((f) => (
            <li key={f.id}>
              <button type="button" onClick={() => onElegir(f.id)} aria-pressed={filtro === f.id} className={chip(filtro === f.id)}>
                {f.etiqueta} <span className="opacity-70">· {filtrarPreguntas(f.id).length}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {GRUPOS.map((grupo) => {
        const categorias = CATEGORIAS_CON_PREGUNTAS.filter((c) => c.grupo === grupo);
        if (categorias.length === 0) return null;
        return (
          <section key={grupo} className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-texto-tenue">{NOMBRE_GRUPO[grupo]}</h2>
            <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {categorias.map(({ id, nombre, Icono }) => {
                const activo = filtro === id;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => onElegir(id)}
                      aria-pressed={activo}
                      className={`flex h-full w-full items-start gap-2.5 rounded-2xl p-3 text-left transition active:scale-[0.98] ${
                        activo
                          ? "bg-primary text-white shadow-md"
                          : "bg-tarjeta ring-1 ring-slate-200 hover:ring-primary-light dark:ring-slate-700/60"
                      }`}
                    >
                      <Icono className={`mt-0.5 size-5 shrink-0 ${activo ? "text-white" : "text-primary-light"}`} />
                      <span className="min-w-0">
                        <span className="block hyphens-auto break-words text-sm font-semibold leading-snug">{nombre}</span>
                        <span className={`block text-xs ${activo ? "text-white/90" : "text-texto-tenue"}`}>
                          {CONTEO_POR_CATEGORIA[id]} preguntas
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
