import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import BarraNavegacion from "@/components/BarraNavegacion";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Concurso Docente · Prepárate para ganar",
  description:
    "Entrena con preguntas de Juicio Situacional (PJS), simulacros y la información oficial del Concurso Docente en Colombia.",
  applicationName: "Concurso Docente",
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
    title: "Concurso Docente",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1e40af",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={inter.variable}>
      <body className="min-h-dvh font-sans antialiased">
        <main className="mx-auto max-w-md px-4 pt-6 pb-28">{children}</main>
        <BarraNavegacion />
      </body>
    </html>
  );
}
