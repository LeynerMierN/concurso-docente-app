/**
 * Datos oficiales y utilidades para el módulo "Conoce la Convocatoria" y "Calculadora Salarial"
 * Concurso Docente de Colombia - Decreto 1278
 */

export const CONVOCATORIA_DATA = {
  informacion_general: {
    nombre: "Concurso de Méritos Docentes y Directivos Docentes",
    entidades: [
      "Comisión Nacional del Servicio Civil (CNSC)",
      "Ministerio de Educación Nacional (MEN)"
    ],
    vacantes_estimadas: 30000,
    zonas: [
      {
        tipo: "Rural",
        descripcion: "Plazas en instituciones educativas de municipios y veredas priorizadas. Poseen listas de elegibles diferenciadas y criterios de contexto particular."
      },
      {
        tipo: "No Rural (Urbana)",
        descripcion: "Plazas en cabeceras municipales y grandes ciudades con régimen estándar de competencia."
      }
    ],
    costos_pin_simo: {
      profesional: 87550,
      normalista_tecnico: 58400,
      moneda: "COP",
      plataforma: "SIMO (Sistema de apoyo para la Igualdad, el Mérito y la Oportunidad)"
    }
  },

  reglas_examen: {
    duracion_horas: "4.5 a 5 horas continuas (o 2 sesiones de mañana y tarde según universidad operadora)",
    preguntas_promedio: "100 a 130 preguntas",
    formato: "Pruebas de Juicio Situacional (PJS) con 4 opciones de respuesta múltiple (A, B, C, D)",
    componentes: [
      {
        nombre: "Aptitudes y Competencias Básicas",
        caracter: "Eliminatorio",
        umbral_aprobatorio: {
          docente_aula: 60.0,
          directivo_docente: 70.0,
          escala_maxima: 100.0
        },
        descripcion: "Evalúa lectura crítica, razonamiento cuantitativo, componente pedagógico general y conocimientos de la especialidad. Si no se alcanza el puntaje mínimo, el aspirante queda excluido del concurso."
      },
      {
        nombre: "Prueba Psicotécnica / Comportamental",
        caracter: "Clasificatoria",
        umbral_aprobatorio: null,
        peso_porcentual: "10% a 15% del total ponderado",
        descripcion: "Evalúa actitudes, ética, liderazgo, trabajo en equipo y resolución de conflictos. No elimina al aspirante, pero suma puntos para la posición en la lista de elegibles."
      }
    ],
    fases_posteriores: [
      "Verificación de Requisitos Mínimos (VRM)",
      "Pruebas Escritas (Eliminatoria + Clasificatoria)",
      "Valoración de Antecedentes (Estudios y experiencia adicional)",
      "Entrevista (Aplica para directivos docentes)",
      "Publicación de Lista de Elegibles en firme",
      "Audiencia pública de escogencia de plaza en la Secretaría de Educación elegida"
    ]
  },

  requisitos_por_perfil: [
    {
      tipo: "Normalista Superior o Tecnólogo en Educación",
      grados_habilitados: ["Preescolar", "Básica Primaria"],
      requisito_titulacion: "Título expedido por Escuela Normal Superior acreditada o institución superior avalada.",
      ingreso_escalafon: "Grado 1, Nivel A"
    },
    {
      tipo: "Licenciado en Educación",
      grados_habilitados: ["Preescolar", "Primaria", "Secundaria y Media (en su especialidad)"],
      requisito_titulacion: "Título universitario de pregrado en Educación/Licenciatura afín a la plaza.",
      ingreso_escalafon: "Grado 2, Nivel A"
    },
    {
      tipo: "Profesional No Licenciado",
      grados_habilitados: ["Básica Secundaria y Media"],
      requisito_titulacion: "Título universitario profesional reconocido por el MEN afín al área (Matemáticas, Física, Lenguas, Ingeniería, etc.).",
      condicion_adicional: "Superar concurso y aprobar un curso o posgrado en pedagogía durante el periodo de prueba o los 2 primeros años de servicio.",
      ingreso_escalafon: "Grado 2, Nivel A"
    }
  ],

  escalafon_salarios_iniciales: [
    {
      id: "1A",
      grado: "Grado 1 - Nivel A",
      estudios: "Normalista Superior / Tecnólogo en Educación",
      posgrado: "Sin Posgrado",
      salario_mensual: 3047554
    },
    {
      id: "2A_base",
      grado: "Grado 2 - Nivel A",
      estudios: "Licenciado o Profesional No Licenciado",
      posgrado: "Sin Posgrado",
      salario_mensual: 3835560
    },
    {
      id: "2A_esp",
      grado: "Grado 2 - Nivel A (Esp)",
      estudios: "Licenciado o Profesional No Licenciado",
      posgrado: "Especialización",
      salario_mensual: 4168991
    },
    {
      id: "2A_msc",
      grado: "Grado 2 - Nivel A (Msc)",
      estudios: "Licenciado o Profesional No Licenciado",
      posgrado: "Maestría",
      salario_mensual: 4410891
    },
    {
      id: "2A_doc",
      grado: "Grado 2 - Nivel A (Doc)",
      estudios: "Licenciado o Profesional No Licenciado",
      posgrado: "Doctorado",
      salario_mensual: 4986223
    },
    {
      id: "3A_msc",
      grado: "Grado 3 - Nivel A (Msc)",
      estudios: "Licenciado o Profesional ingresando directo a Grado 3",
      posgrado: "Maestría acreditada de entrada",
      salario_mensual: 6419453
    },
    {
      id: "3A_doc",
      grado: "Grado 3 - Nivel A (Doc)",
      estudios: "Licenciado o Profesional ingresando directo a Grado 3",
      posgrado: "Doctorado acreditado de entrada",
      salario_mensual: 8515899
    }
  ],

  prestaciones_y_beneficios: [
    {
      nombre: "Prima de Servicios",
      pago: "Semestral (Julio)",
      calculo_formula: "15 días de asignación mensual (50%)",
      factor_multiplicador: 0.5,
      descripcion: "Reconocimiento económico de ley cancelado a mitad de año."
    },
    {
      nombre: "Prima de Navidad",
      pago: "Anual (Diciembre)",
      calculo_formula: "30 días de asignación mensual (100%)",
      factor_multiplicador: 1.0,
      descripcion: "Pago prestacional completo equivalente a un mes de salario."
    },
    {
      nombre: "Prima de Vacaciones",
      pago: "Anual (Noviembre)",
      calculo_formula: "15 días de asignación básica (50%)",
      factor_multiplicador: 0.5,
      descripcion: "Bono especial pagado previo al periodo de vacaciones de final de año."
    },
    {
      nombre: "Bonificación Pedagógica",
      pago: "Anual (al cumplir 1 año de servicio)",
      calculo_formula: "35% de la asignación mensual básica",
      factor_multiplicador: 0.35,
      descripcion: "Incentivo anual permanente conquistado para todos los docentes de planta oficial."
    },
    {
      nombre: "Cesantías e Intereses de Cesantías",
      pago: "Anual",
      calculo_formula: "1 mes de salario consignado al FOMAG + intereses directos",
      factor_multiplicador: 1.0,
      descripcion: "Fondo administrado por el Estado con estabilidad y sin pérdida en fondos privados."
    },
    {
      nombre: "Seguridad Social FOMAG",
      pago: "Permanente",
      calculo_formula: "Régimen especial exceptuado",
      factor_multiplicador: 0,
      descripcion: "Cobertura médica integral para el docente, cónyuge, hijos e inclusive padres en caso de dependencia económica."
    }
  ]
};

