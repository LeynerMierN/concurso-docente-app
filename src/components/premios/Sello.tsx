import { useId } from "react";

const formatoFecha = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" });

/**
 * Sello «APROBADO» en tinta verde: doble aro (sólido + punteado), rotado -12°,
 * con «CONCURSO DOCENTE» en arco y la fecha. Entra con un golpe corto (clase `sello-golpe`).
 */
export default function Sello({ fecha, tamano = 150, className = "" }: { fecha: Date; tamano?: number; className?: string }) {
  const id = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 160 160"
      width={tamano}
      height={tamano}
      role="img"
      aria-label={`Sello: aprobado, ${formatoFecha.format(fecha)}`}
      className={`sello-golpe text-secondary-light ${className}`}
      style={{ transform: "rotate(-12deg)" }}
    >
      <defs>
        <path id={`arco-sup-${id}`} d="M28 80 A52 52 0 0 1 132 80" />
        <path id={`arco-inf-${id}`} d="M34 86 A46 46 0 0 0 126 86" />
      </defs>
      <g fill="none" stroke="currentColor">
        <circle cx="80" cy="80" r="74" strokeWidth="5" />
        <circle cx="80" cy="80" r="64" strokeWidth="2" strokeDasharray="4 4" />
      </g>
      <g fill="currentColor" style={{ fontFamily: "var(--font-heading)" }}>
        <text fontSize="13" fontWeight="800" letterSpacing="2.5">
          <textPath href={`#arco-sup-${id}`} startOffset="50%" textAnchor="middle">
            CONCURSO DOCENTE
          </textPath>
        </text>
        <rect x="14" y="66" width="132" height="28" rx="3" fill="currentColor" />
        <text x="80" y="88" fontSize="23" fontWeight="800" textAnchor="middle" letterSpacing="1.5" className="fill-tarjeta">
          APROBADO
        </text>
        <text fontSize="11" fontWeight="700" letterSpacing="1">
          <textPath href={`#arco-inf-${id}`} startOffset="50%" textAnchor="middle">
            {formatoFecha.format(fecha).toUpperCase()}
          </textPath>
        </text>
      </g>
    </svg>
  );
}
