# Concurso Docente · App de preparación

Aplicación web (mobile-first, instalable como PWA) para entrenar el Concurso Docente en Colombia (Decreto 1278, CNSC/MEN).

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · lucide-react · canvas-confetti

## Módulos

| Ruta | Qué hace |
|---|---|
| `/` | Inicio con tu progreso: racha, acierto por área y últimos simulacros |
| `/practica` | Práctica libre por área o tema, con retroalimentación inmediata |
| `/simulacro` | Simulacro cronometrado (2 min por pregunta), banderas y revisión final |
| `/fichas` | Fichas normativas (DUA, PIAR, Ley 1620, SIEE, Ley 115, Decreto 1278) |
| `/convocatoria` | Reglas del examen, calculadora salarial y beneficios del magisterio |

El progreso se guarda en el `localStorage` del navegador; no hay backend ni cuentas.

## Arrancar en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Si ese puerto está ocupado, usa `PORT=3002 npm run dev`.

Otros comandos: `npm run build` (compilación de producción) y `npm run typecheck`.

## Despliegue

Se despliega en Vercel sin configuración adicional: todas las rutas son estáticas y no requiere variables de entorno.

## Estructura

```
data/                     ← banco de preguntas PJS, datos de la convocatoria y fichas (fuente de verdad)
public/                   ← manifest.json e íconos de la PWA
src/app/                  ← rutas
src/components/           ← quiz/, convocatoria/, fichas/, BarraNavegacion, TuProgreso
src/hooks/useQuizRunner   ← motor de examen (práctica y simulacro)
src/lib/                  ← preguntas, storage (progreso), convocatoria, fichas, celebrar
src/types/exam.ts         ← tipos del examen
```

Alias de importación: `@/…` → `src/…` y `@data/…` → `data/…`.
