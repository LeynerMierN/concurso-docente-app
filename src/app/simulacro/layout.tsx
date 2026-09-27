import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulacro cronometrado",
  description: "Simulacro tipo prueba CNSC con cronómetro, preguntas marcadas para revisar y resultado frente al umbral de 60/100.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
