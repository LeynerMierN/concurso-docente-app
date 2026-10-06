"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { armarExamen, armarPorDistribucion, calificar, etiquetaFiltro, listarRespuestas, mezclar, obtenerPregunta } from "@/lib/preguntas";
import { registrarIntento } from "@/lib/storage";
import type { ConfigExamen, Opcion, OpcionId, Pregunta, SesionExamen } from "@/types/exam";

const LETRAS: OpcionId[] = ["A", "B", "C", "D"];

function leerSesion(clave: string): SesionExamen | null {
  try {
    const crudo = localStorage.getItem(clave);
    if (!crudo) return null;
    const sesion = JSON.parse(crudo) as SesionExamen;
    if (sesion?.version !== 1 || !Array.isArray(sesion.preguntaIds)) return null;
    // Si el banco cambió, descartamos preguntas que ya no existen
    const ids = sesion.preguntaIds.filter((id) => obtenerPregunta(id));
    if (ids.length === 0) return null;
    return { ...sesion, preguntaIds: ids, indice: Math.min(sesion.indice, ids.length - 1) };
  } catch {
    return null;
  }
}

function guardarSesion(clave: string, sesion: SesionExamen | null) {
  try {
    if (sesion) localStorage.setItem(clave, JSON.stringify(sesion));
    else localStorage.removeItem(clave);
  } catch {
    // Almacenamiento no disponible (modo privado, cuota llena): seguimos solo en memoria
  }
}

/**
 * Motor de examen reutilizable para Práctica y Simulacro.
 * Persiste la sesión en localStorage bajo `clave`, incluida la hora límite absoluta,
 * de modo que recargar la página no reinicia el cronómetro ni pierde respuestas.
 */
