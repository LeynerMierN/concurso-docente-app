import Link from "next/link";
import { ArrowRight, ChevronRight, FileText, Wallet } from "lucide-react";
import Constancia from "@/components/dashboard/Constancia";
import EncabezadoInicio from "@/components/dashboard/EncabezadoInicio";
import FraseMotivadora from "@/components/dashboard/FraseMotivadora";
import Proyeccion from "@/components/dashboard/Proyeccion";
import RepasoErrores from "@/components/dashboard/RepasoErrores";
import RutaEstudio from "@/components/dashboard/RutaEstudio";
import TareaHoy from "@/components/dashboard/TareaHoy";
import TarjetasModos from "@/components/dashboard/TarjetasModos";
import MascotaInicio from "@/components/mascota/MascotaInicio";
import { CONVOCATORIA_DATA, calcularIngresoAnualDocente, formatoCOP } from "@/lib/convocatoria";
import { FICHAS } from "@/lib/fichas";
import { PREGUNTAS } from "@/lib/preguntas";

/** Inicio: «Hola, profe.», tarea de hoy, proyección, constancia, modalidades de examen y recursos */
export default function Inicio() {
  const vacantes = CONVOCATORIA_DATA.informacion_general.vacantes_estimadas;
  const licenciado = calcularIngresoAnualDocente("2A_base");

  const recursos = [
    { href: "/normatividad", titulo: "Fichas normativas", detalle: `${FICHAS.length} conceptos clave: DUA, PIAR, Ley 1620…`, Icono: FileText },
    { href: "/convocatoria", titulo: "Convocatoria y salario", detalle: "Requisitos, fases y calculadora", Icono: Wallet },
  ];

  return (
    <div className="space-y-6">
      <EncabezadoInicio
        resumen={`${PREGUNTAS.length} preguntas · ${FICHAS.length} fichas normativas · ${vacantes.toLocaleString("es-CO")} vacantes estimadas`}
      />

      <TareaHoy />

      <Proyeccion />

      <RepasoErrores />

      <MascotaInicio />

      <RutaEstudio />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
        <Constancia />
        <TarjetasModos />
      </div>

      <FraseMotivadora />

      <Link
        href="/convocatoria#salarios"
        className="group relative block overflow-hidden rounded-3xl bg-resaltador-suave p-5 ring-1 ring-accent/50 transition active:scale-[0.98]"
      >
        <Wallet className="absolute -right-3 -bottom-3 size-24 text-accent-dark opacity-15" />
        <p className="text-xs font-bold uppercase tracking-wide text-accent-dark">Conoce salarios y vacantes</p>
        <p className="mt-1 text-lg font-bold leading-snug">
          Un licenciado recién nombrado recibe en promedio{" "}
          {licenciado ? formatoCOP.format(licenciado.promedio_mensual_real) : "más de 4 millones"} al mes con prestaciones
        </p>
        <p className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-secondary-light">
          Ver calculadora salarial <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </p>
      </Link>

      <section aria-label="Recursos de estudio" className="grid gap-3 md:grid-cols-2">
        {recursos.map(({ href, titulo, detalle, Icono }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-2xl bg-tarjeta p-4 ring-1 ring-slate-200 transition active:scale-[0.98] dark:ring-slate-700/60"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-verde-suave text-secondary-light">
              <Icono className="size-6" />
            </span>
            <span className="flex-1">
              <span className="block font-semibold">{titulo}</span>
              <span className="block text-sm text-texto-tenue">{detalle}</span>
            </span>
            <ChevronRight className="size-5 text-texto-tenue" />
          </Link>
        ))}
      </section>
    </div>
  );
}
