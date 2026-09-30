import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fichas normativas",
  description: "Repasa DUA, PIAR, situaciones Tipo I, II y III, Ruta de Atención Integral, SIEE, Ley 115 y Decreto 1278 con fichas de estudio.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
