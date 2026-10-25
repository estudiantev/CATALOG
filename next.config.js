/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Los componentes de shadcn importan de "radix-ui" (un paquete con todas las primitivas):
    // esto hace que solo se empaquete la primitiva que cada componente usa
    optimizePackageImports: ["radix-ui"],
  },
};

module.exports = nextConfig;
