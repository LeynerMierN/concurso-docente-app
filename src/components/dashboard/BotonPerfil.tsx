"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { usePerfil } from "@/hooks/usePerfil";

/** Avatar del encabezado de Inicio: lleva al perfil */
export default function BotonPerfil() {
  const { perfil } = usePerfil();
  const inicial = perfil?.name?.trim()[0]?.toUpperCase();
  return (
    <Link
      href="/perfil"
      aria-label="Mi perfil"
      className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15 font-bold text-white ring-1 ring-white/30 transition hover:bg-white/25"
    >
      {inicial ?? <UserRound className="size-5" />}
    </Link>
  );
}
