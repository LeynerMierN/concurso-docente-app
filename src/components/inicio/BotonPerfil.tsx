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
      className="grid size-10 shrink-0 place-items-center rounded-full bg-tarjeta font-bold text-texto ring-1 ring-slate-200 transition hover:bg-slate-50 dark:ring-slate-700 dark:hover:bg-slate-700"
    >
      {inicial ?? <UserRound className="size-5" />}
    </Link>
  );
}
