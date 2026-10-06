"use client";

import Link from "next/link";
import { ChevronRight, Layers, Settings2, Trees, Users } from "lucide-react";
import { usePerfil } from "@/hooks/usePerfil";
import { obtenerCategoria } from "@/lib/categorias";
import { CONTEO_POR_CATEGORIA, filtrarPreguntas, filtroDeGrupo } from "@/lib/preguntas";
import { ROLES } from "@/lib/perfil";

const tarjeta = "rounded-3xl bg-tarjeta p-5 ring-1 ring-slate-200 dark:ring-slate-700/60";

/** Accesos directos a lo que le toca estudiar al aspirante según su perfil */
export default function RutaEstudio() {
  const { perfil, cargado } = usePerfil();

  if (!cargado) return null;

  if (!perfil) {
    return (
      <Link href="/perfil" className={`${tarjeta} flex items-center gap-4 transition hover:ring-primary-light`}>
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary-light dark:bg-primary-light/20">
          <Settings2 className="size-6" />
        </span>
        <span className="flex-1">
          <span className="block font-semibold">Personaliza tu preparación</span>
          <span className="block text-sm text-texto-tenue">Elige tu rol, especialidad y contexto para ver tu ruta de estudio.</span>
        </span>
        <ChevronRight className="size-5 text-texto-tenue" />
      </Link>
    );
  }

  const nucleo = filtroDeGrupo("core_transversal");
  const directivos = filtroDeGrupo("directivos_docentes");
  const especialidad = obtenerCategoria(perfil.specialty);
  const rutas = [
    { href: `/practica?filtro=${nucleo}`, titulo: "Núcleo común", detalle: `${filtrarPreguntas(nucleo).length} preguntas`, Icono: Layers },
    perfil.role === "directivo_docente"
      ? { href: `/practica?filtro=${directivos}`, titulo: "Gestión directiva", detalle: `${filtrarPreguntas(directivos).length} preguntas`, Icono: Users }
      : especialidad && {
          href: `/practica?filtro=${especialidad.id}`,
          titulo: especialidad.nombre,
          detalle: `${CONTEO_POR_CATEGORIA[especialidad.id] ?? 0} preguntas`,
          Icono: especialidad.Icono,
        },
    perfil.context === "rural_pdet" && {
      href: "/practica?filtro=rural_pdet",
      titulo: "Contexto rural",
      detalle: `${CONTEO_POR_CATEGORIA.rural_pdet ?? 0} preguntas`,
      Icono: Trees,
    },
  ].filter(Boolean) as { href: string; titulo: string; detalle: string; Icono: typeof Layers }[];

  return (
    <section className={tarjeta} aria-labelledby="titulo-ruta">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="titulo-ruta" className="font-bold">
          Tu ruta de estudio
        </h2>
        <Link href="/perfil" className="text-xs font-semibold text-primary-light">
          {ROLES.find((r) => r.id === perfil.role)?.nombre}
        </Link>
      </div>
      <ul className="mt-3 grid gap-2 md:grid-cols-3">
        {rutas.map(({ href, titulo, detalle, Icono }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 transition hover:bg-slate-100 dark:bg-slate-700/40 dark:hover:bg-slate-700/60"
            >
              <Icono className="size-5 shrink-0 text-primary-light" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{titulo}</span>
                <span className="block text-xs text-texto-tenue">{detalle}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-texto-tenue" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
