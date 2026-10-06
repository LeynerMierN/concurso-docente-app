import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi perfil",
  description: "Tu rol, especialidad y contexto, tu nivel de mérito y tu vitrina de trofeos.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
