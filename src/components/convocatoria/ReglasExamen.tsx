import { Ban, CheckCircle2, Clock, FileQuestion, GraduationCap, ListOrdered, MapPin, ShieldAlert, Trophy, Ticket } from "lucide-react";
import { CONVOCATORIA_DATA, formatoCOP } from "@/lib/convocatoria";

const { reglas_examen: reglas, informacion_general: info, requisitos_por_perfil: perfiles } = CONVOCATORIA_DATA;
const eliminatoria = reglas.componentes.find((c) => c.caracter === "Eliminatorio");
const clasificatoria = reglas.componentes.find((c) => c.caracter === "Clasificatoria");

const tarjeta = "rounded-3xl bg-tarjeta p-5 ring-1 ring-slate-200 dark:ring-slate-700/60";

export default function ReglasExamen() {
  const ficha = [
    { Icono: FileQuestion, valor: "~120", etiqueta: "preguntas", detalle: reglas.preguntas_promedio },
    { Icono: Clock, valor: "4,5–5 h", etiqueta: "continuas", detalle: "Jornada única o dos sesiones" },
    { Icono: MapPin, valor: "Presencial", etiqueta: "modalidad", detalle: "Sitio asignado por la CNSC" },
    { Icono: ListOrdered, valor: "A·B·C·D", etiqueta: "juicio situacional", detalle: "Opción múltiple, única respuesta" },
  ];

  const umbrales = [
    { perfil: "Docentes de aula", minimo: eliminatoria?.umbral_aprobatorio?.docente_aula ?? 60 },
    { perfil: "Directivos docentes", minimo: eliminatoria?.umbral_aprobatorio?.directivo_docente ?? 70 },
  ];

  return (
    <div className="space-y-5">
      {/* Ficha técnica */}
      <section className="grid grid-cols-2 gap-3">
        {ficha.map(({ Icono, valor, etiqueta, detalle }) => (
          <div key={etiqueta} className="rounded-2xl bg-tarjeta p-4 ring-1 ring-slate-200 dark:ring-slate-700/60">
            <Icono className="size-5 text-marca-500" />
            <p className="mt-2 text-xl font-bold">{valor}</p>
            <p className="text-xs font-medium text-texto-tenue">{etiqueta}</p>
            <p className="mt-1 text-[11px] leading-tight text-texto-tenue">{detalle}</p>
          </div>
        ))}
      </section>

      {/* Umbrales */}
      <section className={tarjeta}>
        <h2 className="font-semibold">Puntaje mínimo para seguir en concurso</h2>
        <p className="mt-1 text-sm text-texto-tenue">Sobre 100 puntos. Quien no lo alcanza queda excluido.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {umbrales.map(({ perfil, minimo }) => (
            <div key={perfil} className="rounded-2xl bg-slate-50 p-4 text-center dark:bg-slate-700/40">
              <p className="text-xs font-medium text-texto-tenue">{perfil}</p>
              <p className="mt-1 text-4xl font-extrabold tabular-nums text-primary-light">{minimo}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-full rounded-full bg-marca-500" style={{ width: `${minimo}%` }} />
              </div>
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-error/10 px-2 py-0.5 text-[11px] font-semibold text-danger dark:text-danger-light">
                <ShieldAlert className="size-3" /> Eliminatorio
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Componentes */}
      <section className="space-y-3">
        <h2 className="font-semibold">Componentes de la prueba escrita</h2>
        {eliminatoria && (
          <div className="rounded-3xl border-l-4 border-error bg-tarjeta p-5 ring-1 ring-slate-200 dark:ring-slate-700/60">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-danger dark:text-danger-light">
              <Ban className="size-4" /> Eliminatoria
            </p>
            <h3 className="mt-1 font-semibold">Básicas, Pedagógicas y Disciplinares</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{eliminatoria.descripcion}</p>
          </div>
        )}
        {clasificatoria && (
          <div className="rounded-3xl border-l-4 border-exito bg-tarjeta p-5 ring-1 ring-slate-200 dark:ring-slate-700/60">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-secondary-light">
              <Trophy className="size-4" /> Clasificatoria · {clasificatoria.peso_porcentual}
            </p>
            <h3 className="mt-1 font-semibold">{clasificatoria.nombre}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{clasificatoria.descripcion}</p>
          </div>
        )}
      </section>

      {/* PIN SIMO */}
      <section className={tarjeta}>
        <h2 className="flex items-center gap-2 font-semibold">
          <Ticket className="size-5 text-marca-500" /> Derechos de participación (PIN)
        </h2>
        <p className="mt-1 text-sm text-texto-tenue">Se paga al inscribirse en {info.costos_pin_simo.plataforma}.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            { perfil: "Licenciados y profesionales", valor: info.costos_pin_simo.profesional },
            { perfil: "Normalistas y tecnólogos", valor: info.costos_pin_simo.normalista_tecnico },
          ].map(({ perfil, valor }) => (
            <div key={perfil} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/40">
              <p className="text-xs text-texto-tenue">{perfil}</p>
              <p className="mt-1 text-lg font-bold tabular-nums">~{formatoCOP.format(valor)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quién puede presentarse */}
      <section className={tarjeta}>
        <h2 className="flex items-center gap-2 font-semibold">
          <GraduationCap className="size-5 text-marca-500" /> ¿Quién puede presentarse?
        </h2>
        <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
          {perfiles.map((p) => (
            <li key={p.tipo} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold">{p.tipo}</p>
                <span className="shrink-0 rounded-full bg-marca-50 px-2 py-0.5 text-[11px] font-semibold text-primary-light dark:bg-marca-700/30">
                  {p.ingreso_escalafon}
                </span>
              </div>
              <p className="mt-1 text-xs text-texto-tenue">{p.grados_habilitados.join(" · ")}</p>
              {"condicion_adicional" in p && p.condicion_adicional && (
                <p className="mt-1 text-xs text-accent-dark">{p.condicion_adicional}</p>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Fases */}
      <section className={tarjeta}>
        <h2 className="font-semibold">Etapas del concurso</h2>
        <ol className="mt-4 space-y-3">
          {reglas.fases_posteriores.map((fase, i) => (
            <li key={fase} className="flex gap-3 text-sm">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-marca-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="pt-0.5 text-slate-700 dark:text-slate-300">{fase}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-exito/10 p-3 text-xs text-slate-700 dark:text-slate-300">
          <CheckCircle2 className="size-4 shrink-0 text-secondary-light" /> Tu meta en esta app: superar con holgura el umbral de la
          prueba eliminatoria.
        </p>
      </section>
    </div>
  );
}
