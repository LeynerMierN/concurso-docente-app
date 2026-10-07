import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progreso",
  description: "Tu acierto por área, la evolución de tus simulacros y la proyección de tu puntaje frente al umbral de la CNSC.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
