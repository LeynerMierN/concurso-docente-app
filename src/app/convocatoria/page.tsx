import type { Metadata } from "next";
import { Landmark } from "lucide-react";
import Beneficios from "@/components/convocatoria/Beneficios";
import CalculadoraSalarial from "@/components/convocatoria/CalculadoraSalarial";
import PestanasConvocatoria from "@/components/convocatoria/PestanasConvocatoria";
import ReglasExamen from "@/components/convocatoria/ReglasExamen";
import { CONVOCATORIA_DATA } from "@/lib/convocatoria";

export const metadata: Metadata = {
  title: "Convocatoria y calculadora salarial",
  description: "Reglas del examen, umbrales, costo del PIN, calculadora salarial del Decreto 1278 y beneficios del magisterio.",
};

export default function Pagina() {
  const info = CONVOCATORIA_DATA.informacion_general;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Landmark className="size-7 text-primary-light" /> La convocatoria
        </h1>
        <p className="mt-1 text-sm text-texto-tenue">
          {info.nombre} · {info.entidades.map((e) => e.match(/\((\w+)\)/)?.[1] ?? e).join(" y ")} · ~
          {info.vacantes_estimadas.toLocaleString("es-CO")} vacantes
        </p>
      </header>

      <PestanasConvocatoria
        paneles={{
          reglas: <ReglasExamen />,
          salarios: <CalculadoraSalarial />,
          beneficios: <Beneficios />,
        }}
      />
    </div>
  );
}
