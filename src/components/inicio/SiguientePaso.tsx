"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Capibara from "@/components/mascota/Capibara";
import { useProgreso } from "@/hooks/useProgreso";
import { siguientePaso } from "@/lib/siguientePaso";

/** La tarjeta principal del inicio: Capi recomienda una sola cosa y hay un solo botón para hacerla */
export default function SiguientePaso() {
  const progreso = useProgreso();
  if (!progreso) return <div className="h-52 motion-safe:animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-700/60" aria-hidden />;

  const paso = siguientePaso(progreso);
  const secundario = paso.tipo === "listo";

  return (
    <section aria-labelledby="titulo-siguiente" className="rounded-3xl bg-tarjeta p-5 ring-1 ring-slate-200 dark:ring-slate-700/60">
      <div className="flex items-start gap-3">
        <Capibara animo={paso.animo} tamano={64} mirarPuntero={false} className="shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-dark dark:text-secondary-light">Tu siguiente paso</p>
          <h2 id="titulo-siguiente" className="mt-0.5 text-xl leading-tight">
            {paso.titulo}
          </h2>
          <p className="mt-1 text-[15px] leading-snug text-texto-tenue">{paso.detalle}</p>
        </div>
      </div>
      <Link
        href={paso.href}
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-bold transition active:scale-[0.98] ${
          secundario ? "bg-tarjeta ring-1 ring-slate-300 dark:ring-slate-600" : "bg-primary text-white"
        }`}
      >
        {paso.boton} <ArrowRight className="size-5" />
      </Link>
    </section>
  );
}
