"use client";

import { useEffect, useState } from "react";
import { Check, Heart, Quote, Share2, Shuffle, X } from "lucide-react";
import { FRASES, fraseDelDia, guardarFavoritas, leerFavoritas, otraFrase, type Frase } from "@/lib/frases";

/** Frase del día: se puede cambiar, guardar como favorita y compartir */
export default function FraseMotivadora() {
  // null hasta montar: la fecha local solo se conoce en el cliente
  const [frase, setFrase] = useState<Frase | null>(null);
  const [esDelDia, setEsDelDia] = useState(true);
  const [favoritas, setFavoritas] = useState<string[]>([]);
  const [verFavoritas, setVerFavoritas] = useState(false);
  const [compartida, setCompartida] = useState<"copiada" | "fallo" | null>(null);

  useEffect(() => {
    setFrase(fraseDelDia());
    setFavoritas(leerFavoritas());
  }, []);

  useEffect(() => {
    if (compartida !== "copiada") return;
    const t = setTimeout(() => setCompartida(null), 2000);
    return () => clearTimeout(t);
  }, [compartida]);

  if (!frase) return <div className="h-44 motion-safe:animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-700/60" aria-hidden />;

  const esFavorita = favoritas.includes(frase.id);

  const actualizarFavoritas = (ids: string[]) => {
    setFavoritas(ids);
    guardarFavoritas(ids);
    if (ids.length === 0) setVerFavoritas(false);
  };

  const textoCompartir = `«${frase.texto}» — Concurso Docente App`;

  const compartir = async () => {
    const url = window.location.origin;
    if (navigator.share) {
      // Si el usuario cierra el menú de compartir no hay nada más que hacer
      await navigator.share({ text: textoCompartir, url }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(`${textoCompartir} ${url}`);
      setCompartida("copiada");
    } catch {
      // Portapapeles bloqueado (permisos o navegador): ofrecemos WhatsApp como alternativa
      setCompartida("fallo");
    }
  };

  const boton =
    "flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2.5 text-sm font-semibold transition active:scale-95";

  return (
    <section
      aria-labelledby="titulo-frase"
      className="relative overflow-hidden rounded-3xl bg-verde-suave p-5"
    >
      <Quote className="pointer-events-none absolute -top-2 -right-2 size-24 rotate-180 text-secondary-light opacity-15" aria-hidden />
      <h2 id="titulo-frase" className="text-xs font-bold uppercase tracking-wide text-primary-dark dark:text-secondary-light">
        {esDelDia ? "Frase del día" : "Otra frase para ti"}
      </h2>

      {/* La clave reinicia la animación de entrada en cada frase nueva */}
      <p key={frase.id} aria-live="polite" className="frase-entrar mt-2 min-h-20 font-heading text-lg font-bold leading-snug md:text-xl">
        {frase.texto}
      </p>

      <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2">
        <button
          type="button"
          onClick={() => {
            setFrase(otraFrase(frase.id));
            setEsDelDia(false);
          }}
          className={`${boton} bg-primary text-white`}
        >
          <Shuffle className="size-4" /> Otra frase
        </button>
        <button
          type="button"
          onClick={() => actualizarFavoritas(esFavorita ? favoritas.filter((id) => id !== frase.id) : [...favoritas, frase.id])}
          aria-pressed={esFavorita}
          aria-label={esFavorita ? "Quitar de favoritas" : "Guardar en favoritas"}
          className={`${boton} bg-tarjeta ring-1 ring-slate-200 dark:ring-slate-700`}
        >
          <Heart key={String(esFavorita)} className={`size-5 ${esFavorita ? "corazon-latir text-danger-light" : ""}`} fill={esFavorita ? "currentColor" : "none"} />
        </button>
        <button type="button" onClick={compartir} aria-label="Compartir frase" className={`${boton} bg-tarjeta ring-1 ring-slate-200 dark:ring-slate-700`}>
          {compartida === "copiada" ? <Check className="size-5" /> : <Share2 className="size-5" />}
        </button>
      </div>
      {compartida === "copiada" && (
        <p role="status" className="mt-2 text-center text-xs font-semibold">
          Frase copiada: pégala donde quieras compartirla.
        </p>
      )}
      {compartida === "fallo" && (
        <p role="status" className="mt-2 text-center text-xs font-semibold">
          No se pudo copiar.{" "}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${textoCompartir} ${window.location.origin}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setCompartida(null)}
            className="underline underline-offset-4"
          >
            Compartir por WhatsApp
          </a>
        </p>
      )}

      {favoritas.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setVerFavoritas((v) => !v)}
            aria-expanded={verFavoritas}
            className="text-xs font-semibold text-primary-dark underline underline-offset-4 dark:text-secondary-light"
          >
            {verFavoritas ? "Ocultar mis favoritas" : `Mis favoritas (${favoritas.length})`}
          </button>
          {verFavoritas && (
            <ul className="mt-2 space-y-2">
              {FRASES.filter((f) => favoritas.includes(f.id)).map((f) => (
                <li key={f.id} className="flex items-start gap-2 rounded-2xl bg-tarjeta/70 p-3 text-sm leading-snug">
                  <button
                    type="button"
                    onClick={() => {
                      setFrase(f);
                      setEsDelDia(false);
                    }}
                    className="flex-1 text-left"
                  >
                    {f.texto}
                  </button>
                  <button
                    type="button"
                    onClick={() => actualizarFavoritas(favoritas.filter((id) => id !== f.id))}
                    aria-label="Quitar de favoritas"
                    className="grid size-7 shrink-0 place-items-center rounded-full bg-slate-100 dark:bg-slate-700"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
