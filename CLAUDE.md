# Concurso Docente · Contexto del proyecto

App web mobile-first (Next.js 15 App Router + TypeScript + Tailwind CSS v4 + lucide-react + canvas-confetti)
para que aspirantes se preparen y ganen el Concurso Docente en Colombia (Decreto 1278, CNSC/MEN).
Idioma de la interfaz y del código de dominio: español (es-CO).

## Estado actual
- Estructura base creada a mano (sin create-next-app). Dependencias instaladas; `npm run dev` y `tsc --noEmit` compilan sin errores (Next 15.5, React 19, Tailwind 4).
- El puerto 3000 suele estar ocupado por otra app del usuario; usar `PORT=3002 npm run dev`. `turbopack.root` fijado en `next.config.ts` porque hay un `pnpm-lock.yaml` en el home.
- Inicio (`src/app/page.tsx`): estadísticas del banco, banner de salarios, accesos a módulos, sección «Tu progreso» (`TuProgreso`) y chips de áreas.
- PWA: `public/manifest.json` + íconos en `public/icons/` y `public/apple-touch-icon.png` (generados con Pillow). Metadatos en `layout.tsx`; Next 15 los emite en streaming dentro de `<body>`, es normal. Sin service worker (no funciona sin conexión).
- `npm run build` compila sin advertencias; las 6 rutas son estáticas.
- `/practica` y `/simulacro` funcionales sobre el motor `useQuizRunner`.
- `/fichas` funcional: flashcards con giro 3D (Tailwind `transform-3d`/`backface-hidden`), filtro por categoría, ← → con teclado.
- `/convocatoria` funcional: pestañas Reglas / Salarios / Beneficios sincronizadas con el hash (`/convocatoria#salarios`, enlazado desde el banner del inicio).

## Datos (fuente de verdad, no editar sin pedirlo)
- `data/banco_preguntas_pjs_concurso_docente.json`: 42 preguntas PJS { id, area, tema, norma_referencia, contexto, pregunta, opciones[A-D], respuesta_correcta, justificacion }. Hay 13 áreas; algunas son variantes (p. ej. "Convivencia Escolar ..."), podría convenir agruparlas en macro-áreas.
- `data/fichas_normativas.json`: 8 fichas { id, categoria (Inclusión | Convivencia Escolar | Evaluación | Normativa General), concepto, sigla, pregunta_disparadora, definicion, norma, puntos_clave[], error_frecuente }. Contenido redactado por Claude a partir de las normas citadas: revisar antes de publicar.
- `data/convocatoria_info_y_calculadora.js`: `CONVOCATORIA_DATA` (requisitos, fases, escalafón, prestaciones) y `calcularIngresoAnualDocente(id)`.
- Alias: `@/*` → `src/*`, `@data/*` → `data/*`.

## Utilidades existentes
- `src/types/exam.ts`: Pregunta, FiltroExamen, RespuestaUsuario, ResultadoExamen, ConfigExamen, SesionExamen.
- `src/lib/preguntas.ts`: PREGUNTAS, obtenerPregunta, obtenerAreas, FILTROS_TEMATICOS (convivencia/inclusion/evaluacion/psicotecnica), filtrarPreguntas, armarExamen, calificar → ResultadoExamen (0–100; umbral 60 aula, 70 directivo), MINUTOS_POR_PREGUNTA = 2.
- `src/hooks/useQuizRunner.ts`: motor de examen; sesión en localStorage (`concurso-docente:practica` / `:simulacro`) con hora límite absoluta, banderas, navegación libre y cierre automático. Mezcla el orden de las opciones por sesión porque el banco está sesgado (29/42 correctas son B, ninguna D); las respuestas se guardan con el id original.
- `src/lib/storage.ts`: historial en localStorage (`concurso-docente:progreso`): intentos (máx. 300), días de estudio, total respondidas y estadística por pregunta. `registrarIntento` es idempotente por `${modo}-${inicioMs}` y lo llama `useQuizRunner` al terminar. `calcularRacha` (viva si estudió hoy o ayer).
- `macroArea(area)` en `preguntas.ts` agrupa las 13 variantes de área en 7 macro-áreas para el progreso.
- `src/components/quiz/`: QuizRunner, Resultados (confeti solo si terminó hace <10 s), Confirmacion, Cargando.
- `src/lib/convocatoria.ts`: reexporta datos + `formatoCOP`; tipa `calcularIngresoAnualDocente` con `IngresoAnualDocente` (el JSDoc del .js solo dice `object`). El total anual incluye cesantías (15,35 salarios; 14,35 en nómina).
- `src/components/convocatoria/`: PestanasConvocatoria, ReglasExamen, CalculadoraSalarial, Beneficios (estos beneficios extra —sin copagos, 7 semanas de vacaciones— están en el componente, no en data/).
- `src/lib/celebrar.ts`: `celebrarAprobacion()` confeti con colores de Colombia, llamarla al aprobar un simulacro.
- `src/lib/fichas.ts`: FICHAS, CATEGORIAS_FICHAS, fichasDe(categoria).
- `src/components/BarraNavegacion.tsx`: tab bar inferior fija, 5 pestañas en grid (Inicio, Práctica, Simulacro, Fichas, Convocatoria); «Convocatoria» ocupa justo el ancho a 375 px.

## Próximos pasos
- Rebalancear la letra de la respuesta correcta en el banco (29/42 son B, ninguna D).
- Service worker para uso sin conexión.
- Actualizar a Next 16 cuando convenga (vulnerabilidad de PostCSS embebido en Next 15).
