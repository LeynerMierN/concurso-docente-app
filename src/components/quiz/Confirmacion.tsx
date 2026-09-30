"use client";

import type { ReactNode } from "react";

interface Props {
  titulo: string;
  children?: ReactNode;
  textoConfirmar: string;
  peligro?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/** Hoja inferior de confirmación, pensada para pulgar en celular */
export default function Confirmacion({ titulo, children, textoConfirmar, peligro, onConfirmar, onCancelar }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 backdrop-blur-sm" onClick={onCancelar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        className="pb-safe w-full max-w-md space-y-4 rounded-t-3xl bg-white px-5 pt-5 shadow-2xl dark:bg-tarjeta"
      >
        <h2 className="text-lg font-bold">{titulo}</h2>
        {children && <div className="text-sm text-slate-600 dark:text-slate-300">{children}</div>}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 active:scale-[0.98] dark:bg-slate-700/60 dark:text-slate-200"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className={`rounded-2xl px-4 py-3 font-semibold text-white active:scale-[0.98] ${peligro ? "bg-error" : "bg-marca-600"}`}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
