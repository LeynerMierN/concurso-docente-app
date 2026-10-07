"use client";

import Link from "next/link";
import { ChevronRight, Layers, Trees, UserRoundCog, Users } from "lucide-react";
import { usePerfil } from "@/hooks/usePerfil";
import { filtroDeGrupo, obtenerCategoria } from "@/lib/categorias";
import { ROLES } from "@/lib/perfil";

const tarjeta = "rounded-3xl bg-tarjeta p-5 ring-1 ring-slate-200 dark:ring-slate-700/60";

/**
 * Lo que le toca estudiar según su cargo: núcleo común, su especialidad o la gestión directiva, y lo rural.
 * `conteos` llega calculado desde el servidor (id de categoría o filtro de grupo → preguntas), así esta tarjeta
 * no descarga el banco de preguntas.
 */
export default function RutaEstudio({ conteos }: { conteos: Record<string, number> }) {
  const { perfil, cargado } = usePerfil();

  if (!cargado) return null;

  if (!perfil) {
    return (
      <Link href="/perfil" className={`${tarjeta} flex items-center gap-4 transition hover:ring-primary-light`}>
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-verde-suave text-secondary-light">
          <UserRoundCog className="size-6" />
        </span>
        <span className="flex-1">
          <span className="block font-bold">¿A qué cargo aspiras?</span>
          <span className="block text-sm text-texto-tenue">Elígelo y te mostramos qué estudiar para tu prueba.</span>
        </span>
        <ChevronRight className="size-5 text-texto-tenue" />
      </Link>
    );
  }

  const nucleo = filtroDeGrupo("core_transversal");
  const directivos = filtroDeGrupo("directivos_docentes");
  const especialidad = obtenerCategoria(perfil.specialty);
  const rutas = [
    { href: `/practica?filtro=${nucleo}`, titulo: "Núcleo común", detalle: "Lo presentan todos", Icono: Layers },
    perfil.role === "directivo_docente"
      ? { href: `/practica?filtro=${directivos}`, titulo: "Gestión directiva", detalle: `${conteos[directivos] ?? 0} preguntas`, Icono: Users }
      : especialidad && {
          href: `/practica?filtro=${especialidad.id}`,
          titulo: especialidad.nombre,
          detalle: `${conteos[especialidad.id] ?? 0} preguntas`,
          Icono: especialidad.Icono,
        },
    perfil.context === "rural_pdet" && {
      href: "/practica?filtro=rural_pdet",
      titulo: "Contexto rural",
      detalle: `${conteos.rural_pdet ?? 0} preguntas`,
      Icono: Trees,
    },
  ].filter(Boolean) as { href: string; titulo: string; detalle: string; Icono: typeof Layers }[];

  return (
    <section className={tarjeta} aria-labelledby="titulo-ruta">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="titulo-ruta" className="text-lg">
          Para tu cargo
        </h2>
        <Link href="/perfil" className="text-sm font-bold text-primary-dark dark:text-secondary-light">
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
              <Icono className="size-5 shrink-0 text-secondary-light" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{titulo}</span>
                <span className="block text-xs text-texto-tenue">{detalle}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-texto-tenue" />
            </Link>
          </li>
        ))}
      </ul>
      {perfil.role === "docente_aula" && !especialidad && (
        <p className="mt-3 text-sm text-texto-tenue">
          <Link href="/perfil" className="font-bold text-primary-dark underline underline-offset-4 dark:text-secondary-light">
            Elige tu especialidad
          </Link>{" "}
          para practicar también las preguntas de tu área.
        </p>
      )}
    </section>
  );
}
