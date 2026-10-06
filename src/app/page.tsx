import Link from "next/link";
import { ArrowRight, ChevronRight, FileText, GraduationCap, Wallet } from "lucide-react";
import BotonPerfil from "@/components/dashboard/BotonPerfil";
import FraseMotivadora from "@/components/dashboard/FraseMotivadora";
import RachaDiaria from "@/components/dashboard/RachaDiaria";
import RepasoErrores from "@/components/dashboard/RepasoErrores";
import RutaEstudio from "@/components/dashboard/RutaEstudio";
import TarjetasModos from "@/components/dashboard/TarjetasModos";
import MascotaInicio from "@/components/mascota/MascotaInicio";
import { APP } from "@/lib/appConfig";
import { CONVOCATORIA_DATA, calcularIngresoAnualDocente, formatoCOP } from "@/lib/convocatoria";
import { FICHAS } from "@/lib/fichas";
import { PREGUNTAS } from "@/lib/preguntas";

/** Dashboard: racha diaria, acceso rápido a las modalidades de examen y recursos */
export default function Inicio() {
  const vacantes = CONVOCATORIA_DATA.informacion_general.vacantes_estimadas;
  const licenciado = calcularIngresoAnualDocente("2A_base");

  const recursos = [
    { href: "/normatividad", titulo: "Fichas normativas", detalle: `${FICHAS.length} conceptos clave: DUA, PIAR, Ley 1620…`, Icono: FileText },
    { href: "/convocatoria", titulo: "Convocatoria y salario", detalle: "Requisitos, fases y calculadora", Icono: Wallet },
  ];

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-6 text-white shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-marca-100">
            <GraduationCap className="size-5" /> {APP.name}
          </div>
          <BotonPerfil />
        </div>
        <h1 className="mt-2 text-2xl font-extrabold leading-tight md:text-3xl">{APP.tagline}</h1>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          {[
            { valor: PREGUNTAS.length, etiqueta: "preguntas en el banco" },
            { valor: FICHAS.length, etiqueta: "fichas normativas" },
            { valor: vacantes.toLocaleString("es-CO"), etiqueta: "vacantes estimadas" },
          ].map(({ valor, etiqueta }) => (
            <div key={etiqueta} className="rounded-2xl bg-white/10 p-3">
              <p className="font-heading text-xl font-bold md:text-2xl">{valor}</p>
              <p className="text-[11px] leading-tight text-marca-100">{etiqueta}</p>
            </div>
          ))}
        </div>
      </header>

      <MascotaInicio />

      <RepasoErrores />

      <RutaEstudio />

      <FraseMotivadora />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
        <RachaDiaria />
        <TarjetasModos />
      </div>

      <Link
        href="/convocatoria#salarios"
        className="group relative block overflow-hidden rounded-3xl bg-oro p-5 text-slate-900 shadow-sm transition active:scale-[0.98]"
      >
        <Wallet className="absolute -right-3 -bottom-3 size-24 opacity-15" />
        <p className="text-xs font-bold uppercase tracking-wide">Conoce salarios y vacantes</p>
        <p className="mt-1 text-lg font-bold leading-snug">
          Un licenciado recién nombrado recibe en promedio{" "}
          {licenciado ? formatoCOP.format(licenciado.promedio_mensual_real) : "más de 4 millones"} al mes con prestaciones
        </p>
        <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">
          Ver calculadora salarial <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </p>
      </Link>

      <section aria-label="Recursos de estudio" className="grid gap-3 md:grid-cols-2">
        {recursos.map(({ href, titulo, detalle, Icono }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200 transition active:scale-[0.98] dark:bg-tarjeta dark:ring-slate-700/60"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-marca-50 text-primary dark:bg-primary-light/20 dark:text-oro">
              <Icono className="size-6" />
            </span>
            <span className="flex-1">
              <span className="block font-semibold">{titulo}</span>
              <span className="block text-sm text-slate-500">{detalle}</span>
            </span>
            <ChevronRight className="size-5 text-slate-400" />
          </Link>
        ))}
      </section>
    </div>
  );
}
