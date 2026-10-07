"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PESTANAS, pestanaActiva } from "@/lib/navegacion";

/** Barra inferior para celular y tablet: las mismas cuatro pestañas que el menú lateral */
export default function BarraNavegacion() {
  const activa = pestanaActiva(usePathname());

  return (
    <nav className="barra-app pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-fondo/95 pt-2 backdrop-blur lg:hidden dark:border-slate-700">
      <ul className="mx-auto grid max-w-md grid-cols-4 px-1">
        {PESTANAS.map(({ id, etiqueta, ruta, Icono }) => {
          const esActiva = activa?.id === id;
          return (
            <li key={id}>
              <Link
                href={ruta}
                aria-current={esActiva ? "page" : undefined}
                className={`flex flex-col items-center gap-1 rounded-xl px-1 py-1 text-xs transition ${
                  esActiva ? "font-bold text-primary-dark dark:text-secondary-light" : "text-texto-tenue hover:text-texto"
                }`}
              >
                <Icono className="size-6" strokeWidth={esActiva ? 2.4 : 1.8} />
                {/* La pestaña activa se subraya con resaltador */}
                <span className={`max-w-full truncate ${esActiva ? "resaltado" : ""}`}>{etiqueta}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
