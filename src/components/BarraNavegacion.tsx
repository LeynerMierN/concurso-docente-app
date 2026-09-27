"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenCheck, ClipboardList, Home, Layers, Wallet } from "lucide-react";

const ENLACES = [
  { href: "/", etiqueta: "Inicio", Icono: Home },
  { href: "/practica", etiqueta: "Práctica", Icono: BookOpenCheck },
  { href: "/simulacro", etiqueta: "Simulacro", Icono: ClipboardList },
  { href: "/fichas", etiqueta: "Fichas", Icono: Layers },
  { href: "/convocatoria", etiqueta: "Convocatoria", Icono: Wallet },
];

export default function BarraNavegacion() {
  const ruta = usePathname();

  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 pt-2 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <ul className="mx-auto grid max-w-md grid-cols-5 px-1">
        {ENLACES.map(({ href, etiqueta, Icono }) => {
          const activo = href === "/" ? ruta === "/" : ruta.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 rounded-xl px-1 py-1 text-[11px] font-medium transition ${
                  activo ? "text-marca-600 dark:text-oro" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Icono className="size-6" strokeWidth={activo ? 2.4 : 1.8} />
                {etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
