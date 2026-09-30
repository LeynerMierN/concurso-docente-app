# Concurso Docente · App de preparación

Aplicación web (mobile-first, instalable como PWA) para entrenar el Concurso Docente en Colombia (Decreto 1278, CNSC/MEN).

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · lucide-react · canvas-confetti

## Módulos

| Ruta | Qué hace |
|---|---|
| `/` | Dashboard: racha diaria (meta de 15 preguntas), modalidades de examen y recursos |
| `/practica` | Práctica guiada: libre, Entrenamiento Rápido (10) o Prueba por Competencia (20, pausable) |
| `/simulacros` | Simulacro Parcial y Simulacro Tipo ICFES/CNSC, cronometrados y sin feedback |
| `/normatividad` | 13 fichas normativas: DUA, PIAR, Tipo I/II/III, Ruta de Atención, Comité de Convivencia, SIEE, evaluación formativa, Ley 115, gobierno escolar, Decreto 1278 |
| `/estadisticas` | Mi rendimiento: acierto por área, evolución de simulacros y puntaje proyectado |
| `/convocatoria` | Reglas del examen, calculadora salarial y beneficios del magisterio |

Las rutas antiguas `/simulacro` y `/fichas` redirigen (308) a las nuevas.

La navegación, las modalidades de examen, la meta diaria y la paleta salen de `data/app_config.json`.

## Banco de preguntas

`data/banco_preguntas.json` se genera, no se edita a mano:

```bash
python3 scripts/importar_bancos.py
```

El script lee los archivos crudos de `data/fuentes/`, asigna la categoría de la taxonomía, aplica las correcciones revisadas y valida la estructura. Los simulacros se arman en el navegador desde el núcleo común con la distribución CNSC 30/30/20/20.

El progreso se guarda en el `localStorage` del navegador; no hay backend ni cuentas.

## Arrancar en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Si ese puerto está ocupado, usa `PORT=3002 npm run dev`.

Otros comandos: `npm run build` (compilación de producción) y `npm run typecheck`.

## Despliegue

Se despliega en Vercel sin configuración adicional: todas las rutas son estáticas. La URL absoluta de la imagen Open Graph se toma del dominio de producción de Vercel; si usas un dominio propio, define `NEXT_PUBLIC_SITE_URL` (p. ej. `https://midominio.co`).

## Estructura

```
data/                     ← banco de preguntas PJS, datos de la convocatoria y fichas (fuente de verdad)
public/                   ← manifest.json e íconos de la PWA
src/app/                  ← rutas
src/components/           ← quiz/, dashboard/, convocatoria/, fichas/, BarraLateral, BarraNavegacion
src/hooks/useQuizRunner   ← motor de examen (práctica y simulacro)
src/lib/                  ← appConfig, preguntas, storage, estadisticas, convocatoria, fichas, celebrar
src/types/exam.ts         ← tipos del examen
```

Alias de importación: `@/…` → `src/…` y `@data/…` → `data/…`.
