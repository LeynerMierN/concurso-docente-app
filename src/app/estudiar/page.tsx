import { BookOpenCheck } from "lucide-react";
import ConsejoCapi from "@/components/estudiar/ConsejoCapi";
import OpcionesEstudio from "@/components/estudiar/OpcionesEstudio";
import RutaEstudio from "@/components/estudiar/RutaEstudio";

/** Todo lo que es estudiar en un solo lugar: práctica, temas, simulacros, repaso y fichas */
export default function Pagina() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl">
          <BookOpenCheck className="size-7 text-secondary-light" /> Estudiar
        </h1>
        <p className="mt-1 text-[15px] text-texto-tenue">¿Qué quieres hacer hoy?</p>
      </header>

      <OpcionesEstudio />
      <RutaEstudio />
      <ConsejoCapi />
    </div>
  );
}
