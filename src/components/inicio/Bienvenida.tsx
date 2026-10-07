"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Layers, Timer } from "lucide-react";
import Capibara from "@/components/mascota/Capibara";
import { usePerfil } from "@/hooks/usePerfil";
import { useProgreso } from "@/hooks/useProgreso";
import { CATEGORIAS } from "@/lib/categorias";
import { ROLES, guardarPerfil, perfilNuevo, type Rol } from "@/lib/perfil";

const CLAVE = "concurso-docente:bienvenida";
const ESPECIALIDADES = CATEGORIAS.filter((c) => c.grupo === "especialidades_docentes");
const TOTAL_PASOS = 3;

const QUE_HAY = [
  { Icono: CheckCircle2, texto: "Preguntas como las del examen, con la respuesta explicada" },
  { Icono: Timer, texto: "Simulacros con tiempo, como el día de la prueba" },
  { Icono: Layers, texto: "Fichas con las normas que más se preguntan" },
];

function marcarVista() {
  try {
    localStorage.setItem(CLAVE, "vista");
  } catch {
    // Sin almacenamiento la bienvenida volverá a salir: no es grave
  }
}

function yaVista() {
  try {
    return localStorage.getItem(CLAVE) === "vista";
  } catch {
    return false;
  }
}

const botonPrincipal =
  "flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3.5 font-bold text-white transition active:scale-[0.98]";
const botonSecundario = "w-full rounded-2xl px-4 py-3 text-sm font-bold text-texto-tenue";

/**
 * Bienvenida de tres pasos la primera vez que se abre la app: qué es, a qué cargo aspira
 * (fija el puntaje para aprobar) y su primera práctica. Se puede saltar en cualquier momento.
 */
