import { useId } from "react";
import type { Metal } from "@/lib/meritos";

/** Degradados de cada metal: claro, medio y oscuro */
export const METALES: Record<Metal, [string, string, string]> = {
  oro: ["#FEF3C7", "#F5B700", "#B45309"],
  plata: ["#F8FAFC", "#CBD5E1", "#64748B"],
  bronce: ["#FED7AA", "#D9772B", "#7C2D12"],
};

interface Props {
  metal: Metal;
  forma?: "trofeo" | "copa";
  tamano?: number;
  /** Destello que recorre el metal cada pocos segundos */
  brillo?: boolean;
  /** Silueta apagada para los trofeos aún no ganados */
  bloqueado?: boolean;
  className?: string;
}

/** Trofeo propio en SVG: copa con asas, columna y base de madera con placa */
export default function Trofeo({ metal, forma = "trofeo", tamano = 96, brillo = false, bloqueado = false, className = "" }: Props) {
  const id = useId().replace(/:/g, "");
  const [claro, medio, oscuro] = bloqueado ? ["#CBD5E1", "#94A3B8", "#64748B"] : METALES[metal];
  const relleno = `url(#metal-${id})`;
  const esCopa = forma === "copa";
  // La copa mayor tiene el cuenco más ancho y una tapa
  const cuenco = esCopa ? "M16 24 H84 V38 C84 64 68 78 50 78 C32 78 16 64 16 38 Z" : "M24 22 H76 V40 C76 62 64 76 50 76 C36 76 24 62 24 40 Z";

  return (
    <svg
      viewBox="0 0 100 124"
      width={tamano}
      height={(tamano * 124) / 100}
      aria-hidden
      className={`overflow-visible ${bloqueado ? "opacity-40" : ""} ${className}`}
    >
      <defs>
        <linearGradient id={`metal-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={claro} />
          <stop offset="0.45" stopColor={medio} />
          <stop offset="1" stopColor={oscuro} />
        </linearGradient>
        <clipPath id={`recorte-${id}`}>
          <path d={cuenco} />
        </clipPath>
      </defs>

      {/* Asas */}
      <path
        d={esCopa ? "M18 30 C-2 26 -2 62 30 64" : "M25 28 C8 28 8 54 30 58"}
        stroke={medio}
        strokeWidth={esCopa ? 7 : 6}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={esCopa ? "M82 30 C102 26 102 62 70 64" : "M75 28 C92 28 92 54 70 58"}
        stroke={oscuro}
        strokeWidth={esCopa ? 7 : 6}
        fill="none"
        strokeLinecap="round"
      />

      {/* Columna y base */}
      <path d="M44 76 H56 L60 98 H40 Z" fill={relleno} />
      <rect x="34" y="96" width="32" height="6" rx="2" fill={oscuro} />
      <rect x="26" y="102" width="48" height="18" rx="3" fill={bloqueado ? "#475569" : "#5B3A29"} />
      <rect x="38" y="107" width="24" height="8" rx="1.5" fill={relleno} />

      {/* Cuenco */}
      <path d={cuenco} fill={relleno} />
      <ellipse cx="50" cy={esCopa ? 24 : 22} rx={esCopa ? 34 : 26} ry="4" fill={oscuro} opacity="0.35" />
      {esCopa && (
        <>
          <path d="M34 22 Q50 8 66 22 Z" fill={relleno} />
          <circle cx="50" cy="9" r="4.5" fill={relleno} />
        </>
      )}

      {/* Estrella del frente */}
      <path
        d="M50 34 L53.5 42 L62 42.6 L55.5 48 L57.6 56.4 L50 51.8 L42.4 56.4 L44.5 48 L38 42.6 L46.5 42 Z"
        fill={bloqueado ? "#E2E8F0" : claro}
        opacity="0.9"
      />

      {/* Reflejo fijo y destello que lo recorre */}
      <path d={esCopa ? "M26 30 C24 46 28 58 36 66" : "M31 28 C30 44 33 56 40 64"} stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.45" />
      {brillo && !bloqueado && (
        <g clipPath={`url(#recorte-${id})`}>
          <rect x="-30" y="0" width="16" height="90" fill="#fff" opacity="0.55" transform="rotate(20 50 50)" className="premio-barrido" />
        </g>
      )}
    </svg>
  );
}
