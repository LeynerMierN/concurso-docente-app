import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi perfil",
  description: "Tu rol, especialidad y contexto, tus puntos de experiencia y tus insignias.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
