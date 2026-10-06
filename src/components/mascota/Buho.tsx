"use client";

import { useEffect, useRef, useState } from "react";

export type AnimoBuho = "feliz" | "celebrando" | "animando" | "pensando" | "durmiendo";

interface Props {
  animo?: AnimoBuho;
  /** Ancho en píxeles; el alto se ajusta a la proporción del dibujo */
  tamano?: number;
  /** Si existe, el búho es un botón: salta y llama a esta función al tocarlo */
  onToque?: () => void;
  /** Los ojos siguen el puntero o el dedo */
  mirarPuntero?: boolean;
  className?: string;
}

const COLORES = {
  cuerpo: "#9A6B43",
  ala: "#7A5234",
  pecho: "#F3E3C3",
  plumaPecho: "#D9C29A",
  ojoFondo: "#FFF8EC",
  pupila: "#1F2937",
  pico: "#F59E0B",
  patas: "#E58A0B",
  birrete: "#1E3A8A",
  birreteBorde: "#172554",
  borla: "#FCD116",
  mejilla: "#F9A8A8",
};

/** Plumas en «V» del pecho, en tres filas */
const PLUMAS_PECHO = [
  [51, 84], [60, 84], [69, 84],
  [55.5, 93], [64.5, 93],
  [51, 102], [60, 102], [69, 102],
];

/** Centros de los ojos en el viewBox */
const OJOS = [
  { x: 45, y: 64 },
  { x: 75, y: 64 },
];

/**
 * Sabino, el búho mascota. Dibujo propio en SVG (café con birrete), distinto de otras marcas.
 * Parpadea, flota y puede seguir el puntero; las animaciones respetan «reducir movimiento».
 */
