import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Práctica por áreas",
  description: "Practica preguntas de Juicio Situacional por área o tema, con retroalimentación inmediata y la norma que sustenta cada respuesta.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
