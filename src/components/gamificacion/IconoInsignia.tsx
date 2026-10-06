import { Award, Flame, HeartHandshake, ShieldCheck, type LucideIcon } from "lucide-react";

/** Íconos de las insignias del config (gamification.badges[].icon) */
const ICONOS: Record<string, LucideIcon> = { Award, Flame, HeartHandshake, ShieldCheck };

export default function IconoInsignia({ nombre, className }: { nombre: string; className?: string }) {
  const Icono = ICONOS[nombre] ?? Award;
  return <Icono className={className} />;
}
