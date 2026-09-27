"use client";

import { useMemo, useState } from "react";
import { Info, Sparkles, TrendingUp } from "lucide-react";
import { CONVOCATORIA_DATA, calcularIngresoAnualDocente, formatoCOP } from "@/lib/convocatoria";

const ESCALAFON = CONVOCATORIA_DATA.escalafon_salarios_iniciales;
const PRESTACIONES = CONVOCATORIA_DATA.prestaciones_y_beneficios;

/** Mes de pago según la fuente de datos, p. ej. "Semestral (Julio)" → "Julio" */
function mesDePago(nombre: string): string {
  const pago = PRESTACIONES.find((p) => p.nombre === nombre)?.pago ?? "";
  return pago.match(/\(([^)]+)\)/)?.[1] ?? pago;
}

const formatoFactor = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 });

function etiquetaCorta(item: (typeof ESCALAFON)[number]) {
  const grado = item.id.slice(0, 2);
  return item.posgrado.startsWith("Sin") ? `Grado ${grado}` : `Grado ${grado} + ${item.posgrado.split(" ")[0]}`;
}

export default function CalculadoraSalarial() {
  const [id, setId] = useState("2A_base");
  const calculo = useMemo(() => calcularIngresoAnualDocente(id), [id]);

  if (!calculo) return null;

  const d = calculo.desglose_beneficios;
  const s = calculo.salario_mensual;
  const factor = calculo.ingreso_total_anual_proyectado / s;
  const factorEfectivo = (calculo.ingreso_total_anual_proyectado - d.cesantias_fomag) / s;

  const prestaciones = [
    { nombre: "Prima de Servicios", valor: d.prima_servicios, detalle: `15 días · ${mesDePago("Prima de Servicios")}` },
    { nombre: "Prima de Navidad", valor: d.prima_navidad, detalle: `30 días · ${mesDePago("Prima de Navidad")}` },
    { nombre: "Prima de Vacaciones", valor: d.prima_vacaciones, detalle: `15 días · ${mesDePago("Prima de Vacaciones")}` },
    { nombre: "Bonificación Pedagógica", valor: d.bonificacion_pedagogica, detalle: "35% · anual" },
    { nombre: "Cesantías", valor: d.cesantias_fomag, detalle: "1 mes · consignadas al FOMAG" },
  ];

  // Composición del ingreso anual para la barra apilada
  const segmentos = [
    { etiqueta: "12 salarios", valor: calculo.total_12_salarios, color: "bg-marca-600" },
    { etiqueta: "Primas", valor: d.prima_servicios + d.prima_navidad + d.prima_vacaciones, color: "bg-oro" },
    { etiqueta: "Bonificación", valor: d.bonificacion_pedagogica, color: "bg-exito" },
    { etiqueta: "Cesantías", valor: d.cesantias_fomag, color: "bg-slate-400" },
  ];

  return (
    <div className="space-y-5">
      {/* Selector de escalafón */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tu nivel de estudios al ingresar</h2>
        <div role="radiogroup" aria-label="Grado en el escalafón" className="grid grid-cols-1 gap-2">
          {ESCALAFON.map((item) => {
            const activo = item.id === id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={activo}
                onClick={() => setId(item.id)}
                className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition active:scale-[0.99] ${
                  activo
                    ? "bg-marca-600 text-white shadow-md"
                    : "bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
                }`}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{etiquetaCorta(item)}</span>
                  <span className={`block truncate text-xs ${activo ? "text-marca-100" : "text-slate-500"}`}>
                    {item.estudios}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-bold tabular-nums">{formatoCOP.format(item.salario_mensual)}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Resultado */}
      <section aria-live="polite" className="space-y-3">
        <div className="rounded-3xl bg-gradient-to-br from-marca-600 to-marca-700 p-5 text-white shadow-lg">
          <p className="text-sm text-marca-100">
            {calculo.grado} · {calculo.posgrado}
          </p>
          <p className="mt-3 text-xs uppercase tracking-wide text-marca-100">Asignación básica mensual</p>
          <p className="text-3xl font-extrabold tabular-nums">{formatoCOP.format(s)}</p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-[11px] text-marca-100">Total anual proyectado</p>
              <p className="text-lg font-bold tabular-nums">{formatoCOP.format(calculo.ingreso_total_anual_proyectado)}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-[11px] text-marca-100">Promedio mensual real</p>
              <p className="text-lg font-bold tabular-nums">{formatoCOP.format(calculo.promedio_mensual_real)}</p>
            </div>
          </div>

          <p className="mt-4 flex items-center gap-2 rounded-2xl bg-oro px-3 py-2 text-sm font-semibold text-slate-900">
            <Sparkles className="size-4 shrink-0" />
            Equivale a {formatoFactor.format(factor)} salarios al año
          </p>
        </div>

        {/* Composición */}
        <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <h3 className="flex items-center gap-2 font-semibold">
            <TrendingUp className="size-5 text-marca-500 dark:text-oro" /> ¿De dónde sale el ingreso anual?
          </h3>
          <div className="mt-4 flex h-4 overflow-hidden rounded-full">
            {segmentos.map((seg) => (
              <div
                key={seg.etiqueta}
                className={`${seg.color} transition-all`}
                style={{ width: `${(seg.valor / calculo.ingreso_total_anual_proyectado) * 100}%` }}
                title={seg.etiqueta}
              />
            ))}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
            {segmentos.map((seg) => (
              <li key={seg.etiqueta} className="flex items-center gap-1.5">
                <span className={`size-2.5 rounded-full ${seg.color}`} /> {seg.etiqueta}
              </li>
            ))}
          </ul>

          <ul className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
            {prestaciones.map(({ nombre, valor, detalle }) => (
              <li key={nombre} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span>
                  <span className="block font-medium">{nombre}</span>
                  <span className="block text-xs text-slate-500">{detalle}</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums">{formatoCOP.format(valor)}</span>
              </li>
            ))}
            <li className="flex items-center justify-between gap-3 pt-3 text-sm font-bold">
              <span>Total prestaciones</span>
              <span className="tabular-nums text-exito">+{formatoCOP.format(calculo.total_beneficios_adicionales)}</span>
            </li>
          </ul>
        </div>

        <p className="flex gap-2 rounded-2xl bg-slate-100 p-3 text-xs leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
          <Info className="mt-0.5 size-4 shrink-0" />
          Valores brutos antes de aportes a salud y pensión. De los {formatoFactor.format(factor)} salarios, cerca de{" "}
          {formatoFactor.format(factorEfectivo)} se reciben en nómina; las cesantías se consignan al FOMAG. La bonificación
          pedagógica se paga al cumplir un año de servicio.
        </p>
      </section>
    </div>
  );
}
