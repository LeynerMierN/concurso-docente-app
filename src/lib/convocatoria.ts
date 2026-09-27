// Reexporta la información oficial y la calculadora salarial desde la carpeta data/
import { calcularIngresoAnualDocente as calcularSinTipo } from "@data/convocatoria_info_y_calculadora.js";

export { CONVOCATORIA_DATA } from "@data/convocatoria_info_y_calculadora.js";

/** Forma del objeto que devuelve calcularIngresoAnualDocente (su JSDoc solo declara `object`) */
export interface IngresoAnualDocente {
  grado: string;
  estudios: string;
  posgrado: string;
  salario_mensual: number;
  total_12_salarios: number;
  desglose_beneficios: {
    prima_servicios: number;
    prima_navidad: number;
    prima_vacaciones: number;
    bonificacion_pedagogica: number;
    cesantias_fomag: number;
  };
  total_beneficios_adicionales: number;
  ingreso_total_anual_proyectado: number;
  promedio_mensual_real: number;
}

export const calcularIngresoAnualDocente = calcularSinTipo as (idEscalafon: string) => IngresoAnualDocente | null;

export const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
