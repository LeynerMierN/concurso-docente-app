import { BookOpenCheck } from "lucide-react";
import ConsejoCapi from "@/components/estudiar/ConsejoCapi";
import OpcionesEstudio from "@/components/estudiar/OpcionesEstudio";
import RutaEstudio from "@/components/estudiar/RutaEstudio";
import { filtroDeGrupo } from "@/lib/categorias";
import { CONTEO_POR_CATEGORIA, filtrarPreguntas } from "@/lib/preguntas";

/** Se calcula en el servidor al compilar: el banco no viaja al navegador en esta pantalla */
const DIRECTIVOS = filtroDeGrupo("directivos_docentes");
const CONTEOS: Record<string, number> = { ...CONTEO_POR_CATEGORIA, [DIRECTIVOS]: filtrarPreguntas(DIRECTIVOS).length };

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
      <RutaEstudio conteos={CONTEOS} />
      <ConsejoCapi />
    </div>
  );
}
