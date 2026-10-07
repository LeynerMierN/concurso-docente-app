"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BookOpenCheck, Play } from "lucide-react";
import Volver from "@/components/Volver";
import Cargando from "@/components/quiz/Cargando";
import QuizRunner from "@/components/quiz/QuizRunner";
import { usePerfil } from "@/hooks/usePerfil";
import { useProgreso } from "@/hooks/useProgreso";
import { useQuizRunner } from "@/hooks/useQuizRunner";
import { umbralDe } from "@/lib/perfil";
import SelectorCategorias from "@/components/practica/SelectorCategorias";
import { FILTRO_NUCLEO_COMUN, MODOS_EXAMEN, configDesdeModo, dimensionarModo, obtenerModo } from "@/lib/appConfig";
import { etiquetaFiltro, filtrarPreguntas, mezclar } from "@/lib/preguntas";
import { FILTRO_REPASO, pendientesHoy } from "@/lib/repaso";
import type { FiltroExamen } from "@/types/exam";

/** «Practicar un tema» (area_20) se enfoca en una sola área: no admite «Todas las áreas» */
const MODOS_DE_UNA_AREA = new Set(["area_20"]);

/** Sin ?modo se abre la práctica rápida (10 preguntas); la práctica sin límite es ?modo=libre */
const MODO_LIBRE = "libre";
const MODO_POR_DEFECTO = "express_10";

/** Tipos de práctica, con nombre corto para el selector segmentado */
const TIPOS = [
  { id: MODO_POR_DEFECTO, etiqueta: "Rápida" },
  { id: "area_20", etiqueta: "Por tema" },
  { id: null, etiqueta: "Sin límite" },
].filter((t) => t.id === null || MODOS_EXAMEN.some((m) => m.id === t.id && m.feedbackInmediato));

export default function Pagina() {
  return (
    <Suspense fallback={<Cargando />}>
      <Practica />
    </Suspense>
  );
}

function Practica() {
  const parametros = useSearchParams();
  const modoPedido = parametros.get("modo");
  const modo = modoPedido === MODO_LIBRE ? undefined : (obtenerModo(modoPedido) ?? obtenerModo(MODO_POR_DEFECTO));
  // ?filtro= permite llegar con una categoría preseleccionada (p. ej. desde «Para tu cargo» en Estudiar)
  const pedido = parametros.get("filtro");
  const filtroInicial = pedido && (pedido === FILTRO_REPASO || filtrarPreguntas(pedido).length > 0) ? pedido : null;
  // ?empezar=1 arranca la sesión sin pasar por el selector (botón «Tu siguiente paso» del inicio)
  const empezar = parametros.get("empezar") === "1";
  // La clave cambia con el modo para que al elegir otro modo se reinicie la selección
  return (
    <Selector
      key={`${modo?.id ?? "libre"}-${filtroInicial}`}
      modoId={modo?.id ?? null}
      filtroInicial={filtroInicial}
      empezar={empezar}
    />
  );
}

interface PropsSelector {
  modoId: string | null;
  filtroInicial: FiltroExamen | null;
  empezar: boolean;
}

