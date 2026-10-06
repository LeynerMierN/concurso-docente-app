import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modo Premium",
  description: "Lo que incluirá el Modo Premium de Concurso Docente App.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
