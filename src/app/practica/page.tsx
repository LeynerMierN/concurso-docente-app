"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpenCheck, Clock, Pause, Play } from "lucide-react";
import Cargando from "@/components/quiz/Cargando";
import QuizRunner from "@/components/quiz/QuizRunner";
import { usePerfil } from "@/hooks/usePerfil";
import { useProgreso } from "@/hooks/useProgreso";
import { useQuizRunner } from "@/hooks/useQuizRunner";
import { umbralDe } from "@/lib/perfil";
import SelectorCategorias from "@/components/practica/SelectorCategorias";
import { FILTRO_NUCLEO_COMUN, MODOS_EXAMEN, configDesdeModo, dimensionarModo, obtenerModo } from "@/lib/appConfig";
import { filtrarPreguntas, mezclar } from "@/lib/preguntas";
import { FILTRO_REPASO, pendientesHoy } from "@/lib/repaso";
import type { FiltroExamen } from "@/types/exam";

/** "Prueba por Competencia" se enfoca en una sola área: no admite "Todas las áreas" */
const MODOS_DE_UNA_AREA = new Set(["area_20"]);

/** Modos de práctica (con retroalimentación inmediata) definidos en data/app_config.json */
const MODOS_PRACTICA = MODOS_EXAMEN.filter((m) => m.feedbackInmediato);

export default function Pagina() {
  return (
    <Suspense fallback={<Cargando />}>
      <Practica />
    </Suspense>
  );
}

function Practica() {
  const parametros = useSearchParams();
  const modo = obtenerModo(parametros.get("modo"));
  // ?filtro= permite llegar con una categoría preseleccionada (p. ej. desde "Tu ruta" en Inicio)
  const pedido = parametros.get("filtro");
  const filtroInicial = pedido && (pedido === FILTRO_REPASO || filtrarPreguntas(pedido).length > 0) ? pedido : null;
  // La clave cambia con el modo para que al elegir otro modo se reinicie la selección
  return <Selector key={`${modo?.id ?? "libre"}-${filtroInicial}`} modoId={modo?.id ?? null} filtroInicial={filtroInicial} />;
}

function Selector({ modoId, filtroInicial }: { modoId: string | null; filtroInicial: FiltroExamen | null }) {
  const runner = useQuizRunner("concurso-docente:practica");
  const { perfil } = usePerfil();
  const umbral = umbralDe(perfil);
  const progreso = useProgreso();
  const pendientes = progreso ? pendientesHoy(progreso) : [];
  const modo = obtenerModo(modoId);
  const unaArea = !!modo && MODOS_DE_UNA_AREA.has(modo.id);
  const [filtro, setFiltro] = useState<FiltroExamen | null>(filtroInicial ?? (unaArea ? null : FILTRO_NUCLEO_COMUN));
  const [feedback, setFeedback] = useState(true);

  if (!runner.cargado) return <Cargando />;
  if (runner.sesion) return <QuizRunner runner={runner} />;

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

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <BookOpenCheck className="size-7 text-primary-light" /> Práctica guiada
        </h1>
        <p className="mt-1 text-sm text-texto-tenue">
          {modo ? modo.descripcion : "Elige qué repasar: el núcleo común, tu especialidad o un tema clave. Sin límite de tiempo."}
        </p>
      </header>

      {/* Cambiar de modalidad */}
      <nav aria-label="Modalidad de práctica" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
        <ul className="flex w-max gap-2">
          {[{ id: null, nombre: "Libre", href: "/practica" }, ...MODOS_PRACTICA.map((m) => ({ id: m.id, nombre: m.nombre, href: m.href }))].map(
            (m) => (
              <li key={m.href}>
                <Link
                  href={m.href}
                  aria-current={modoId === m.id ? "page" : undefined}
                  className={`block whitespace-nowrap rounded-2xl px-3.5 py-2 text-sm transition ${
                    modoId === m.id
                      ? "bg-primary font-semibold text-white"
                      : "bg-tarjeta text-slate-700 ring-1 ring-slate-200 dark:text-slate-300 dark:ring-slate-700/60"
                  }`}
                >
                  {m.nombre}
                </Link>
              </li>
            ),
          )}
        </ul>
      </nav>

      {modo && (
        <ul className="flex flex-wrap gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
          <li className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700/60">
            Hasta {modo.preguntas} preguntas
          </li>
          <li className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700/60">
            <Clock className="size-3.5" /> {modo.minutos ? `${modo.minutos} min` : "Sin límite de tiempo"}
          </li>
          {modo.permitePausa && modo.minutos && (
            <li className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700/60">
              <Pause className="size-3.5" /> Se puede pausar
            </li>
          )}
        </ul>
      )}

      {unaArea && !filtro && (
        <p className="rounded-2xl bg-accent/10 p-3 text-sm text-accent-dark dark:text-accent-light">
          Elige el área o tema que quieres evaluar.
        </p>
      )}

      <SelectorCategorias filtro={filtro} onElegir={setFiltro} soloUnaArea={unaArea} pendientesRepaso={pendientes.length} />

      {!modo && (
        <label className="flex items-center justify-between gap-4 rounded-2xl bg-tarjeta p-4 ring-1 ring-slate-200 dark:ring-slate-700/60">
          <span>
            <span className="block font-semibold">Retroalimentación inmediata</span>
            <span className="block text-sm text-texto-tenue">Ver la respuesta y la justificación al responder</span>
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
          className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 font-semibold text-white shadow-lg active:scale-[0.98] disabled:opacity-50"
        >
          <Play className="size-5" fill="currentColor" />
          {filtro
            ? `Empezar · ${cantidad} ${cantidad === 1 ? "pregunta" : "preguntas"}${dimension?.minutos ? ` · ${dimension.minutos} min` : ""}`
            : "Elige un área para empezar"}
        </button>
      </div>
    </div>
  );
}
