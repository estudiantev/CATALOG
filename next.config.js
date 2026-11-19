/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Los componentes de shadcn importan de "radix-ui" (un paquete con todas las primitivas):
    // esto hace que solo se empaquete la primitiva que cada componente usa
    optimizePackageImports: ["radix-ui"],
  },
  // El catálogo era /catalogo: los enlaces viejos (los guardados en el contenido, los compartidos y
  // los de los buscadores) siguen funcionando. Los filtros de la URL (?talla=, ?color=…) se conservan.
  async redirects() {
    return [
      { source: "/catalogo", destination: "/vestidos", permanent: true },
      { source: "/catalogo/:productId", destination: "/vestidos/:productId", permanent: true },
    ];
  },
};

module.exports = nextConfig;