export function useQuizRunner(clave: string) {
  const [sesion, setSesion] = useState<SesionExamen | null>(null);
  const [cargado, setCargado] = useState(false);
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    setSesion(leerSesion(clave));
    setAhora(Date.now());
    setCargado(true);
  }, [clave]);

  useEffect(() => {
    if (cargado) guardarSesion(clave, sesion);
  }, [clave, sesion, cargado]);

  const pausado = !!sesion?.pausadoMs && sesion.terminadoMs === null;
  const corriendo = !!sesion && sesion.terminadoMs === null && !pausado;

  useEffect(() => {
    if (!corriendo) return;
    const intervalo = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(intervalo);
  }, [corriendo]);

  // Cierre automático al agotarse el tiempo (también si se agotó con la página cerrada)
  useEffect(() => {
    if (sesion && sesion.terminadoMs === null && !sesion.pausadoMs && sesion.finMs !== null && ahora >= sesion.finMs) {
      setSesion({ ...sesion, terminadoMs: sesion.finMs });
    }
  }, [ahora, sesion]);

  /** Aplica un cambio solo si la sesión sigue en curso */
  const modificar = useCallback((cambio: (s: SesionExamen) => SesionExamen) => {
    setSesion((s) => (s && s.terminadoMs === null ? cambio(s) : s));
  }, []);

  const iniciar = useCallback((config: ConfigExamen) => {
    const preguntas = config.distribucion ? armarPorDistribucion(config.distribucion) : armarExamen(config.filtro, config.cantidad);
    if (preguntas.length === 0) return;
    const inicioMs = Date.now();
    setAhora(inicioMs);
    setSesion({
      version: 1,
      config,
      preguntaIds: preguntas.map((p) => p.id),
      ordenOpciones: Object.fromEntries(preguntas.map((p) => [p.id, mezclar(p.opciones.map((o) => o.id))])),
      respuestas: {},
      banderas: [],
      indice: 0,
      inicioMs,
      finMs: config.limiteSegundos === null ? null : inicioMs + config.limiteSegundos * 1000,
      terminadoMs: null,
    });
  }, []);

  const preguntas = useMemo(
    () => (sesion ? sesion.preguntaIds.map((id) => obtenerPregunta(id)).filter((p): p is Pregunta => !!p) : []),
    [sesion],
  );

  const preguntaActual = sesion ? preguntas[sesion.indice] : undefined;

  const responder = useCallback(
    (opcion: OpcionId) =>
      modificar((s) => {
        const id = s.preguntaIds[s.indice];
        // Con retroalimentación inmediata la primera respuesta queda fija
        if (s.config.feedbackInmediato && s.respuestas[id]) return s;
        return { ...s, respuestas: { ...s.respuestas, [id]: opcion } };
      }),
    [modificar],
  );

  const irA = useCallback(
    (indice: number) => modificar((s) => ({ ...s, indice: Math.max(0, Math.min(indice, s.preguntaIds.length - 1)) })),
    [modificar],
  );

  const alternarBandera = useCallback(
    () =>
      modificar((s) => {
        const id = s.preguntaIds[s.indice];
        const banderas = s.banderas.includes(id) ? s.banderas.filter((b) => b !== id) : [...s.banderas, id];
        return { ...s, banderas };
      }),
    [modificar],
  );

  // Si se entrega estando en pausa, el tiempo en pausa no cuenta
  const finalizar = useCallback(
    () => modificar((s) => ({ ...s, terminadoMs: s.pausadoMs ?? Date.now(), pausadoMs: null })),
    [modificar],
  );

  const pausar = useCallback(
    () => modificar((s) => (s.config.permitirPausa && s.finMs !== null && !s.pausadoMs ? { ...s, pausadoMs: Date.now() } : s)),
    [modificar],
  );

  /** Reanuda desplazando inicio y límite, así el tiempo en pausa no se descuenta */
  const reanudar = useCallback(() => {
    const ahoraMs = Date.now();
    setAhora(ahoraMs);
    modificar((s) => {
      if (!s.pausadoMs) return s;
      const pausa = ahoraMs - s.pausadoMs;
      return { ...s, inicioMs: s.inicioMs + pausa, finMs: s.finMs === null ? null : s.finMs + pausa, pausadoMs: null };
    });
  }, [modificar]);

  const reiniciar = useCallback(() => setSesion(null), []);

  /** Opciones de una pregunta en el orden mezclado de esta sesión, con la letra que ve el usuario */
  const opcionesDe = useCallback(
    (pregunta: Pregunta): (Opcion & { letra: OpcionId })[] => {
      const orden = sesion?.ordenOpciones[pregunta.id] ?? pregunta.opciones.map((o) => o.id);
      return orden
        .map((id) => pregunta.opciones.find((o) => o.id === id))
        .filter((o): o is Opcion => !!o)
        .map((o, i) => ({ ...o, letra: LETRAS[i] }));
    },
    [sesion],
  );

  const resultado = useMemo(
    () => (sesion?.terminadoMs ? calificar(preguntas, sesion.respuestas, sesion.config.umbral) : null),
    [sesion, preguntas],
  );

  // Guarda el intento en el historial al terminar (registrarIntento ignora duplicados tras recargar)
  useEffect(() => {
    if (!sesion?.terminadoMs || !resultado) return;
    registrarIntento({
      modo: sesion.config.modo,
      area: etiquetaFiltro(sesion.config.filtro),
      inicioMs: sesion.inicioMs,
      terminadoMs: sesion.terminadoMs,
      preguntas,
      respuestas: sesion.respuestas,
      puntaje: resultado.porcentaje,
      aprobado: resultado.aprobado,
    });
  }, [sesion, preguntas, resultado]);

  const respuestasUsuario = useMemo(
    () => (sesion ? listarRespuestas(preguntas, sesion.respuestas) : []),
    [sesion, preguntas],
  );

  const referencia = sesion?.terminadoMs ?? sesion?.pausadoMs ?? ahora;
  const segundosTranscurridos = sesion ? Math.max(0, Math.floor((referencia - sesion.inicioMs) / 1000)) : 0;
  const segundosRestantes =
    sesion?.finMs != null ? Math.max(0, Math.ceil((sesion.finMs - referencia) / 1000)) : null;

  return {
    cargado,
    sesion,
    preguntas,
    preguntaActual,
    respuestasUsuario,
    resultado,
    segundosTranscurridos,
    segundosRestantes,
    iniciar,
    responder,
    irA,
    alternarBandera,
    finalizar,
    reiniciar,
    pausado,
    pausar,
    reanudar,
    opcionesDe,
  };
}

export type QuizRunner = ReturnType<typeof useQuizRunner>;
