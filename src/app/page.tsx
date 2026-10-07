import AccesosEstudio from "@/components/inicio/AccesosEstudio";
import Bienvenida from "@/components/inicio/Bienvenida";
import EncabezadoInicio from "@/components/inicio/EncabezadoInicio";
import SiguientePaso from "@/components/inicio/SiguientePaso";
import TuAvance from "@/components/inicio/TuAvance";

/**
 * Inicio de una sola pantalla: qué es la app, el siguiente paso recomendado (un solo botón),
 * el avance de un vistazo y otras formas de estudiar. El detalle vive en Estudiar, Progreso y Concurso.
 */
export default function Inicio() {
  return (
    <div className="space-y-4">
      <EncabezadoInicio />
      <SiguientePaso />
      <TuAvance />
      <AccesosEstudio />
      <Bienvenida />
    </div>
  );
}
