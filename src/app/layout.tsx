import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Bricolage_Grotesque, Caveat } from "next/font/google";
import BarraLateral from "@/components/BarraLateral";
import BarraNavegacion from "@/components/BarraNavegacion";
import { DESCRIPCION_SITIO, NOMBRE_SITIO, TITULO_SITIO, URL_SITIO } from "@/lib/sitio";
import "./globals.css";

// Lectura: Atkinson Hyperlegible distingue letras parecidas en los casos largos
const atkinson = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-atkinson" });
// Títulos
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-bricolage" });
// Notas a mano del profe y de Capi (solo frases cortas, nunca contenido de estudio)
const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-caveat" });

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITIO),
  title: { default: TITULO_SITIO, template: `%s | ${NOMBRE_SITIO}` },
  description: DESCRIPCION_SITIO,
  applicationName: NOMBRE_SITIO,
  keywords: [
    "concurso docente",
    "CNSC",
    "simulacro",
    "juicio situacional",
    "Decreto 1278",
    "prueba docente Colombia",
    "calculadora salarial docente",
  ],
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: NOMBRE_SITIO,
    title: TITULO_SITIO,
    description: DESCRIPCION_SITIO,
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO_SITIO,
    description: DESCRIPCION_SITIO,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: NOMBRE_SITIO,
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0D7A5F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${atkinson.variable} ${bricolage.variable} ${caveat.variable}`}>
      <body className="min-h-dvh font-sans antialiased">
        <BarraLateral />
        <div className="contenedor-app lg:pl-64">
          <main className="mx-auto max-w-md px-4 pt-6 pb-28 md:max-w-2xl lg:max-w-3xl lg:px-8 lg:pt-10 lg:pb-12">{children}</main>
        </div>
        <BarraNavegacion />
      </body>
    </html>
  );
}
