import Link from "next/link";
import { ArrowRight, BookOpenCheck, ChevronRight, ClipboardList, GraduationCap, Layers, Target, Wallet } from "lucide-react";
import TuProgreso from "@/components/TuProgreso";
import { CONVOCATORIA_DATA, calcularIngresoAnualDocente, formatoCOP } from "@/lib/convocatoria";
import { FICHAS } from "@/lib/fichas";
import { PREGUNTAS, UMBRAL_DOCENTE_AULA, obtenerAreas } from "@/lib/preguntas";

export default function Inicio() {
  const areas = obtenerAreas();
  const vacantes = CONVOCATORIA_DATA.informacion_general.vacantes_estimadas;
  const licenciado = calcularIngresoAnualDocente("2A_base");

  const modulos = [
    { href: "/practica", titulo: "Práctica por áreas", detalle: `${areas.length} áreas temáticas`, Icono: BookOpenCheck },
    { href: "/simulacro", titulo: "Simulacro cronometrado", detalle: `Aprueba con ${UMBRAL_DOCENTE_AULA}/100`, Icono: ClipboardList },
    { href: "/fichas", titulo: "Fichas normativas", detalle: `${FICHAS.length} conceptos clave: DUA, PIAR, Ley 1620…`, Icono: Layers },
    { href: "/convocatoria", titulo: "Convocatoria y salario", detalle: "Requisitos, fases y calculadora", Icono: Wallet },
  ];

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-gradient-to-br from-marca-600 to-marca-700 p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 text-sm font-medium text-marca-100">
          <GraduationCap className="size-5" /> Concurso Docente Colombia
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-tight">Entrena hoy para ganar tu plaza</h1>
        <div className="mt-5 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-2xl font-bold">{PREGUNTAS.length}</p>
            <p className="text-xs text-marca-100">preguntas PJS</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-2xl font-bold">{vacantes.toLocaleString("es-CO")}</p>
            <p className="text-xs text-marca-100">vacantes estimadas</p>
          </div>
        </div>
      </header>

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

      <section className="space-y-3">
        {modulos.map(({ href, titulo, detalle, Icono }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition active:scale-[0.98] dark:bg-slate-900 dark:ring-slate-800"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-marca-50 text-marca-600 dark:bg-marca-700/30 dark:text-oro">
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

      <TuProgreso />

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-semibold">
          <Target className="size-5 text-marca-500" /> Áreas del banco
        </h2>
        <ul className="flex flex-wrap gap-2">
          {areas.map(({ area, total }) => (
            <li key={area} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {area} · {total}
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}
