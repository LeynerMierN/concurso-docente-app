import { CalendarDays, HeartPulse, PiggyBank, ShieldCheck } from "lucide-react";
import { CONVOCATORIA_DATA } from "@/lib/convocatoria";

const fomag = CONVOCATORIA_DATA.prestaciones_y_beneficios.find((b) => b.nombre.includes("FOMAG"));
const cesantias = CONVOCATORIA_DATA.prestaciones_y_beneficios.find((b) => b.nombre.startsWith("Cesantías"));

const BENEFICIOS = [
  {
    Icono: ShieldCheck,
    titulo: "Estabilidad en carrera",
    etiqueta: "Decreto 1278 de 2002",
    texto:
      "Al superar el periodo de prueba quedas inscrito en carrera docente con derechos de carrera: solo se puede retirar del servicio por las causales previstas en la ley, no por decisión discrecional.",
    color: "text-marca-600 bg-marca-50 dark:bg-marca-700/30 dark:text-oro",
  },
  {
    Icono: HeartPulse,
    titulo: "Salud FOMAG, régimen especial",
    etiqueta: "Régimen exceptuado",
    texto: `Sin copagos ni cuotas moderadoras. ${fomag?.descripcion ?? ""}`,
    color: "text-rose-600 bg-rose-50 dark:bg-rose-500/15 dark:text-rose-300",
  },
  {
    Icono: CalendarDays,
    titulo: "7 semanas de vacaciones remuneradas",
    etiqueta: "Decreto 1850 de 2002",
    texto:
      "El calendario escolar incluye 7 semanas de vacaciones al año, además de las semanas de desarrollo institucional sin estudiantes.",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  {
    Icono: PiggyBank,
    titulo: "Cesantías en el FOMAG",
    etiqueta: cesantias?.pago ?? "Anual",
    texto: cesantias?.descripcion ?? "",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-500/15 dark:text-amber-300",
  },
];

export default function Beneficios() {
  return (
    <ul className="space-y-3">
      {BENEFICIOS.map(({ Icono, titulo, etiqueta, texto, color }) => (
        <li key={titulo} className="flex gap-4 rounded-3xl bg-white p-5 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${color}`}>
            <Icono className="size-6" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{etiqueta}</p>
            <h3 className="font-semibold leading-snug">{titulo}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{texto}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
