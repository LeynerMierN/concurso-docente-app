import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/** Enlace de regreso a la sección madre, para no perderse dentro de una pestaña */
export default function Volver({ href, etiqueta }: { href: string; etiqueta: string }) {
  return (
    <Link href={href} className="-ml-1 inline-flex items-center gap-0.5 rounded-lg py-1 pr-2 text-sm font-bold text-texto-tenue hover:text-texto">
      <ChevronLeft className="size-4" /> {etiqueta}
    </Link>
  );
}
