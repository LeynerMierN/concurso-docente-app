import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Imagen de previsualización para WhatsApp, Facebook y X. Se genera una sola vez en el build.
// Estilo «Cuaderno de la esperanza»: papel cuadriculado, tinta azul, verde esperanza y resaltador.
export const alt = "Concurso Docente App: «Hola, profe.» Simulacros y práctica para la prueba escrita de la CNSC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TINTA = "#1E2A52";
const VERDE = "#0D7A5F";
const RESALTADOR = "#FFD447";

/** Descarga una fuente de Google solo con los glifos usados. Si no hay red, se usa la fuente por defecto. */
async function cargarFuente(familia: string, peso: number, texto: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${familia}:wght@${peso}&text=${encodeURIComponent(texto)}`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

const TITULO = "Hola, profe.";
const NOTA = "Cada pregunta de hoy es un paso hacia tu plaza.";
const SUBTITULO = "Simulacros y práctica para la prueba escrita de la CNSC";
const ETIQUETAS = ["Juicio situacional", "Simulacros 30/30/20/20", "Fichas de normas"];

export default async function Imagen() {
  const [icono, titulos, nota, cuerpo] = await Promise.all([
    readFile(join(process.cwd(), "public/icons/icon-512.png")),
    cargarFuente("Bricolage+Grotesque", 800, TITULO + SUBTITULO + ETIQUETAS.join("") + "Concurso Docente App"),
    cargarFuente("Caveat", 700, NOTA),
    cargarFuente("Atkinson+Hyperlegible", 700, SUBTITULO + ETIQUETAS.join("")),
  ]);
  const fuentes = [
    ...(titulos ? [{ name: "Bricolage", data: titulos, weight: 800 as const }] : []),
    ...(nota ? [{ name: "Caveat", data: nota, weight: 700 as const }] : []),
    ...(cuerpo ? [{ name: "Atkinson", data: cuerpo, weight: 700 as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          padding: "60px 72px 60px 120px",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#FDFCF7",
          backgroundImage: "linear-gradient(#E2EBE5 2px, transparent 2px), linear-gradient(90deg, #E2EBE5 2px, transparent 2px)",
          backgroundSize: "44px 44px",
          color: TINTA,
          fontFamily: titulos ? "Bricolage" : undefined,
        }}
      >
        {/* Línea de margen del cuaderno */}
        <div style={{ position: "absolute", left: 88, top: 0, bottom: 0, width: 4, background: "#E9A9C2" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img src={`data:image/png;base64,${icono.toString("base64")}`} width={84} height={84} alt="" style={{ borderRadius: 20 }} />
          <div style={{ fontSize: 34, fontWeight: 800 }}>Concurso Docente App</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 120, fontWeight: 800, lineHeight: 1, letterSpacing: -4 }}>{TITULO}</div>
          <div style={{ marginTop: 12, fontSize: 56, color: VERDE, fontFamily: nota ? "Caveat" : undefined }}>{NOTA}</div>
          <div style={{ marginTop: 18, fontSize: 32, color: "#515B7A", fontFamily: cuerpo ? "Atkinson" : undefined }}>{SUBTITULO}</div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {ETIQUETAS.map((etiqueta) => (
            <div
              key={etiqueta}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: "6px 18px 10px 4px",
                background: RESALTADOR,
                color: TINTA,
                fontSize: 26,
                fontWeight: 800,
              }}
            >
              {etiqueta}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: fuentes.length ? fuentes : undefined },
  );
}
