"use client";

import Link from "next/link";
import { ChevronRight, Layers, RotateCcw, Target, Timer, Zap, type LucideIcon } from "lucide-react";
import { useProgreso } from "@/hooks/useProgreso";
import { FICHAS } from "@/lib/fichas";
import { resumenRepaso } from "@/lib/repaso";

interface Opcion {
  titulo: string;
  detalle: string;
  Icono: LucideIcon;
  /** Sin enlace la opción se muestra como informativa (p. ej. repaso sin pendientes) */
  href?: string;
  /** Errores por reforzar: se resalta en mora */
  reforzar?: boolean;
}

/** Las formas de estudiar, con nombre sencillo, cuánto toma y qué pasa al tocarlas */
export default function OpcionesEstudio() {
  const progreso = useProgreso();
  const pendientes = progreso ? resumenRepaso(progreso).hoy : 0;

  const opciones: Opcion[] = [
    {
      titulo: "Práctica rápida",
      detalle: "10 preguntas · unos 10 min · ves la respuesta al instante",
      Icono: Zap,
      href: "/practica?modo=express_10&empezar=1",
    },
    { titulo: "Practicar un tema", detalle: "Eliges el área o el tema · hasta 20 preguntas", Icono: Target, href: "/practica?modo=area_20" },
    { titulo: "Simulacro", detalle: "Como el examen real, con tiempo · corto o completo", Icono: Timer, href: "/simulacros" },
    pendientes > 0
      ? {
          titulo: "Repasar mis errores",
          detalle: `${pendientes} ${pendientes === 1 ? "pregunta" : "preguntas"} para hoy · lo que fallaste, en el momento justo`,
          Icono: RotateCcw,
          href: "/practica?filtro=repaso&empezar=1",
          reforzar: true,
        }
      : { titulo: "Repasar mis errores", detalle: "Hoy no tienes pendientes. Aquí aparecen las preguntas que falles.", Icono: RotateCcw },
    { titulo: "Fichas de normas", detalle: `${FICHAS.length} conceptos clave en tarjetas`, Icono: Layers, href: "/normatividad" },
  ];

  return (
    <ul className="space-y-2.5">
      {opciones.map(({ titulo, detalle, Icono, href, reforzar }) => {
        const contenido = (
          <>
            <span
              className={`grid size-11 shrink-0 place-items-center rounded-xl ${
                reforzar ? "bg-mora-suave text-danger dark:text-danger-light" : href ? "bg-verde-suave text-secondary-light" : "bg-slate-100 text-texto-tenue dark:bg-slate-700/60"
              }`}
            >
              <Icono className="size-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-heading text-lg font-bold leading-tight">{titulo}</span>
              <span className="mt-0.5 block text-sm leading-snug text-texto-tenue">{detalle}</span>
            </span>
            {href && <ChevronRight className="size-5 shrink-0 text-texto-tenue" />}
          </>
        );
        const estilo = `flex items-center gap-4 rounded-3xl p-4 ring-1 ${
          reforzar ? "bg-tarjeta ring-2 ring-danger/40 dark:ring-danger-light/40" : "bg-tarjeta ring-slate-200 dark:ring-slate-700/60"
        }`;
        return (
          <li key={titulo}>
            {href ? (
              <Link href={href} className={`${estilo} transition hover:ring-primary-light active:scale-[0.99]`}>
                {contenido}
              </Link>
            ) : (
              <div className={`${estilo} opacity-80`}>{contenido}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
