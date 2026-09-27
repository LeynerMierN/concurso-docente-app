import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Hay un pnpm-lock.yaml en el home del usuario; fijamos la raíz del proyecto.
  turbopack: { root: __dirname },
};

export default nextConfig;
