"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound, Wallet } from "lucide-react";
import { APP, MODULOS_NAVEGACION } from "@/lib/appConfig";

/** Enlaces que no están en navigation_modules */
const RECURSOS = [
  { ruta: "/convocatoria", etiqueta: "Convocatoria y salario", Icono: Wallet },
  { ruta: "/perfil", etiqueta: "Mi perfil", Icono: UserRound },
];

export function esRutaActiva(actual: string, ruta: string) {
  return ruta === "/" ? actual === "/" : actual.startsWith(ruta);
}

/** Menú lateral fijo para escritorio (≥1024 px), construido desde data/app_config.json */
export default function BarraLateral() {
  const actual = usePathname();

  const enlace = (ruta: string, activo: boolean) =>
    `group flex items-start gap-3 rounded-2xl px-3 py-2.5 transition ${
      activo
        ? "bg-primary text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/60"
    }`;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex dark:border-slate-700 dark:bg-tarjeta">
      <Link href="/" className="flex items-center gap-3 px-2">
        <Image src="/icons/icon-192.png" alt="" width={40} height={40} className="rounded-xl" />
        <span className="min-w-0">
          <span className="block font-heading font-extrabold leading-tight">{APP.name}</span>
          <span className="block text-xs leading-snug text-slate-500">{APP.tagline}</span>
        </span>
      </Link>

      <nav aria-label="Módulos" className="mt-8 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {MODULOS_NAVEGACION.map(({ id, etiqueta, descripcion, ruta, Icono }) => {
            const activo = esRutaActiva(actual, ruta);
            return (
              <li key={id}>
                <Link href={ruta} aria-current={activo ? "page" : undefined} title={descripcion} className={enlace(ruta, activo)}>
                  <Icono className="mt-0.5 size-5 shrink-0" strokeWidth={activo ? 2.4 : 1.8} />
                  <span className="text-sm font-semibold">{etiqueta}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-8 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Recursos</p>
        <ul className="mt-2 space-y-1">
          {RECURSOS.map(({ ruta, etiqueta, Icono }) => {
            const activo = esRutaActiva(actual, ruta);
            return (
              <li key={ruta}>
                <Link href={ruta} aria-current={activo ? "page" : undefined} className={enlace(ruta, activo)}>
                  <Icono className="mt-0.5 size-5 shrink-0" strokeWidth={activo ? 2.4 : 1.8} />
                  <span className="text-sm font-semibold">{etiqueta}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <p className="px-2 text-[11px] text-slate-400">v{APP.version}</p>
    </aside>
  );
}
