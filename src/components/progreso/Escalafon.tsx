import { FileCheck2, GraduationCap } from "lucide-react";
import config from "@data/app_config.json";
import QueEs from "@/components/QueEs";
import { NIVELES, PUNTOS, PUNTOS_CORTO, nivelDe } from "@/lib/meritos";
import { COSTO_PROTECTOR_XP, type Progreso } from "@/lib/progreso";

const XP = config.gamification.xp_system;

const REGLAS = [
  { texto: "Respuesta correcta", xp: XP.correct_answer },
  { texto: "Correcta la primera vez que ves la pregunta", xp: XP.correct_first_try },
  { texto: "Terminar una práctica o un simulacro", xp: XP.complete_quiz },
  { texto: "Terminar el simulacro completo", xp: XP.complete_full_simulation },
  { texto: "Por cada día seguido de estudio (una vez al día)", xp: XP.streak_bonus_per_day },
];

/** Nivel de formación según los puntos de mérito acumulados, con la escalera completa y cómo ganarlos */
export default function Escalafon({ progreso }: { progreso: Progreso }) {
  const nivel = nivelDe(progreso.xpTotal ?? 0);

  return (
    <section id="escalafon" className="scroll-mt-6 rounded-3xl bg-tarjeta p-5 ring-1 ring-slate-200 dark:ring-slate-700/60" aria-labelledby="titulo-nivel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="titulo-nivel" className="text-lg">
            Tu nivel
          </h2>
          <p className="mt-1 font-heading text-2xl font-extrabold">
            Nivel {nivel.actual.numero} · {nivel.actual.nombre}
          </p>
          <p className="text-sm text-texto-tenue">
            {(progreso.xpTotal ?? 0).toLocaleString("es-CO")} {PUNTOS} ganados · {(progreso.xp ?? 0).toLocaleString("es-CO")} disponibles
          </p>
          <QueEs>
            Los {PUNTOS} se ganan al responder bien y al terminar prácticas y simulacros. Con ellos subes de nivel, como en la carrera
            docente.
          </QueEs>
        </div>
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-verde-suave text-secondary-light">
          <GraduationCap className="size-7" />
        </span>
      </div>

      <div className="mt-4">
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
          <div className="barra-resaltador h-full" style={{ width: `${nivel.avance * 100}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-texto-tenue">
          {nivel.siguiente
            ? `Te faltan ${nivel.faltan.toLocaleString("es-CO")} ${PUNTOS_CORTO} para ${nivel.siguiente.nombre}.`
            : "Llegaste al nivel más alto. ¡Felicitaciones!"}
        </p>
      </div>

      {/* Escalera de niveles */}
      <ol className="mt-4 grid grid-cols-3 gap-2 text-center text-xs md:grid-cols-6">
        {NIVELES.map((n) => {
          const alcanzado = n.numero <= nivel.actual.numero;
          return (
            <li
              key={n.numero}
              className={`rounded-xl px-1 py-2 ${
                n.numero === nivel.actual.numero
                  ? "bg-primary font-bold text-white"
                  : alcanzado
                    ? "bg-verde-suave font-bold text-primary-dark dark:text-secondary-light"
                    : "bg-slate-50 text-texto-tenue dark:bg-slate-700/40"
              }`}
            >
              <span className="block text-[10px] opacity-80">Nivel {n.numero}</span>
              {n.nombre}
            </li>
          );
        })}
      </ol>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-bold text-primary-dark dark:text-secondary-light">Cómo ganar {PUNTOS}</summary>
        <ul className="mt-2 divide-y divide-slate-100 dark:divide-slate-700">
          {REGLAS.map(({ texto, xp }) => (
            <li key={texto} className="flex items-center justify-between gap-3 py-2">
              <span className="text-slate-600 dark:text-slate-300">{texto}</span>
              <span className="shrink-0 font-bold tabular-nums text-secondary-light">+{xp}</span>
            </li>
          ))}
          <li className="flex items-center justify-between gap-3 py-2">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <FileCheck2 className="size-4 text-secondary-light" /> Excusa justificada (cubre un día que faltaste)
            </span>
            <span className="shrink-0 font-bold tabular-nums text-danger dark:text-danger-light">−{COSTO_PROTECTOR_XP}</span>
          </li>
        </ul>
      </details>
    </section>
  );
}
