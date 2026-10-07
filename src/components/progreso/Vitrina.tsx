"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import QueEs from "@/components/QueEs";
import Medalla from "@/components/premios/Medalla";
import Premiacion, { type Premio } from "@/components/premios/Premiacion";
import Trofeo from "@/components/premios/Trofeo";
import { INSIGNIAS, avanceInsignias } from "@/lib/insignias";
import { TROFEOS, trofeosGanados } from "@/lib/meritos";
import type { Progreso } from "@/lib/storage";

const fechaCorta = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" });

/** Trofeos de simulacro y distinciones; tocar uno ganado repite su ceremonia */
export default function Vitrina({ progreso }: { progreso: Progreso }) {
  const [premioVisto, setPremioVisto] = useState<Premio | null>(null);
  const avance = avanceInsignias(progreso);
  const desbloqueadas = progreso.insignias ?? {};
  const trofeos = new Set(trofeosGanados(progreso.intentos));
  const ganados = trofeos.size + Object.keys(desbloqueadas).length;

  return (
    <section className="rounded-3xl bg-tarjeta p-5 ring-1 ring-slate-200 dark:ring-slate-700/60" aria-labelledby="titulo-vitrina">
      <h2 id="titulo-vitrina" className="text-lg">
        Vitrina de premios · {ganados}/{TROFEOS.length + INSIGNIAS.length}
      </h2>
      <QueEs>
        Los trofeos se ganan al aprobar simulacros; las distinciones, al acertar preguntas de un tema. Toca uno ganado para ver
        su ceremonia.
      </QueEs>

      <h3 className="mt-4 text-xs font-bold uppercase tracking-wide text-texto-tenue">Trofeos de simulacro</h3>
      <ul className="mt-2 grid grid-cols-2 gap-3 border-b-8 border-tablero-marco pb-3 md:grid-cols-4">
        {TROFEOS.map((t) => {
          const ganado = trofeos.has(t.id);
          return (
            <li key={t.id}>
              <button
                type="button"
                disabled={!ganado}
                onClick={() => setPremioVisto({ tipo: "trofeo", trofeo: t })}
                className="flex h-full w-full flex-col items-center gap-1 rounded-2xl p-2 text-center transition enabled:hover:bg-slate-50 enabled:active:scale-95 dark:enabled:hover:bg-slate-700/40"
              >
                <Trofeo metal={t.metal} forma={t.forma} tamano={64} brillo={ganado} bloqueado={!ganado} className={ganado ? "premio-flotar" : ""} />
                <span className="text-sm font-bold leading-tight">{t.titulo}</span>
                <span className="text-xs leading-snug text-texto-tenue">{t.descripcion}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-texto-tenue">Distinciones</h3>
      <ul className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
        {INSIGNIAS.map((ins) => {
          const fecha = desbloqueadas[ins.id];
          const valor = Math.min(avance[ins.id] ?? 0, ins.meta);
          return (
            <li key={ins.id}>
              <button
                type="button"
                disabled={!fecha}
                onClick={() => setPremioVisto({ tipo: "medalla", insignia: ins })}
                className="flex h-full w-full flex-col items-center gap-1 rounded-2xl p-2 text-center transition enabled:hover:bg-slate-50 enabled:active:scale-95 dark:enabled:hover:bg-slate-700/40"
              >
                <Medalla icono={ins.icono} tamano={52} bloqueada={!fecha} balanceo={!!fecha} />
                <span className="text-sm font-bold leading-tight">{ins.titulo}</span>
                {fecha ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-secondary-light">
                    <Check className="size-3.5" /> {fechaCorta.format(new Date(fecha))}
                  </span>
                ) : (
                  <span className="w-full">
                    <span className="block h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
                      <span className="block h-full rounded-full bg-accent" style={{ width: `${(valor / ins.meta) * 100}%` }} />
                    </span>
                    <span className="mt-1 block text-xs tabular-nums text-texto-tenue">
                      {valor}/{ins.meta} {ins.unidad}
                    </span>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {premioVisto && <Premiacion premios={[premioVisto]} repeticion onCerrar={() => setPremioVisto(null)} />}
    </section>
  );
}
