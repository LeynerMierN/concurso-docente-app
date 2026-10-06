import Link from "next/link";
import { ChevronRight, Clock, Eye, EyeOff, Pause, Target, Timer, Trophy, Zap, type LucideIcon } from "lucide-react";
import { MODOS_EXAMEN } from "@/lib/appConfig";

/** Ícono por modo; el config no define íconos para exam_modes */
const ICONO_MODO: Record<string, LucideIcon> = {
  express_10: Zap,
  area_20: Target,
  simulacro_medio: Timer,
  simulacro_oficial_100: Trophy,
};

/** Tarjetas de acceso rápido a los exam_modes de data/app_config.json */
export default function TarjetasModos() {
  return (
    <section aria-labelledby="titulo-modos" className="space-y-3">
      <h2 id="titulo-modos" className="text-lg font-bold">
        Modalidades de examen
      </h2>
      <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
        {MODOS_EXAMEN.map((modo) => {
          const Icono = ICONO_MODO[modo.id] ?? Zap;
          const recortado = modo.preguntas < modo.preguntasConfig;
          return (
            <li key={modo.id}>
              <Link
                href={modo.href}
                className="group flex h-full flex-col rounded-3xl bg-tarjeta p-5 ring-1 ring-slate-200 transition hover:ring-primary-light active:scale-[0.99] dark:ring-slate-700/60"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
                      modo.feedbackInmediato
                        ? "bg-secondary/10 text-secondary-light"
                        : "bg-primary/10 text-primary-light dark:bg-primary-light/20 dark:text-secondary-light"
                    }`}
                  >
                    <Icono className="size-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading font-bold leading-snug">{modo.nombre}</span>
                    <span className="mt-1 block text-sm text-texto-tenue">{modo.descripcion}</span>
                  </span>
                  <ChevronRight className="mt-1 size-5 shrink-0 text-texto-tenue transition group-hover:translate-x-0.5" />
                </div>

                <ul className="mt-4 flex flex-wrap gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <li className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-700/60">
                    {modo.preguntas} preguntas{recortado ? ` (de ${modo.preguntasConfig})` : ""}
                  </li>
                  <li className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-700/60">
                    <Clock className="size-3" /> {modo.minutos ? `${modo.minutos} min` : "Sin tiempo"}
                  </li>
                  <li className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-700/60">
                    {modo.feedbackInmediato ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                    {modo.feedbackInmediato ? "Feedback inmediato" : "Sin feedback"}
                  </li>
                  {modo.permitePausa && modo.minutos && (
                    <li className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-700/60">
                      <Pause className="size-3" /> Pausable
                    </li>
                  )}
                </ul>
              </Link>
            </li>
          );
        })}
      </ul>
      {MODOS_EXAMEN.some((m) => m.preguntas < m.preguntasConfig) && (
        <p className="text-xs text-texto-tenue">
          Los simulacros se arman con la distribución CNSC (30/30/20/20). Mientras el banco crece, algunos componentes aportan
          menos preguntas de las pedidas y el tiempo se ajusta en la misma proporción.
        </p>
      )}
    </section>
  );
}
