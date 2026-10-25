// Datos de navegación compartidos por el menú, la portada y el pie de página.
// Los enlaces llevan filtros en la URL para cuando el catálogo los use.

export const COLECCIONES = [
  { nombre: "De Gala", href: "/catalogo?coleccion=gala" },
  { nombre: "De XV", href: "/catalogo?coleccion=xv" },
  { nombre: "Cortos", href: "/catalogo?coleccion=cortos" },
  { nombre: "Floreados", href: "/catalogo?coleccion=floreados" },
];

export const ALQUILER = [
  { nombre: "De Gala", href: "/catalogo?modalidad=alquiler&coleccion=gala" },
  { nombre: "De XV", href: "/catalogo?modalidad=alquiler&coleccion=xv" },
];

export const COLORES = [
  { nombre: "Negro", hex: "#1d1a1b", href: "/catalogo?color=negro" },
  { nombre: "Vino", hex: "#6b1c2e", href: "/catalogo?color=vino" },
  { nombre: "Rojo", hex: "#a3243b", href: "/catalogo?color=rojo" },
  { nombre: "Esmeralda", hex: "#1f4d3d", href: "/catalogo?color=esmeralda" },
  { nombre: "Azul noche", hex: "#22305a", href: "/catalogo?color=azul-noche" },
  { nombre: "Champán", hex: "#d6bf94", href: "/catalogo?color=champan" },
  { nombre: "Rosa", hex: "#e6b4b2", href: "/catalogo?color=rosa" },
  { nombre: "Lila", hex: "#c3b1d9", href: "/catalogo?color=lila" },
  { nombre: "Celeste", hex: "#a9c6df", href: "/catalogo?color=celeste" },
];
