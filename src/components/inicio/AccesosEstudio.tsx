import Link from "next/link";
import { ChevronRight, Layers, Target, Timer } from "lucide-react";

const ACCESOS = [
  { href: "/practica?modo=area_20", titulo: "Por tema", detalle: "Tú eliges", Icono: Target },
  { href: "/simulacros", titulo: "Simulacro", detalle: "Como el examen", Icono: Timer },
  { href: "/normatividad", titulo: "Fichas", detalle: "Normas clave", Icono: Layers },
];

/** Otras formas de estudiar, sin competir con «Tu siguiente paso» */
export default function AccesosEstudio() {
  return (
    <section aria-labelledby="titulo-accesos">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 id="titulo-accesos" className="text-base">
          Estudiar a tu manera
        </h2>
        <Link href="/estudiar" className="flex items-center gap-0.5 text-sm font-bold text-primary-dark dark:text-secondary-light">
          Ver todo <ChevronRight className="size-4" />
        </Link>
      </div>
      <ul className="mt-2 grid grid-cols-3 gap-2">
        {ACCESOS.map(({ href, titulo, detalle, Icono }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex h-full flex-col items-center gap-1 rounded-2xl bg-tarjeta px-2 py-3 text-center ring-1 ring-slate-200 transition active:scale-[0.97] dark:ring-slate-700/60"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-verde-suave text-secondary-light">
                <Icono className="size-5" />
              </span>
              <span className="text-sm font-bold leading-tight">{titulo}</span>
              <span className="text-[11px] leading-tight text-texto-tenue">{detalle}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
