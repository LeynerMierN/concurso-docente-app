import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Hay un pnpm-lock.yaml en el home del usuario; fijamos la raíz del proyecto.
  turbopack: { root: __dirname },
  // Rutas renombradas para seguir data/app_config.json; los enlaces viejos siguen funcionando.
  async redirects() {
    return [
      { source: "/simulacro", destination: "/simulacros", permanent: true },
      { source: "/fichas", destination: "/normatividad", permanent: true },
    ];
  },
};

export default nextConfig;
