"use client";

import { useEffect, useRef, useState } from "react";

export type AnimoMascota = "feliz" | "celebrando" | "animando" | "pensando" | "durmiendo";

interface Props {
  animo?: AnimoMascota;
  /** Ancho en píxeles; el alto se ajusta a la proporción del dibujo */
  tamano?: number;
  /** Si existe, el capibara es un botón: salta y llama a esta función al tocarlo */
  onToque?: () => void;
  /** Los ojos siguen el puntero o el dedo */
  mirarPuntero?: boolean;
  className?: string;
}

const COLORES = {
  cuerpo: "#A8754F",
  oscuro: "#7A5135",
  pelo: "#8C603F",
  vientre: "#C09068",
  hocico: "#8A5B3B",
  nariz: "#3F2618",
  orejaDentro: "#E3B999",
  pupila: "#2A1A10",
  dientes: "#FFF8EC",
  boca: "#5B2A1A",
  birrete: "#1E2A52",
  birreteBorde: "#141C3A",
  borla: "#FFD447",
  mejilla: "#F4A0A0",
};

/** Centros de los ojos en el viewBox */
const OJOS = [
  { x: 40, y: 50 },
  { x: 80, y: 50 },
];

/**
 * Capi, el capibara mascota. Dibujo propio en SVG (café, hocico cuadrado y birrete).
 * Parpadea, flota y puede seguir el puntero; las animaciones respetan «reducir movimiento».
 */
