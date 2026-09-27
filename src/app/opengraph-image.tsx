import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Imagen de previsualización para WhatsApp, Facebook y X. Se genera una sola vez en el build.
export const alt = "Simulacro Concurso Docente Colombia: práctica tipo Juicio Situacional y calculadora salarial";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TEXTO = "Simulacro Concurso Docente ColombiaPrepárate para la prueba escrita de la CNSCJuicio SituacionalCalculadora salarial 1278Fichas normativas";

/** Descarga Inter solo con los glifos usados. Si no hay red, se usa la fuente por defecto. */
async function cargarInter(peso: number): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Inter:wght@${peso}&text=${encodeURIComponent(TEXTO)}`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function Imagen() {
  const [icono, negrita, normal] = await Promise.all([
    readFile(join(process.cwd(), "public/icons/icon-512.png")),
    cargarInter(800),
    cargarInter(500),
  ]);
  const fuentes = [
    ...(negrita ? [{ name: "Inter", data: negrita, weight: 800 as const }] : []),
    ...(normal ? [{ name: "Inter", data: normal, weight: 500 as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
          color: "white",
          fontFamily: fuentes.length ? "Inter" : undefined,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <img src={`data:image/png;base64,${icono.toString("base64")}`} width={96} height={96} alt="" />
          <div style={{ display: "flex", flexDirection: "column", width: 150, height: 36, borderRadius: 6, overflow: "hidden" }}>
            <div style={{ flex: 2, background: "#FCD116" }} />
            <div style={{ flex: 1, background: "#003893" }} />
            <div style={{ flex: 1, background: "#CE1126" }} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            Simulacro Concurso Docente Colombia
          </div>
          <div style={{ fontSize: 34, fontWeight: 500, color: "#dbe6ff" }}>Prepárate para la prueba escrita de la CNSC</div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {["Juicio Situacional", "Calculadora salarial 1278", "Fichas normativas"].map((etiqueta) => (
            <div
              key={etiqueta}
              style={{
                display: "flex",
                padding: "12px 24px",
                borderRadius: 999,
                background: "#FCD116",
                color: "#0f172a",
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
