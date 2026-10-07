import { HelpCircle } from "lucide-react";

/**
 * Explicación de una línea para los términos propios de la app (constancia, puntos de mérito…).
 * Usa <details>: se abre y se cierra sin JavaScript y los lectores de pantalla lo entienden.
 */
export default function QueEs({ children }: { children: React.ReactNode }) {
  return (
    <details className="group mt-1 text-sm">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 font-bold text-primary-dark dark:text-secondary-light [&::-webkit-details-marker]:hidden">
        <HelpCircle className="size-4" /> ¿Qué es?
      </summary>
      <p className="mt-1 leading-snug text-texto-tenue">{children}</p>
    </details>
  );
}