function Selector({ modoId, filtroInicial, empezar }: PropsSelector) {
  const runner = useQuizRunner("concurso-docente:practica");
  const { perfil } = usePerfil();
  const umbral = umbralDe(perfil);
  const progreso = useProgreso();
  const pendientes = progreso ? pendientesHoy(progreso) : [];
  const modo = obtenerModo(modoId);
  const unaArea = !!modo && MODOS_DE_UNA_AREA.has(modo.id);
  const [filtro, setFiltro] = useState<FiltroExamen | null>(filtroInicial ?? (unaArea ? null : FILTRO_NUCLEO_COMUN));
  const [feedback, setFeedback] = useState(true);
  // La lista de temas va plegada: se abre si hay que elegir uno o si se pide cambiarlo
  const [eligiendo, setEligiendo] = useState(!filtroInicial && unaArea);
  const router = useRouter();
  const ruta = usePathname();
  const parametros = useSearchParams();
  const arrancado = useRef(false);

  // Arranque directo: una sola vez, cuando ya se leyó la sesión y el progreso (el repaso lo necesita).
  // Si ya había una sesión en curso, se retoma esa. Luego se quita ?empezar para que «Nuevo intento» no rearranque.
  useEffect(() => {
    if (!empezar || arrancado.current || !runner.cargado || !progreso) return;
    arrancado.current = true;
    if (!runner.sesion) iniciar();
    const resto = new URLSearchParams(parametros.toString());
    resto.delete("empezar");
    const consulta = resto.toString();
    router.replace(consulta ? `${ruta}?${consulta}` : ruta, { scroll: false });
  });

  const esRepaso = filtro === FILTRO_REPASO;
  const dimension = modo && filtro && !esRepaso ? dimensionarModo(modo, filtro) : null;
  // En el repaso, cada modo usa como máximo sus preguntas del config; el tiempo se escala igual
  const cantidadRepaso = modo ? Math.min(modo.preguntasConfig, pendientes.length) : pendientes.length;
  const minutosRepaso = modo?.minutosPorPregunta ? Math.ceil(modo.minutosPorPregunta * cantidadRepaso) : null;
  const cantidad = esRepaso ? cantidadRepaso : dimension ? dimension.preguntas : filtro ? filtrarPreguntas(filtro).length : 0;
  const iniciar = () => {
    if (!filtro || cantidad === 0) return;
    if (esRepaso) {
      runner.iniciar({
        modo: "practica",
        modoId: modo?.id,
        filtro,
        // Prioriza las más frágiles (cajas bajas) y mezcla dentro del lote
        preguntaIds: mezclar(pendientes.slice(0, cantidadRepaso)),
        cantidad: cantidadRepaso,
        limiteSegundos: minutosRepaso === null ? null : minutosRepaso * 60,
        feedbackInmediato: modo ? modo.feedbackInmediato : true,
        permitirPausa: modo?.permitePausa,
        umbral,
      });
      return;
    }
    runner.iniciar(
      modo
        ? configDesdeModo(modo, filtro, umbral)
        : { modo: "practica", filtro, limiteSegundos: null, feedbackInmediato: feedback, umbral },
    );
  };

  if (!runner.cargado) return <Cargando />;
  if (runner.sesion) return <QuizRunner runner={runner} />;

  return (
    <div className="space-y-5 pb-24">
      <header>
        <Volver href="/estudiar" etiqueta="Estudiar" />
        <h1 className="mt-1 flex items-center gap-2 text-2xl">
          <BookOpenCheck className="size-7 text-secondary-light" /> Práctica
        </h1>
        <p className="mt-1 text-[15px] text-texto-tenue">{modo ? modo.descripcion : "Todas las preguntas que quieras, sin límite de tiempo."}</p>
      </header>

      {/* Tipo de práctica: tres opciones, una activa */}
      <nav aria-label="Tipo de práctica" className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
        {TIPOS.map((t) => {
          const activo = (modoId ?? null) === t.id;
          return (
            <Link
              key={t.etiqueta}
              href={`/practica?modo=${t.id ?? MODO_LIBRE}`}
              aria-current={activo ? "page" : undefined}
              className={`rounded-xl py-2 text-center text-sm transition ${
                activo ? "bg-tarjeta font-bold shadow-sm ring-1 ring-slate-200 dark:ring-slate-600" : "font-semibold text-texto-tenue hover:text-texto"
              }`}
            >
              {t.etiqueta}
            </Link>
          );
        })}
      </nav>

      {/* Qué practicar: resumen con «Cambiar»; la taxonomía completa solo cuando se pide */}
      <section aria-labelledby="titulo-tema" className="rounded-3xl bg-tarjeta p-4 ring-1 ring-slate-200 dark:ring-slate-700/60">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 id="titulo-tema" className="text-xs font-bold uppercase tracking-wide text-texto-tenue">
              Qué vas a practicar
            </h2>
            <p className="mt-0.5 font-heading text-lg font-bold leading-snug">{filtro ? etiquetaFiltro(filtro) : "Elige un área o tema"}</p>
          </div>
          {!eligiendo && (
            <button
              type="button"
              onClick={() => setEligiendo(true)}
              className="shrink-0 rounded-xl px-3 py-2 text-sm font-bold text-primary-dark ring-1 ring-slate-200 dark:text-secondary-light dark:ring-slate-600"
            >
              Cambiar
            </button>
          )}
        </div>
        {eligiendo && (
          <div className="mt-4">
            <SelectorCategorias
              filtro={filtro}
              onElegir={(f) => {
                setFiltro(f);
                setEligiendo(false);
              }}
              soloUnaArea={unaArea}
              pendientesRepaso={pendientes.length}
            />
          </div>
        )}
      </section>

      {!modo && (
        <label className="flex items-center justify-between gap-4 rounded-2xl bg-tarjeta p-4 ring-1 ring-slate-200 dark:ring-slate-700/60">
          <span>
            <span className="block font-bold">Ver la respuesta al instante</span>
            <span className="block text-sm text-texto-tenue">Si lo apagas, ves todas las respuestas al final.</span>
          </span>
          <input
            type="checkbox"
            checked={feedback}
            onChange={(e) => setFeedback(e.target.checked)}
            className="size-5 shrink-0 accent-primary"
          />
        </label>
      )}

      <div className="fixed inset-x-0 bottom-20 z-30 px-4 lg:bottom-6 lg:left-64">
        <button
          type="button"
          onClick={iniciar}
          disabled={!filtro}
          className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 font-bold text-white shadow-lg active:scale-[0.98] disabled:bg-slate-200 disabled:text-texto-tenue disabled:shadow-none dark:disabled:bg-slate-700"
        >
          <Play className="size-5" fill="currentColor" />
          {filtro
            ? `Empezar · ${cantidad} ${cantidad === 1 ? "pregunta" : "preguntas"}${dimension?.minutos ? ` · ${dimension.minutos} min` : ""}`
            : "Elige un tema para empezar"}
        </button>
      </div>
    </div>
  );
}