export default function Capibara({ animo = "feliz", tamano = 96, onToque, mirarPuntero = true, className = "" }: Props) {
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
        const dy = e.clientY - (caja.top + caja.height * 0.42);
        const distancia = Math.hypot(dx, dy) || 1;
        // Ojos pequeños: desplazamiento máximo de 1,8 unidades del viewBox
        const fuerza = Math.min(1, distancia / 160) * 1.8;
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
  const brazosArriba = animo === "celebrando";
  // Pensando mira hacia arriba a un lado; animando mira al usuario
  const pupila = animo === "pensando" ? { x: 1.6, y: -1.8 } : mirada;

  const dibujo = (
    <svg
      ref={ref}
      viewBox="0 0 120 132"
      width={tamano}
      height={(tamano * 132) / 120}
      role="img"
      aria-label={`Capi, el capibara, ${ETIQUETA_ANIMO[animo]}`}
      className={`overflow-visible ${className}`}
    >
      <g key={salto} className={saltando ? "mascota-salto" : "mascota-flotar"} style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}>
        {/* Patas */}
        {[44, 76].map((x) => (
          <g key={x} fill={COLORES.oscuro}>
            <rect x={x - 8} y="116" width="16" height="11" rx="5.5" />
            <path d={`M${x - 3} 127 v-3 M${x + 3} 127 v-3`} stroke={COLORES.nariz} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
          </g>
        ))}

        {/* Brazos */}
        <g className={brazosArriba ? "mascota-brazo-izq" : ""} style={{ transformBox: "fill-box", transformOrigin: "top right" }}>
          <ellipse cx="29" cy="99" rx="7" ry="13" fill={COLORES.oscuro} transform={brazosArriba ? "rotate(40 29 87)" : "rotate(14 29 99)"} />
        </g>
        <g className={brazosArriba ? "mascota-brazo-der" : ""} style={{ transformBox: "fill-box", transformOrigin: "top left" }}>
          <ellipse cx="91" cy="99" rx="7" ry="13" fill={COLORES.oscuro} transform={brazosArriba ? "rotate(-40 91 87)" : "rotate(-14 91 99)"} />
        </g>

        {/* Cuerpo redondo y vientre */}
        <ellipse cx="60" cy="98" rx="33" ry="27" fill={COLORES.cuerpo} />
        <ellipse cx="60" cy="106" rx="20" ry="15" fill={COLORES.vientre} />

        {/* Orejas pequeñas y redondas */}
        {[29, 91].map((x) => (
          <g key={x}>
            <circle cx={x} cy="37" r="5.5" fill={COLORES.oscuro} />
            <circle cx={x} cy="38" r="2.6" fill={COLORES.orejaDentro} />
          </g>
        ))}

        {/* Cabeza ancha y plana */}
        <rect x="21" y="31" width="78" height="58" rx="22" fill={COLORES.cuerpo} />
        {/* Pelo más oscuro en la frente */}
        <path d="M30 44 Q60 34 90 44" stroke={COLORES.pelo} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.6" />

        {/* Ojos pequeños y tranquilos */}
        <g className={ojosCerrados || ojosFelices ? "" : "mascota-parpadeo"} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          {OJOS.map(({ x, y }) =>
            ojosCerrados ? (
              <path key={x} d={`M${x - 5} ${y} q5 4 10 0`} stroke={COLORES.pupila} strokeWidth="2.6" fill="none" strokeLinecap="round" />
            ) : ojosFelices ? (
              <path key={x} d={`M${x - 5} ${y + 2} q5 -7 10 0`} stroke={COLORES.pupila} strokeWidth="2.8" fill="none" strokeLinecap="round" />
            ) : (
              <g key={x} style={{ transition: "transform 120ms ease-out" }} transform={`translate(${pupila.x} ${pupila.y})`}>
                <circle cx={x} cy={y} r="4.6" fill={COLORES.pupila} />
                <circle cx={x + 1.5} cy={y - 1.5} r="1.5" fill="#fff" />
              </g>
            ),
          )}
        </g>

        {/* Cejas de ánimo */}
        {animo === "animando" && (
          <>
            <path d="M32 41 L46 43" stroke={COLORES.oscuro} strokeWidth="2.6" strokeLinecap="round" />
            <path d="M88 41 L74 43" stroke={COLORES.oscuro} strokeWidth="2.6" strokeLinecap="round" />
          </>
        )}

        {/* Mejillas */}
        {(ojosFelices || animo === "animando") && (
          <>
            <ellipse cx="29" cy="62" rx="4.5" ry="2.6" fill={COLORES.mejilla} opacity="0.55" />
            <ellipse cx="91" cy="62" rx="4.5" ry="2.6" fill={COLORES.mejilla} opacity="0.55" />
          </>
        )}

        {/* Hocico grande, el rasgo del capibara */}
        <rect x="35" y="57" width="50" height="31" rx="14" fill={COLORES.hocico} />
        <ellipse cx="51" cy="65" rx="3.2" ry="2.2" fill={COLORES.nariz} transform="rotate(-15 51 65)" />
        <ellipse cx="69" cy="65" rx="3.2" ry="2.2" fill={COLORES.nariz} transform="rotate(15 69 65)" />

        {/* Boca: abierta con dientitos al celebrar, sonrisa en «w» el resto del tiempo */}
        {animo === "celebrando" ? (
          <>
            <path d="M51 75 Q60 86 69 75 Z" fill={COLORES.boca} />
            <rect x="56.5" y="75" width="3.2" height="4" rx="0.8" fill={COLORES.dientes} />
            <rect x="60.3" y="75" width="3.2" height="4" rx="0.8" fill={COLORES.dientes} />
          </>
        ) : (
          <path
            d={animo === "animando" || animo === "pensando" ? "M55 78 Q60 80 65 78" : "M53 76 q3.5 3.5 7 0 q3.5 3.5 7 0"}
            stroke={COLORES.nariz}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Birrete */}
        <path d="M45 27 Q60 33 75 27 L75 36 Q60 42 45 36 Z" fill={COLORES.birreteBorde} />
        <path d="M60 10 L92 22 L60 34 L28 22 Z" fill={COLORES.birrete} />
        <circle cx="60" cy="22" r="2.2" fill={COLORES.borla} />
        <path d="M60 22 L94 26 L94 37" stroke={COLORES.borla} strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="94" cy="39" r="3" fill={COLORES.borla} />

        {/* Zzz al dormir */}
        {ojosCerrados && (
          <text x="98" y="16" fontSize="14" fontWeight="700" fill="#6B7390" className="mascota-zzz">
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
      aria-label="Tocar a Capi para recibir un consejo"
    >
      {dibujo}
    </button>
  );
}

const ETIQUETA_ANIMO: Record<AnimoMascota, string> = {
  feliz: "feliz",
  celebrando: "celebrando",
  animando: "dándote ánimo",
  pensando: "pensando",
  durmiendo: "durmiendo",
};
