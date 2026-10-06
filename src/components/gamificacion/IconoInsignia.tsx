import { Award, CalendarCheck2, HeartHandshake, ShieldCheck, type LucideIcon } from "lucide-react";

/**
 * Íconos de las distinciones del config (gamification.badges[].icon).
 * «Flame» (constancia) se muestra como calendario: la llama es la seña de identidad de otra app.
 */
const ICONOS: Record<string, LucideIcon> = { Award, Flame: CalendarCheck2, HeartHandshake, ShieldCheck };

export default function IconoInsignia({ nombre, className }: { nombre: string; className?: string }) {
  const Icono = ICONOS[nombre] ?? Award;
  return <Icono className={className} />;
}
