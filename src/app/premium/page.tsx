import Link from "next/link";
import { Check, Crown, Download, Infinity as Infinito, Library } from "lucide-react";
import { MODULOS_NAVEGACION } from "@/lib/appConfig";
import { PREGUNTAS } from "@/lib/preguntas";

const descripcion = MODULOS_NAVEGACION.find((m) => m.id === "premium")?.descripcion;

/** Beneficios anunciados en data/app_config.json → navigation_modules.premium */
const BENEFICIOS = [
  {
    Icono: Library,
    titulo: "Bancos de especialidad completos",
    texto: "Más preguntas por cada especialidad, por los cargos directivos y por el contexto rural.",
  },
  {
    Icono: Infinito,
    titulo: "Simulacros ilimitados",
    texto: "Simulacros tipo CNSC armados a la medida de tu rol y especialidad, tantas veces como quieras.",
  },
  {
    Icono: Download,
    titulo: "Descargas en PDF",
    texto: "Las fichas normativas y la revisión de tus simulacros para estudiar sin conexión.",
  },
];

export default function Pagina() {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-gradient-to-br from-accent to-accent-dark p-6 text-white shadow-lg">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide">
          Próximamente
        </span>
        <h1 className="mt-3 flex items-center gap-2 text-2xl font-extrabold md:text-3xl">
          <Crown className="size-8" /> Modo Premium
        </h1>
        {descripcion && <p className="mt-2 text-white/90">{descripcion}</p>}
      </header>

      <ul className="space-y-3">
        {BENEFICIOS.map(({ Icono, titulo, texto }) => (
          <li key={titulo} className="flex gap-4 rounded-3xl bg-white p-5 ring-1 ring-slate-200 dark:bg-tarjeta dark:ring-slate-700/60">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent/15 text-accent">
              <Icono className="size-6" />
            </span>
            <div>
              <h2 className="font-semibold">{titulo}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{texto}</p>
            </div>
          </li>
        ))}
      </ul>

      <section className="rounded-3xl bg-secondary/10 p-5 ring-1 ring-secondary/30">
        <h2 className="flex items-center gap-2 font-bold">
          <Check className="size-5 text-secondary" /> Mientras tanto, todo es gratis
        </h2>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
          Las {PREGUNTAS.length} preguntas actuales, los simulacros, las fichas, la calculadora salarial y tu progreso están
          disponibles sin costo.
        </p>
        <Link href="/practica" className="mt-4 inline-block rounded-2xl bg-secondary px-5 py-2.5 text-sm font-semibold text-white">
          Seguir practicando
        </Link>
      </section>
    </div>
  );
}
