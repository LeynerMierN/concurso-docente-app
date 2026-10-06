"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { esRutaActiva } from "@/components/BarraLateral";
import { MODULOS_MOVIL } from "@/lib/appConfig";

/** Barra inferior para celular y tablet, con los mismos módulos del config que el menú lateral */
export default function BarraNavegacion() {
  const actual = usePathname();

  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 pt-2 backdrop-blur lg:hidden dark:border-slate-700 dark:bg-tarjeta/90">
      <ul className="mx-auto grid max-w-md px-1" style={{ gridTemplateColumns: `repeat(${MODULOS_MOVIL.length}, minmax(0, 1fr))` }}>
        {MODULOS_MOVIL.map(({ id, etiquetaCorta, ruta, Icono }) => {
          const activo = esRutaActiva(actual, ruta);
          return (
            <li key={id}>
              <Link
                href={ruta}
                aria-current={activo ? "page" : undefined}
                className={`flex flex-col items-center gap-1 rounded-xl px-1 py-1 text-[10px] font-medium transition ${
                  activo ? "text-primary-light dark:text-oro" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Icono className="size-6" strokeWidth={activo ? 2.4 : 1.8} />
                <span className="max-w-full truncate">{etiquetaCorta}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
