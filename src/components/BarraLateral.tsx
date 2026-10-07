"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown } from "lucide-react";
import config from "@data/app_config.json";
import { PESTANAS, coincideRuta, pestanaActiva } from "@/lib/navegacion";

const APP = config.app_metadata;

/** Menú lateral fijo para escritorio (≥1024 px): las cuatro pestañas y, debajo, sus páginas */
export default function BarraLateral() {
  const actual = usePathname();
  const activa = pestanaActiva(actual);

  return (
    <aside className="barra-app fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-fondo px-4 py-6 lg:flex dark:border-slate-700">
      <Link href="/" className="flex items-center gap-3 px-2">
        <Image src="/icons/icon-192.png" alt="" width={40} height={40} className="rounded-xl" />
        <span className="min-w-0">
          <span className="block font-heading font-extrabold leading-tight">{APP.name}</span>
          <span className="block text-xs leading-snug text-texto-tenue">{APP.tagline}</span>
        </span>
      </Link>

      <nav aria-label="Secciones" className="mt-8 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {PESTANAS.map(({ id, etiqueta, ruta, Icono, subenlaces }) => {
            const esActiva = activa?.id === id;
            return (
              <li key={id}>
                <Link
                  href={ruta}
                  aria-current={esActiva && actual === ruta ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition ${
                    esActiva ? "font-bold text-primary-dark dark:text-secondary-light" : "text-texto-tenue hover:bg-slate-100 hover:text-texto dark:hover:bg-slate-700/60"
                  }`}
                >
                  <Icono className="size-5 shrink-0" strokeWidth={esActiva ? 2.4 : 1.8} />
                  <span className={`text-sm ${esActiva ? "resaltado" : "font-semibold"}`}>{etiqueta}</span>
                </Link>
                {subenlaces && (
                  <ul className="mt-0.5 mb-1 ml-11 space-y-0.5 border-l border-slate-200 pl-3 dark:border-slate-700">
                    {subenlaces.map((sub) => {
                      const subActivo = coincideRuta(actual, sub.ruta);
                      return (
                        <li key={sub.ruta}>
                          <Link
                            href={sub.ruta}
                            aria-current={subActivo ? "page" : undefined}
                            className={`block rounded-lg px-2 py-1 text-sm transition ${
                              subActivo ? "font-bold text-primary-dark dark:text-secondary-light" : "text-texto-tenue hover:text-texto"
                            }`}
                          >
                            {sub.etiqueta}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <Link
        href="/premium"
        className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-texto-tenue transition hover:bg-slate-100 hover:text-texto dark:hover:bg-slate-700/60"
      >
        <Crown className="size-4 text-accent-dark" /> Modo Premium
      </Link>
      <p className="mt-2 px-3 text-[11px] text-texto-tenue">v{APP.version}</p>
    </aside>
  );
}
