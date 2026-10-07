import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Estudiar",
  description: "Práctica rápida, práctica por tema, simulacros con tiempo, repaso de errores y fichas de normas para el Concurso Docente.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