/**
 * Función utilitaria para calcular los ingresos mensuales y anuales
 * proyectados de un aspirante al ingresar al Magisterio.
 * 
 * @param {string} idEscalafon - Identificador del escalafón (ej. '2A_base', '2A_esp', '2A_msc')
 * @returns {object|null} Desglose completo de ingresos mensuales y anuales
 */
export function calcularIngresoAnualDocente(idEscalafon) {
  const escala = CONVOCATORIA_DATA.escalafon_salarios_iniciales.find(
    (item) => item.id === idEscalafon
  );

  if (!escala) return null;

  const salarioMensual = escala.salario_mensual;
  const salarioAnual12Meses = salarioMensual * 12;

  // Cálculos de prestaciones
  const primaServicios = salarioMensual * 0.5; // 15 días
  const primaNavidad = salarioMensual * 1.0;   // 30 días
  const primaVacaciones = salarioMensual * 0.5;// 15 días
  const bonificacionPedagogica = salarioMensual * 0.35; // 35% anual
  const cesantiasAnuales = salarioMensual * 1.0; // 1 mes de cesantías al FOMAG

  const totalPrestaciones =
    primaServicios +
    primaNavidad +
    primaVacaciones +
    bonificacionPedagogica +
    cesantiasAnuales;

  const ingresoTotalAnual = salarioAnual12Meses + totalPrestaciones;
  const promedioMensualEquivalente = Math.round(ingresoTotalAnual / 12);

  return {
    grado: escala.grado,
    estudios: escala.estudios,
    posgrado: escala.posgrado,
    salario_mensual: salarioMensual,
    total_12_salarios: salarioAnual12Meses,
    desglose_beneficios: {
      prima_servicios: Math.round(primaServicios),
      prima_navidad: Math.round(primaNavidad),
      prima_vacaciones: Math.round(primaVacaciones),
      bonificacion_pedagogica: Math.round(bonificacionPedagogica),
      cesantias_fomag: Math.round(cesantiasAnuales)
    },
    total_beneficios_adicionales: Math.round(totalPrestaciones),
    ingreso_total_anual_proyectado: Math.round(ingresoTotalAnual),
    promedio_mensual_real: promedioMensualEquivalente
  };
}