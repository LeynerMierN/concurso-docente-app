"use client";

import Link from "next/link";
import { Award, BarChart3, CheckCircle2, Info, Star, Target, XCircle } from "lucide-react";
import Capibara from "@/components/mascota/Capibara";
import { useProgreso } from "@/hooks/useProgreso";
import { MODULOS_NAVEGACION } from "@/lib/appConfig";
import { CATEGORIAS_NUCLEO, aciertoGlobal, aciertoPorArea, proyeccionPuntaje } from "@/lib/estadisticas";
import { UMBRAL_DOCENTE_AULA } from "@/lib/preguntas";
import { calcularRacha, diasDeRacha } from "@/lib/storage";
import { formatoTiempo } from "@/lib/tiempo";

const tarjeta = "rounded-3xl bg-tarjeta p-5 ring-1 ring-slate-200 dark:ring-slate-700/60";
const formatoFecha = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short" });
const formatoFechaHora = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const descripcion = MODULOS_NAVEGACION.find((m) => m.id === "estadisticas")?.descripcion;

export default function Pagina() {
  const progreso = useProgreso();

  const encabezado = (
    <header>
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <BarChart3 className="size-7 text-primary-light" /> Mi rendimiento
      </h1>
      {descripcion && <p className="mt-1 text-sm text-texto-tenue">{descripcion}</p>}
    </header>
  );

  if (!progreso) {
    return (
      <div className="space-y-6">
        {encabezado}
        <div className="h-64 motion-safe:animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-700/60" aria-hidden />
      </div>
    );
  }

  if (progreso.intentos.length === 0) {
    return (
      <div className="space-y-6">
        {encabezado}
        <section className={`${tarjeta} text-center`}>
          <Capibara animo="durmiendo" tamano={88} mirarPuntero={false} className="mx-auto block" />
          <h2 className="mt-3 font-bold">Aún no hay datos</h2>
          <p className="mt-1 text-sm text-texto-tenue">
            Capi está durmiendo mientras espera tus primeros resultados. Termina una práctica o un simulacro y aquí verás tus
            métricas.
          </p>
          <Link href="/practica" className="mt-4 inline-block rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
            Empezar a practicar
          </Link>
        </section>
      </div>
    );
  }

  const areas = aciertoPorArea(progreso);
  const sinPracticar = CATEGORIAS_NUCLEO.filter((a) => !areas.some((x) => x.area === a));
  const simulacros = progreso.intentos.filter((i) => i.modo === "simulacro");
  const aprobados = simulacros.filter((s) => s.aprobado).length;
  const proyeccion = proyeccionPuntaje(progreso);
  const racha = calcularRacha(diasDeRacha(progreso));
  const evolucion = simulacros.slice(0, 10).reverse();
  const fuerte = areas.length > 1 ? areas[areas.length - 1] : null;

  const indicadores = [
    { etiqueta: "Preguntas resueltas", valor: progreso.totalRespondidas.toLocaleString("es-CO"), detalle: `Mejor constancia: ${racha.mejor} días` },
    { etiqueta: "Acierto global", valor: `${aciertoGlobal(progreso)}%`, detalle: `Meta: ${UMBRAL_DOCENTE_AULA}%` },
    { etiqueta: "Simulacros aprobados", valor: `${aprobados}/${simulacros.length}`, detalle: `${progreso.intentos.length} intentos en total` },
    {
      etiqueta: "Puntaje proyectado",
      valor: proyeccion === null ? "—" : proyeccion.toLocaleString("es-CO"),
      detalle: proyeccion === null ? "Haz un simulacro" : proyeccion >= UMBRAL_DOCENTE_AULA ? "Por encima del umbral" : "Por debajo del umbral",
    },
  ];

  return (
    <div className="space-y-6">
      {encabezado}

      <section aria-label="Indicadores" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {indicadores.map(({ etiqueta, valor, detalle }) => (
          <div key={etiqueta} className="rounded-2xl bg-tarjeta p-4 ring-1 ring-slate-200 dark:ring-slate-700/60">
            <p className="text-xs font-medium text-texto-tenue">{etiqueta}</p>
            <p className="mt-1 font-heading text-2xl font-extrabold tabular-nums">{valor}</p>
            <p className="mt-0.5 text-[11px] text-texto-tenue">{detalle}</p>
          </div>
        ))}
      </section>

      {/* Evolución de simulacros */}
      <section className={tarjeta} aria-labelledby="titulo-evolucion">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="titulo-evolucion" className="font-bold">
            Evolución de tus simulacros
          </h2>
          <span className="flex items-center gap-1.5 text-[11px] text-texto-tenue">
            <span className="inline-block h-0 w-4 border-t-2 border-dashed border-slate-400" /> umbral {UMBRAL_DOCENTE_AULA}
          </span>
        </div>
        {evolucion.length === 0 ? (
          <p className="mt-3 text-sm text-texto-tenue">
            Aún no has hecho simulacros.{" "}
            <Link href="/simulacros" className="font-semibold text-primary-light">
              Haz el primero
            </Link>
          </p>
        ) : (
          <>
            <div className="relative mt-6 h-40" role="img" aria-label={`Puntajes de los últimos ${evolucion.length} simulacros`}>
              <div
                className="absolute inset-x-0 border-t-2 border-dashed border-slate-300 dark:border-slate-600"
                style={{ bottom: `${UMBRAL_DOCENTE_AULA}%` }}
                aria-hidden
              />
              <ol className="relative flex h-full items-end gap-2">
                {evolucion.map((s) => (
                  <li
                    key={s.id}
                    className="flex h-full min-w-0 flex-1 flex-col justify-end"
                    title={`${formatoFechaHora.format(new Date(s.fecha))}: ${s.puntaje}/100 (${s.aprobado ? "aprobado" : "no aprobado"})`}
                  >
                    <span className="mb-1 text-center text-[11px] font-semibold tabular-nums">{Math.round(s.puntaje)}</span>
                    <span className="block w-full rounded-t-md bg-primary-light" style={{ height: `${Math.max(s.puntaje, 2)}%` }} />
                  </li>
                ))}
              </ol>
            </div>
            <ol className="mt-1 flex gap-2 border-t border-slate-200 pt-1 dark:border-slate-700" aria-hidden>
              {evolucion.map((s) => (
                <li key={s.id} className="min-w-0 flex-1 truncate text-center text-[10px] text-texto-tenue">
                  {formatoFecha.format(new Date(s.fecha))}
                </li>
              ))}
            </ol>
            <p className="mt-3 flex gap-1.5 text-xs text-texto-tenue">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              El puntaje proyectado es el promedio de tus últimos 3 simulacros: indica tendencia, no predice el resultado oficial.
            </p>
          </>
        )}
      </section>

      {/* Fortalezas y áreas para reforzar (nunca «débil») */}
      <section className={tarjeta} aria-labelledby="titulo-areas">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="titulo-areas" className="font-bold">
            Fortalezas y áreas para reforzar
          </h2>
          <span className="flex items-center gap-1 text-[11px] text-texto-tenue">
            <span className="inline-block h-3 w-0.5 rounded bg-slate-500" /> meta {UMBRAL_DOCENTE_AULA}%
          </span>
        </div>
        <ul className="mt-4 space-y-3.5">
          {areas.map(({ area, pct, respondidas }, i) => (
            <li key={area}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate">{area}</span>
                  {i === 0 && areas.length > 1 && pct < 100 && (
                    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-mora-suave px-1.5 py-0.5 text-[10px] font-bold text-danger dark:text-danger-light">
                      <Target className="size-3" /> Para reforzar
                    </span>
                  )}
                  {fuerte?.area === area && pct > areas[0].pct && (
                    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-secondary/15 px-1.5 py-0.5 text-[10px] font-bold text-secondary-dark dark:text-secondary-light">
                      <Star className="size-3" /> Fortaleza
                    </span>
                  )}
                </span>
                <span className="shrink-0 tabular-nums">
                  <span className="font-semibold">{pct}%</span> <span className="text-xs text-texto-tenue">· {respondidas}</span>
                </span>
              </div>
              <div
                className="relative mt-1.5 h-2 rounded-full bg-slate-100 dark:bg-slate-700/60"
                title={`${area}: ${pct}% de acierto en ${respondidas} respuestas`}
              >
                <div
                  className={`h-full rounded-full ${i === 0 && areas.length > 1 && pct < UMBRAL_DOCENTE_AULA ? "bg-danger dark:bg-danger-light" : "bg-primary"}`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
                <span className="absolute -top-0.5 h-3 w-0.5 rounded bg-slate-500" style={{ left: `${UMBRAL_DOCENTE_AULA}%` }} aria-hidden />
              </div>
            </li>
          ))}
        </ul>
        {sinPracticar.length > 0 && (
          <p className="mt-4 text-xs text-texto-tenue">
            <span className="font-semibold">Núcleo común sin practicar:</span> {sinPracticar.join(" · ")}
          </p>
        )}
      </section>

      {/* Historial */}
      <section className={tarjeta} aria-labelledby="titulo-historial">
        <h2 id="titulo-historial" className="font-bold">
          Historial de intentos
        </h2>
        <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
          {progreso.intentos.slice(0, 20).map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <span className="min-w-0">
                <span className="block text-sm font-medium">
                  {i.modo === "simulacro" ? "Simulacro" : "Práctica"} · <span className="text-texto-tenue">{i.area}</span>
                </span>
                <span className="block text-xs text-texto-tenue">
                  {formatoFechaHora.format(new Date(i.fecha))} · {i.correctas}/{i.totalPreguntas} correctas · {formatoTiempo(i.duracionSegundos)}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="font-bold tabular-nums">{i.puntaje.toLocaleString("es-CO")}</span>
                {i.aprobado ? (
                  <Award className="size-4 text-secondary-light" aria-label="Aprobado" />
                ) : (
                  <XCircle className="size-4 text-danger dark:text-danger-light" aria-label="No aprobado" />
                )}
              </span>
            </li>
          ))}
        </ul>
        {progreso.intentos.length > 20 && (
          <p className="mt-3 flex items-center gap-1 text-xs text-texto-tenue">
            <CheckCircle2 className="size-3.5" /> Mostrando los 20 más recientes de {progreso.intentos.length}.
          </p>
        )}
      </section>
    </div>
  );
}
