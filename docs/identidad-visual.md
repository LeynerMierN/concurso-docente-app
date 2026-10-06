# Identidad visual: «Cuaderno de la esperanza»

Decidida el 6 de octubre de 2026 (opción A del lienzo «Identidad visual · Concurso Docente»:
https://claude.ai/artifact/TPrrGFeAwLryzGnmczaXUU). Esta guía es la fuente de verdad del estilo de la app.

## La idea

La app es el cuaderno cuadriculado donde el aspirante se prepara: tinta azul, resaltador amarillo,
la corrección amable de un buen profe y, al final, el sello de «APROBADO». Es cálida y cercana,
y transmite esperanza: para muchos colombianos este examen es la puerta a la estabilidad.

Al usuario se le habla como al docente que ya es: **«Hola, profe.»**

## Principios

1. **El color fuerte se gana.** Verde y amarillo se reservan para avanzar, acertar y lograr. Las superficies son papel y tinta.
2. **Sin rojo de alarma.** Los errores van en **mora** (#9A2257), con ícono y una frase que enseña («Casi. La clave está en la B»). Nunca rojo puro, nunca «¡Incorrecto!».
3. **Pantalla de pregunta en calma.** Durante un examen: sin barra de navegación, sin decoración (sin cuadrícula), letra de lectura de 17 px con interlineado 1,6. El color aparece solo en la retroalimentación.
4. **Mostrar lo que falta, no lo que se hizo.** «Te faltan 6 preguntas, unos 8 minutos», «Termina la tarea y llegas a 4», «Te faltan 180 puntos para Licenciatura».
5. **Celebrar con medida.** El sello, el confeti y la premiación aparecen en momentos ganados (aprobar, subir de nivel), no en cada clic: una sorpresa pesa más que una rutina.
6. **Accesible siempre.** Texto ≥ 4,5:1 de contraste. Acierto y error se distinguen por luminosidad + ícono (✓ / ✕) + etiqueta, nunca solo por color (≈ 8 % de los hombres no distingue rojo de verde). Animaciones solo con `prefers-reduced-motion: no-preference`.

## Paleta

| Nombre | Claro | Oscuro | Uso |
|---|---|---|---|
| Papel (fondo) | `#FDFCF7` | `#121A33` | Fondo de la app |
| Tarjeta | `#FFFFFF` | `#1F2950` | Tarjetas |
| Tinta (texto) | `#1E2A52` | `#ECEFF7` | Texto y títulos (reemplaza al negro) |
| Tinta suave | `#515B7A` | `#AEB6CF` | Texto secundario |
| Verde esperanza | `#0D7A5F` | `#0D7A5F` (botón) / `#5FD0A8` (texto) | Botones principales, aciertos, avance |
| Verde profundo | `#0A5A46` | `#5FD0A8` | Texto verde sobre fondos claros |
| Verde suave | `#E3F3EC` | `#163B33` | Superficies de ánimo (proyección, acierto) |
| Resaltador | `#FFD447` | `#FFD447` | Logros, metas, lo importante. Texto encima siempre en tinta |
| Resaltador suave | `#FFF6CC` | `#3A3416` | Fondo de puntos de mérito, «hoy» |
| Mora | `#9A2257` | `#F29BC0` (texto) | Errores y «para reforzar» |
| Mora suave | `#FBE8EF` | `#3A1B2C` | Fondo de la respuesta equivocada |
| Cuadrícula | `#E2EBE5` | `rgb(255 255 255 / 0.05)` | Líneas del papel cuadriculado |
| Margen | `#E9A9C2` | `rgb(233 169 194 / 0.35)` | Línea de margen del cuaderno |
| Tablero | `#23483B`, marco `#8B5E3C` | igual | Donde escribe Capi |

Contrastes verificados (WCAG): tinta/papel 13,6 · tinta suave/papel 6,5 · blanco/verde 5,3 · mora/mora suave 6,5 ·
tinta/resaltador 9,8 · texto oscuro/fondo oscuro 15,0 · verde texto oscuro/tarjeta oscura 7,9.

## Tipografía

- **Títulos:** Bricolage Grotesque, 800 (700 en subtítulos). Interletrado -0,02em en tamaños grandes.
- **Lectura y cuerpo:** Atkinson Hyperlegible, 400 y 700. Diseñada para distinguir letras parecidas: ideal para los casos largos. Casos y opciones a 16–17 px, interlineado 1,55–1,6.
- **Notas a mano (del profe y de Capi):** Caveat, 600–700. Solo frases cortas de ánimo, nunca contenido que haya que estudiar.

Las tres están en `next/font/google`: `Bricolage_Grotesque`, `Atkinson_Hyperlegible`, `Caveat`.
Se retiran Inter y Plus Jakarta Sans.

## Elementos de firma

- **Papel cuadriculado** (`.cuadricula`): solo en encabezados del inicio y de resultados. Nunca detrás de texto de estudio.
- **Línea de margen** (`.margen-cuaderno`): vertical, rosada, a la izquierda de los encabezados y del bloque «El caso».
- **Resaltador:** barras de progreso amarillas con un borde ligeramente irregular (`border-radius: 3px 10px 6px 2px`); subrayado de resaltador bajo el ítem activo de la navegación y bajo la «pista para el examen».
- **Chulitos a mano:** en «Constancia», cada día cumplido es un ✓ dibujado (SVG con trazo curvo), no una casilla genérica. El día de hoy pendiente: borde punteado verde sobre resaltador suave.
- **Sello «APROBADO»:** círculo de tinta verde, doble aro (sólido + punteado), rotado -12°, con «CONCURSO DOCENTE» y la fecha. Es el momento estrella de Resultados (reemplaza el degradado esmeralda). Si no aprobó: sin sello; el puntaje, lo que faltó y «Repasar mis errores».
- **Tablero de Capi:** fondo `tablero`, marco de madera de 6 px, texto en Caveat color tiza `#F3F1E6`, botón con borde resaltador.
- **Sin degradados decorativos.** Todo color plano.

## Voz y textos

- Saludo: «Hola, profe.» + frase a mano: «Cada pregunta de hoy es un paso hacia tu plaza.»
- Error: título «Casi. La clave está en la {letra}», nota a mano «Esta trampa es de las más comunes.» (cuando aplique), justificación, «Para el examen: …» resaltado y la norma como etiqueta.
- Resultado aprobado: sello + «¡Así se gana una plaza! Hoy demostraste que puedes.»
- Área débil: «Tu próxima meta: subir N puntos aquí.» (no «reprobado», no «débil»).
- Mantener el vocabulario existente: puntos de mérito, niveles de formación, Constancia, Tarea de hoy, excusa justificada, distinciones.

## La mascota: Capi

El capibara se llama **Capi** (antes Sabino). Mismo dibujo; cambian el birrete a **tinta** (`#1E2A52`, borde `#141C3A`)
y la borla a **resaltador** (`#FFD447`). Ánimos: feliz (inicio), pensando (retroalimentación de error), celebrando (aprobado),
animando, durmiendo (estadísticas vacías). Se presenta: «¡Hola! Soy Capi y te acompaño en tu preparación.»

---

## Plan de migración para Claude Code

Hacerlo en este orden, con un commit por paso. Cambiar estilos y textos; no tocar lógica ni `data/` (salvo `ui_theme` en el paso 9).

### 1. Tokens en `src/app/globals.css`

Reemplazar los valores del bloque `@theme` (los nombres de token se conservan, así todo lo que usa `primary`, `secondary`,
`accent`, `danger`, `marca-*`, `exito`, `error` cambia solo):

```css
@theme {
  /* Verde esperanza: botones, aciertos, avance */
  --color-primary-light: var(--verde-texto);   /* #0F8467 claro · #5FD0A8 oscuro */
  --color-primary: #0D7A5F;
  --color-primary-dark: #0A5A46;
  --color-secondary-light: var(--verde-texto);
  --color-secondary: #0D7A5F;
  --color-secondary-dark: #0A5A46;
  /* Resaltador: logros. OJO: nunca como color de texto; para texto usar accent-dark */
  --color-accent-light: #FFE58A;
  --color-accent: #FFD447;
  --color-accent-dark: var(--resaltador-texto); /* #8A6500 claro · #FFD447 oscuro */
  /* Mora: errores */
  --color-danger-light: var(--mora-texto);      /* #C2457E claro · #F29BC0 oscuro */
  --color-danger: #9A2257;
  --color-danger-dark: #7A1A45;

  --color-fondo: var(--fondo);
  --color-tarjeta: var(--tarjeta);
  --color-texto: var(--texto);
  --color-texto-secundario: var(--texto-secundario);
  --color-texto-tenue: var(--texto-tenue);

  /* Cuaderno */
  --color-tinta: #1E2A52;
  --color-papel: #FDFCF7;
  --color-resaltador: #FFD447;
  --color-resaltador-suave: var(--resaltador-suave);
  --color-verde-suave: var(--verde-suave);
  --color-mora: #9A2257;
  --color-mora-suave: var(--mora-suave);
  --color-tablero: #23483B;
  --color-tablero-marco: #8B5E3C;
  --color-tiza: #F3F1E6;

  /* Alias heredados */
  --color-marca-50: #EAF6F1;
  --color-marca-100: #D3EDE3;
  --color-marca-500: var(--color-primary-light);
  --color-marca-600: var(--color-primary);
  --color-marca-700: var(--color-primary-dark);
  --color-exito: var(--color-secondary);
  --color-error: var(--color-danger);
  --color-oro: #FCD116; /* amarillo de la bandera: solo confeti y premios */

  /* Neutros: la escala slate se tiñe de tinta azul (cambia las ~365 clases slate-* de una vez) */
  --color-slate-50: #F7F7F1;
  --color-slate-100: #F1F1EA;
  --color-slate-200: #DDE1E9;
  --color-slate-300: #C3C8D6;
  --color-slate-400: #6B7390;
  --color-slate-500: #5C6585;
  --color-slate-600: #4E5878;
  --color-slate-700: #283258;
  --color-slate-800: #1F2950;
  --color-slate-900: #1E2A52;
  --color-slate-950: #141C3A;

  --font-sans: var(--font-atkinson), "Atkinson Hyperlegible", system-ui, sans-serif;
  --font-heading: var(--font-bricolage), "Bricolage Grotesque", sans-serif;
  --font-tiza: var(--font-caveat), "Caveat", cursive;

  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
}

:root {
  --fondo: #FDFCF7;
  --tarjeta: #FFFFFF;
  --texto: #1E2A52;
  --texto-secundario: #515B7A;
  --texto-tenue: #5C6585;
  --verde-texto: #0F8467;
  --verde-suave: #E3F3EC;
  --resaltador-texto: #8A6500;
  --resaltador-suave: #FFF6CC;
  --mora-texto: #C2457E;
  --mora-suave: #FBE8EF;
  --cuadricula: #E2EBE5;
  --margen: #E9A9C2;
}

@media (prefers-color-scheme: dark) {
  :root {
    --fondo: #121A33;
    --tarjeta: #1F2950;
    --texto: #ECEFF7;
    --texto-secundario: #AEB6CF;
    --texto-tenue: #9AA3BF;
    --verde-texto: #5FD0A8;
    --verde-suave: #163B33;
    --resaltador-texto: #FFD447;
    --resaltador-suave: #3A3416;
    --mora-texto: #F29BC0;
    --mora-suave: #3A1B2C;
    --cuadricula: rgb(255 255 255 / 0.05);
    --margen: rgb(233 169 194 / 0.35);
  }
}
```

Y añadir las utilidades del cuaderno:

```css
@layer components {
  .cuadricula {
    background-color: var(--fondo);
    background-image: linear-gradient(var(--cuadricula) 1px, transparent 1px),
      linear-gradient(90deg, var(--cuadricula) 1px, transparent 1px);
    background-size: 22px 22px;
  }
  .margen-cuaderno { position: relative; padding-left: 1.125rem; }
  .margen-cuaderno::before {
    content: ""; position: absolute; left: 0; top: 0.25rem; bottom: 0.25rem;
    width: 2px; background: var(--margen);
  }
  .resaltado { background: linear-gradient(transparent 50%, #FFE58A 50%); padding: 0 0.15em; }
  .barra-resaltador { background: #FFD447; border-radius: 3px 10px 6px 2px; }
}
```

### 2. Revisar clases que con los tokens nuevos quedarían mal

- `text-accent` (amarillo como texto, ilegible): cambiar a `text-accent-dark`.
- `dark:text-slate-400`: cambiar a `dark:text-slate-300` (el 400 ahora es oscuro, pensado para texto sobre papel).
- Rojos sueltos: `text-red-*`, `rose-*` (QuizRunner, FraseMotivadora, Beneficios) → tokens `danger` / `mora-suave`; los corazones de favoritas pueden quedar en `danger-light`.
- `emerald-*` en Resultados → se reemplaza por el sello (paso 6).
- `text-marca-100` sobre el antiguo héroe azul → revisar al rediseñar el héroe (paso 5).
- Todos los `bg-gradient-*` (inicio, premium, frase del día, calculadora, fichas, perfil, Resultados) → color plano: `bg-primary` con texto blanco, `bg-verde-suave`, o `.cuadricula` en encabezados.

### 3. Tipografías en `src/app/layout.tsx`

```ts
import { Atkinson_Hyperlegible, Bricolage_Grotesque, Caveat } from "next/font/google";
const atkinson = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-atkinson" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-bricolage" });
const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-caveat" });
```

`h1–h3` siguen usando `font-heading` (ya está en `@layer base`); añadir `font-weight: 800` por defecto en h1–h2.
Actualizar `opengraph-image.tsx` para usar Bricolage y la paleta nueva (fondo cuadriculado papel, «Hola, profe.», verde y resaltador).

### 4. Capi (antes Sabino)

- Renombrar en toda la UI, `aria-label`, comentarios y `CLAUDE.md`: `MascotaInicio`, `Capibara`, `mascota.ts`
  («Soy Capi…», «Toca a Capi…»), `QuizRunner`, `AvisoFlotante`, `Resultados` («Capi: …»), `estadisticas/page.tsx`, `globals.css`, `layout.tsx`.
- En `Capibara.tsx`: `birrete: "#1E2A52"`, `birreteBorde: "#141C3A"`, `borla: "#FFD447"`.
- Buscar después con `grep -rn "Sabino" src CLAUDE.md` y que no quede ninguno.

### 5. Inicio (`src/app/page.tsx` y `components/dashboard/*`)

- Encabezado: `.cuadricula` + línea de margen, fecha, **«Hola, profe.»** (Bricolage 800, ~44 px) y la frase en Caveat verde
  «Cada pregunta de hoy es un paso hacia tu plaza.». Reemplaza la tarjeta azul con degradado; las estadísticas
  (296 preguntas, 13 fichas, 30.000 vacantes) pasan a una fila discreta o a la pantalla Concurso.
- Tarea de hoy: barra con `.barra-resaltador`, «Te faltan N preguntas, unos M minutos», botón verde «Continuar la tarea».
- Proyección (si hay simulacros): tarjeta `bg-verde-suave`, número grande, barra con marca en el umbral (60 o 70 según rol)
  y mensaje de esperanza concreto: por encima → «Ya estás por encima del puntaje para aprobar. Sostenlo hasta el día del examen.»;
  por debajo → «Te faltan N puntos para el umbral. Tus errores repasados son el camino más corto.»
- Constancia: casillas cuadradas con chulito a mano; hoy con borde punteado sobre `resaltador-suave`; «Termina la tarea de hoy y llegas a N».
- Tablero de Capi: como está, con los colores nuevos y el botón con borde resaltador.

### 6. Pregunta y resultados (`components/quiz/*`)

- **Modo enfoque:** mientras hay una sesión en curso, ocultar `BarraNavegacion` y `BarraLateral`
  (p. ej. un atributo `data-enfoque` en `<body>` que pone `QuizRunner` al montar y quita al desmontar, y `hidden` en las barras con ese atributo).
- Encabezado: cerrar (✕), «Pregunta N de M», guardar (marcador). Progreso en segmentos: hechos en verde, actual en resaltador.
- «El caso» con `.margen-cuaderno` y la palabra «El caso» en Caveat verde; texto 17 px / 1,6.
- Opciones: tarjeta blanca con letra en círculo. Respuesta equivocada: borde 2 px mora + `bg-mora-suave` + círculo mora con ✕ + etiqueta «Tu respuesta».
  Correcta: borde 2 px verde + `bg-verde-suave` + círculo verde con ✓ + «Respuesta correcta». Las demás en tinta suave.
- Retroalimentación: tarjeta con Capi pensando, título «Casi. La clave está en la {letra}» (o «¡Bien! Era la {letra}» al acertar),
  justificación, «Para el examen: …» con `.resaltado` cuando exista, y la norma como etiqueta verde con ícono `Scale`.
- **Resultados aprobado:** encabezado `.cuadricula`, puntaje enorme (Bricolage 800, ~108 px), «N correctas de M. Para aprobar necesitabas U.»,
  sello «APROBADO» (componente nuevo `components/premios/Sello.tsx`) que entra con un golpe corto (escala 1,3 → 1, rotación -20° → -12°, 250 ms;
  sin animación si se pidió reducir movimiento), Capi celebrando con nota en Caveat, tarjeta de puntos de mérito en `resaltador-suave`
  con la barra de nivel, áreas con barras verdes y la más baja en mora con «Tu próxima meta: subir N puntos aquí.», y el botón «Repasar mis N errores».
- **Resultados no aprobado:** sin sello ni confeti; mismo puntaje, «Te faltaron N puntos», el área a reforzar y «Repasar mis N errores». Tono de ánimo, nunca de castigo.
- El confeti sigue con los colores de la bandera; la ceremonia de `Premiacion` se conserva, recoloreada.

### 7. Navegación

`BarraNavegacion`: fondo papel, borde superior `slate-200`, ítem activo en verde profundo con la etiqueta subrayada con resaltador
(`.resaltado`). `BarraLateral`: mismo tratamiento.

### 8. Resto de pantallas

Fichas (`TarjetaFicha`): frente en papel cuadriculado con el concepto en Bricolage; reverso en `tablero` con letra tiza para la definición corta
y Atkinson para los puntos clave. Convocatoria, Estadísticas, Perfil, Premium: quitar degradados, usar tarjetas papel/blanco y los acentos de la paleta.

### 9. Marca fuera de la app

- `public/manifest.json`: `theme_color` `#0D7A5F`, `background_color` `#FDFCF7`.
- `layout.tsx` → `viewport.themeColor` igual.
- Regenerar los íconos de `public/icons/` y `apple-touch-icon.png`: Capi (cara + birrete tinta + borla resaltador) sobre papel cuadriculado o sobre verde esperanza.
- `data/app_config.json` → `ui_theme.color_palette`: actualizar a esta paleta (primary = Verde esperanza, secondary = Verde aciertos,
  accent = Resaltador, danger = Mora, background, card_bg, text) y `typography` a Bricolage Grotesque / Atkinson Hyperlegible.

### 10. Verificación

- `npx tsc --noEmit` y `npm run build` sin errores.
- Recorrer en el celular (o 375 px) Inicio, Práctica (acertar y fallar), Simulacro, Resultados (aprobado y no aprobado), Fichas, Convocatoria, Perfil,
  en modo claro y oscuro.
- Revisar contraste de cualquier combinación nueva (mínimo 4,5:1 para texto).
- Con «reducir movimiento» activado no debe moverse nada salvo lo que responde a un toque.
- `grep -rn "Sabino\|gradient\|emerald\|rose-\|red-" src` no debe devolver nada de UI.

## Qué no hacer

- No usar rojo para errores ni para urgencia.
- No poner la cuadrícula detrás de casos, preguntas o justificaciones.
- No usar Caveat para contenido de estudio ni para textos largos.
- No usar amarillo como color de texto sobre fondo claro.
- No añadir degradados, sombras grises iguales en todas las tarjetas ni animaciones de entrada en cada sección.