export default function Buho({ animo = "feliz", tamano = 96, onToque, mirarPuntero = true, className = "" }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const [mirada, setMirada] = useState({ x: 0, y: 0 });
  const [salto, setSalto] = useState(0);
  const [saltando, setSaltando] = useState(false);

  useEffect(() => {
    if (!saltando) return;
    const t = setTimeout(() => setSaltando(false), 650);
    return () => clearTimeout(t);
  }, [saltando, salto]);

  useEffect(() => {
    if (!mirarPuntero) return;
    let cuadro = 0;
    const mover = (e: PointerEvent) => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() => {
        const caja = ref.current?.getBoundingClientRect();
        if (!caja) return;
        const dx = e.clientX - (caja.left + caja.width / 2);
        const dy = e.clientY - (caja.top + caja.height * 0.45);
        const distancia = Math.hypot(dx, dy) || 1;
        // Desplazamiento máximo de 3.5 unidades del viewBox
        const fuerza = Math.min(1, distancia / 160) * 3.5;
        setMirada({ x: (dx / distancia) * fuerza, y: (dy / distancia) * fuerza });
      });
    };
    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerdown", mover);
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerdown", mover);
    };
  }, [mirarPuntero]);

  const ojosCerrados = animo === "durmiendo";
  const ojosFelices = animo === "feliz" || animo === "celebrando";
  const alasArriba = animo === "celebrando";
  // Pensando mira hacia arriba a un lado; animando mira al usuario
  const pupila = animo === "pensando" ? { x: 3, y: -3 } : mirada;

  const dibujo = (
    <svg
      ref={ref}
      viewBox="0 0 120 132"
      width={tamano}
      height={(tamano * 132) / 120}
      role="img"
      aria-label={`Sabino, el búho, ${ETIQUETA_ANIMO[animo]}`}
      className={`overflow-visible ${className}`}
    >
      <g key={salto} className={saltando ? "buho-salto" : "buho-flotar"} style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}>
        {/* Patas */}
        <ellipse cx="48" cy="123" rx="7" ry="4" fill={COLORES.patas} />
        <ellipse cx="72" cy="123" rx="7" ry="4" fill={COLORES.patas} />

        {/* Alas */}
        <g className={alasArriba ? "buho-aleteo-izq" : ""} style={{ transformBox: "fill-box", transformOrigin: "top right" }}>
          <ellipse cx="25" cy="86" rx="11" ry="25" fill={COLORES.ala} transform={alasArriba ? "rotate(35 25 70)" : "rotate(12 25 86)"} />
        </g>
        <g className={alasArriba ? "buho-aleteo-der" : ""} style={{ transformBox: "fill-box", transformOrigin: "top left" }}>
          <ellipse cx="95" cy="86" rx="11" ry="25" fill={COLORES.ala} transform={alasArriba ? "rotate(-35 95 70)" : "rotate(-12 95 86)"} />
        </g>

        {/* Cuerpo y pecho */}
        <ellipse cx="60" cy="80" rx="37" ry="43" fill={COLORES.cuerpo} />
        <ellipse cx="60" cy="92" rx="23" ry="27" fill={COLORES.pecho} />
        {PLUMAS_PECHO.map(([x, y]) => (
          <path key={`${x}-${y}`} d={`M${x - 3} ${y} q3 3 6 0`} stroke={COLORES.plumaPecho} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        ))}

        {/* Penachos (orejas) */}
        <path d="M27 50 L22 30 L40 42 Z" fill={COLORES.ala} />
        <path d="M93 50 L98 30 L80 42 Z" fill={COLORES.ala} />

        {/* Discos faciales y ojos */}
        <g className={ojosCerrados || ojosFelices ? "" : "buho-parpadeo"} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          {OJOS.map(({ x, y }) => (
            <g key={x}>
              <circle cx={x} cy={y} r="15" fill={COLORES.ojoFondo} />
              {ojosCerrados ? (
                <path d={`M${x - 8} ${y} q8 6 16 0`} stroke={COLORES.pupila} strokeWidth="3" fill="none" strokeLinecap="round" />
              ) : ojosFelices ? (
                <path d={`M${x - 8} ${y + 3} q8 -10 16 0`} stroke={COLORES.pupila} strokeWidth="3.2" fill="none" strokeLinecap="round" />
              ) : (
                <g style={{ transition: "transform 120ms ease-out" }} transform={`translate(${pupila.x} ${pupila.y})`}>
                  <circle cx={x} cy={y} r="7.5" fill={COLORES.pupila} />
                  <circle cx={x + 2.5} cy={y - 2.5} r="2.3" fill="#fff" />
                </g>
              )}
            </g>
          ))}
        </g>

        {/* Cejas de ánimo (preocupado y animando a la vez) */}
        {animo === "animando" && (
          <>
            <path d="M33 46 L52 50" stroke={COLORES.birreteBorde} strokeWidth="3" strokeLinecap="round" />
            <path d="M87 46 L68 50" stroke={COLORES.birreteBorde} strokeWidth="3" strokeLinecap="round" />
          </>
        )}

        {/* Mejillas */}
        {(ojosFelices || animo === "animando") && (
          <>
            <ellipse cx="33" cy="76" rx="5" ry="3" fill={COLORES.mejilla} opacity="0.55" />
            <ellipse cx="87" cy="76" rx="5" ry="3" fill={COLORES.mejilla} opacity="0.55" />
          </>
        )}

        {/* Pico */}
        <path d="M53 71 L67 71 L60 82 Z" fill={COLORES.pico} />

        {/* Birrete */}
        <path d="M44 33 Q60 40 76 33 L76 42 Q60 49 44 42 Z" fill={COLORES.birreteBorde} />
        <path d="M60 16 L94 29 L60 42 L26 29 Z" fill={COLORES.birrete} />
        <circle cx="60" cy="29" r="2.4" fill={COLORES.borla} />
        <path d="M60 29 L88 33 L88 47" stroke={COLORES.borla} strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="88" cy="49" r="3.2" fill={COLORES.borla} />

        {/* Zzz al dormir */}
        {ojosCerrados && (
          <text x="96" y="20" fontSize="14" fontWeight="700" fill={COLORES.birrete} className="buho-zzz">
            z
          </text>
        )}
      </g>
    </svg>
  );

  if (!onToque) return dibujo;

  return (
    <button
      type="button"
      onClick={() => {
        setSalto((s) => s + 1);
        setSaltando(true);
        onToque();
      }}
      className="shrink-0 rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
      aria-label="Tocar a Sabino para recibir un consejo"
    >
      {dibujo}
    </button>
  );
}

const ETIQUETA_ANIMO: Record<AnimoBuho, string> = {
  feliz: "feliz",
  celebrando: "celebrando",
  animando: "dándote ánimo",
  pensando: "pensando",
  durmiendo: "durmiendo",
};