export default function Bienvenida() {
  const progreso = useProgreso();
  const { perfil, cargado } = usePerfil();
  const [abierta, setAbierta] = useState(false);
  const [paso, setPaso] = useState(0);
  const [rol, setRol] = useState<Rol | null>(null);
  const [especialidad, setEspecialidad] = useState("");
  const [error, setError] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);

  // Se decide una sola vez, cuando ya se leyó lo guardado (guardar el cargo no debe cerrarla)
  const decidida = useRef(false);
  useEffect(() => {
    if (decidida.current || !progreso || !cargado) return;
    decidida.current = true;
    if (!yaVista() && !perfil && progreso.intentos.length === 0) setAbierta(true);
  }, [progreso, cargado, perfil]);

  // Mientras está abierta, el inicio de fondo no se desplaza
  useEffect(() => {
    if (!abierta) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [abierta]);

  // Lectores de pantalla: cada paso nuevo empieza por su título
  useEffect(() => {
    if (abierta) titulo.current?.focus();
  }, [abierta, paso]);

  if (!abierta) return null;

  const cerrar = () => {
    marcarVista();
    setAbierta(false);
  };

  const guardarCargo = () => {
    if (!rol) {
      setError(true);
      return;
    }
    guardarPerfil({ ...perfilNuevo(), role: rol, specialty: rol === "directivo_docente" ? "" : especialidad });
    setPaso(2);
  };

  const encabezadoPaso = "text-center text-[30px] leading-tight outline-none";

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="titulo-bienvenida" className="fixed inset-0 z-50 overflow-y-auto bg-fondo">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-5 pb-8">
        <div className="flex items-center justify-between gap-3">
          {paso > 0 ? (
            <button
              type="button"
              onClick={() => setPaso((p) => p - 1)}
              aria-label="Paso anterior"
              className="grid size-10 place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="size-5" />
            </button>
          ) : (
            <span className="size-10" aria-hidden />
          )}
          <ol className="flex gap-1.5" aria-label={`Paso ${paso + 1} de ${TOTAL_PASOS}`}>
            {Array.from({ length: TOTAL_PASOS }, (_, i) => (
              <li key={i} className={`h-1.5 w-7 rounded-full ${i <= paso ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`} />
            ))}
          </ol>
          <button type="button" onClick={cerrar} className="rounded-full px-3 py-2 text-sm font-bold text-texto-tenue">
            Saltar
          </button>
        </div>

        {/* La clave reinicia la animación de entrada en cada paso */}
        <div key={paso} className="frase-entrar flex flex-1 flex-col pt-6">
          {paso === 0 && (
            <>
              <Capibara animo="feliz" tamano={112} mirarPuntero={false} className="mx-auto block" />
              <h1 ref={titulo} id="titulo-bienvenida" tabIndex={-1} className={`mt-4 ${encabezadoPaso}`}>
                Hola, profe. Soy Capi.
              </h1>
              <p className="mt-2 text-center text-[17px] leading-snug">
                Te acompaño a prepararte para la prueba escrita del Concurso Docente de la CNSC.
              </p>
              <ul className="mt-6 space-y-2.5">
                {QUE_HAY.map(({ Icono, texto }) => (
                  <li key={texto} className="flex items-center gap-3 rounded-2xl bg-tarjeta p-3 ring-1 ring-slate-200 dark:ring-slate-700/60">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-verde-suave text-secondary-light">
                      <Icono className="size-5" />
                    </span>
                    <span className="text-[15px] leading-snug">{texto}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                <button type="button" onClick={() => setPaso(1)} className={botonPrincipal}>
                  Empezar
                </button>
              </div>
            </>
          )}

          {paso === 1 && (
            <>
              <h1 ref={titulo} id="titulo-bienvenida" tabIndex={-1} className={encabezadoPaso}>
                ¿A qué cargo aspiras?
              </h1>
              <p className="mt-2 text-center text-[17px] leading-snug">Así sabemos qué puntaje necesitas para aprobar.</p>
              <fieldset className="mt-6 space-y-3">
                <legend className="sr-only">Cargo al que aspiras</legend>
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    aria-pressed={rol === r.id}
                    onClick={() => {
                      setRol(r.id);
                      setError(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left transition ${
                      rol === r.id ? "bg-verde-suave ring-2 ring-primary-light" : "bg-tarjeta ring-1 ring-slate-200 dark:ring-slate-700"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-heading text-lg font-bold">{r.nombre}</span>
                      <span className="block text-sm text-texto-tenue">Para aprobar necesitas {r.umbral} de 100</span>
                    </span>
                    {/* La elección se ve también por el ícono, no solo por el color */}
                    {rol === r.id && <CheckCircle2 className="size-6 shrink-0 text-secondary-light" aria-hidden />}
                  </button>
                ))}
              </fieldset>
              {rol === "docente_aula" && (
                <label className="mt-5 block space-y-1.5">
                  <span className="text-sm font-bold">
                    Tu área o especialidad <span className="font-normal text-texto-tenue">(opcional)</span>
                  </span>
                  <select
                    value={especialidad}
                    onChange={(e) => setEspecialidad(e.target.value)}
                    className="w-full rounded-2xl bg-tarjeta px-4 py-3 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary-light dark:ring-slate-700"
                  >
                    <option value="">Todavía no lo sé</option>
                    {ESPECIALIDADES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {error && (
                <p role="alert" className="mt-3 text-sm font-bold text-danger dark:text-danger-light">
                  Elige un cargo para continuar.
                </p>
              )}
              <div className="mt-auto pt-8">
                <button type="button" onClick={guardarCargo} className={botonPrincipal}>
                  Continuar
                </button>
                <p className="mt-2 text-center text-xs text-texto-tenue">Puedes cambiarlo cuando quieras en tu perfil.</p>
              </div>
            </>
          )}

          {paso === 2 && (
            <>
              <Capibara animo="celebrando" tamano={104} mirarPuntero={false} className="mx-auto block" />
              <h1 ref={titulo} id="titulo-bienvenida" tabIndex={-1} className={`mt-4 ${encabezadoPaso}`}>
                Tu primera práctica
              </h1>
              <p className="mt-2 text-center text-[17px] leading-snug">
                10 preguntas del núcleo común, la parte que presentan todos los aspirantes. Después de cada una ves la respuesta
                correcta y por qué.
              </p>
              <p className="mt-3 text-center font-tiza text-2xl font-bold text-secondary-light">Unos 10 minutos. ¡Tú puedes!</p>
              <div className="mt-auto space-y-1 pt-8">
                <Link href="/practica?modo=express_10&empezar=1" onClick={marcarVista} className={botonPrincipal}>
                  Empezar ahora
                </Link>
                <button type="button" onClick={cerrar} className={botonSecundario}>
                  Explorar la app primero
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
