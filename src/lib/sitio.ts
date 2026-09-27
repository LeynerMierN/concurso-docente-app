/** Datos del sitio compartidos por los metadatos SEO y la imagen Open Graph */
export const TITULO_SITIO = "Simulacro Concurso Docente Colombia | Práctica y Calculadora Salarial";
export const DESCRIPCION_SITIO =
  "Prepárate para la prueba escrita de la CNSC con simulacros tipo Juicio Situacional, retroalimentación normativa y calculadora salarial del Decreto 1278.";
export const NOMBRE_SITIO = "Concurso Docente";

/**
 * URL pública del sitio, necesaria para que og:image sea una URL absoluta.
 * NEXT_PUBLIC_SITE_URL permite fijar un dominio propio; en Vercel se usa el dominio de producción.
 */
export const URL_SITIO =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : `http://localhost:${process.env.PORT ?? 3000}`);
