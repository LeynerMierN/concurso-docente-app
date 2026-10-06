import { useId } from "react";
import IconoInsignia from "@/components/gamificacion/IconoInsignia";
import { METALES } from "@/components/premios/Trofeo";
import type { Metal } from "@/lib/meritos";

interface Props {
  /** Nombre del ícono de la distinción (gamification.badges[].icon) */
  icono: string;
  metal?: Metal;
  tamano?: number;
  /** Se balancea colgada de la cinta */
  balanceo?: boolean;
  bloqueada?: boolean;
  className?: string;
}

/** Medalla con cinta tricolor (amarillo, azul y rojo de la bandera de Colombia) */
export default function Medalla({ icono, metal = "oro", tamano = 80, balanceo = false, bloqueada = false, className = "" }: Props) {
  const id = useId().replace(/:/g, "");
  const [claro, medio, oscuro] = bloqueada ? ["#CBD5E1", "#94A3B8", "#64748B"] : METALES[metal];

  return (
    <span
      className={`relative inline-block ${balanceo ? "premio-balanceo" : ""} ${bloqueada ? "opacity-40" : ""} ${className}`}
      style={{ width: tamano, height: (tamano * 130) / 100, transformOrigin: "50% 0" }}
    >
      <svg viewBox="0 0 100 130" width={tamano} height={(tamano * 130) / 100} aria-hidden className="overflow-visible">
        <defs>
          {/* Franjas de la bandera: amarillo la mitad, azul y rojo un cuarto cada uno */}
          <linearGradient id={`cinta-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={bloqueada ? "#94A3B8" : "#FCD116"} />
            <stop offset="0.5" stopColor={bloqueada ? "#94A3B8" : "#FCD116"} />
            <stop offset="0.5" stopColor={bloqueada ? "#64748B" : "#003893"} />
            <stop offset="0.75" stopColor={bloqueada ? "#64748B" : "#003893"} />
            <stop offset="0.75" stopColor={bloqueada ? "#475569" : "#CE1126"} />
            <stop offset="1" stopColor={bloqueada ? "#475569" : "#CE1126"} />
          </linearGradient>
          <linearGradient id={`disco-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={claro} />
            <stop offset="0.5" stopColor={medio} />
            <stop offset="1" stopColor={oscuro} />
          </linearGradient>
        </defs>
        {/* Cinta en «V» */}
        <path d="M26 0 H46 L60 58 L44 62 Z" fill={`url(#cinta-${id})`} />
        <path d="M74 0 H54 L40 58 L56 62 Z" fill={`url(#cinta-${id})`} />
        <rect x="40" y="54" width="20" height="10" rx="2" fill={oscuro} />
        {/* Disco */}
        <circle cx="50" cy="94" r="32" fill={`url(#disco-${id})`} />
        <circle cx="50" cy="94" r="25" fill="none" stroke={claro} strokeWidth="2" opacity="0.7" />
        <path d="M30 80 A26 26 0 0 1 52 68" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5" />
      </svg>
      {/* Ícono centrado sobre el disco (centro en y = 94 de 130) */}
      <span
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ top: `${(94 / 130) * 100}%`, width: tamano * 0.3, height: tamano * 0.3 }}
      >
        <IconoInsignia nombre={icono} className={`size-full ${bloqueada ? "text-slate-100" : "text-white drop-shadow"}`} />
      </span>
    </span>
  );
}
