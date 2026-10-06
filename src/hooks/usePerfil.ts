"use client";

import { useEffect, useState } from "react";
import { EVENTO_PERFIL, leerPerfil, type Perfil } from "@/lib/perfil";

/** Perfil guardado; `cargado` evita parpadeos durante la hidratación */
export function usePerfil(): { perfil: Perfil | null; cargado: boolean } {
  const [estado, setEstado] = useState<{ perfil: Perfil | null; cargado: boolean }>({ perfil: null, cargado: false });

  useEffect(() => {
    const cargar = () => setEstado({ perfil: leerPerfil(), cargado: true });
    cargar();
    window.addEventListener(EVENTO_PERFIL, cargar);
    window.addEventListener("storage", cargar);
    return () => {
      window.removeEventListener(EVENTO_PERFIL, cargar);
      window.removeEventListener("storage", cargar);
    };
  }, []);

  return estado;
}
