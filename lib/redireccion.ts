// A dónde va la clienta después de iniciar sesión o registrarse.
// Lo usan el servidor (/login, /registro) y el navegador (formularios, Google, encabezado).

export const DESTINO_POR_DEFECTO = "/cuenta";

// Solo acepta rutas internas: así nadie puede armar un enlace
// /login?siguiente=https://otro-sitio que lleve a la clienta fuera de la tienda.
export function destinoSeguro(valor: unknown): string {
  if (typeof valor !== "string") return DESTINO_POR_DEFECTO;
  // "//otro-sitio" y "/\otro-sitio" son URLs de otro dominio; el navegador borra tabs y saltos de línea
  if (!valor.startsWith("/") || valor.startsWith("//") || /[\s\\]/.test(valor)) return DESTINO_POR_DEFECTO;
  // Volver a la portada, al login o al registro no muestra que la sesión empezó
  if (valor === "/" || /^\/(login|registro)(?=[/?#]|$)/.test(valor)) return DESTINO_POR_DEFECTO;
  return valor;
}

// Enlace a /login o /registro que recuerda a dónde volver (sin ?siguiente= si es Mi cuenta)
export function enlaceCuenta(pagina: "/login" | "/registro", destino: string) {
  const seguro = destinoSeguro(destino);
  return seguro === DESTINO_POR_DEFECTO ? pagina : `${pagina}?siguiente=${encodeURIComponent(seguro)}`;
}
