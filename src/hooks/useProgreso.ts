"use client";

import { useEffect, useState } from "react";
import { leerProgreso, type Progreso } from "@/lib/storage";

/** Progreso guardado en localStorage; null mientras carga (evita desajustes de hidratación) */
export function useProgreso(): Progreso | null {
  const [progreso, setProgreso] = useState<Progreso | null>(null);

  useEffect(() => {
    const cargar = () => setProgreso(leerProgreso());
    cargar();
    // Si el usuario termina un intento en otra pestaña, refrescamos
    window.addEventListener("storage", cargar);
    // Cambios hechos en esta misma pestaña (p. ej. usar un protector de racha)
    window.addEventListener("concurso-docente:progreso", cargar);
    return () => {
      window.removeEventListener("storage", cargar);
      window.removeEventListener("concurso-docente:progreso", cargar);
    };
  }, []);

  return progreso;
}
