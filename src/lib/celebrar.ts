"use client";

import confetti from "canvas-confetti";

/** Lluvia de confeti para celebrar cuando el aspirante aprueba un simulacro */
export function celebrarAprobacion() {
  const colores = ["#FCD116", "#003893", "#CE1126"]; // bandera de Colombia
  const fin = Date.now() + 1500;

  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors: colores });
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors: colores });
    if (Date.now() < fin) requestAnimationFrame(frame);
  })();
}
