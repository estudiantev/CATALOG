import type { FamiliaColor } from "@/lib/productos";

// Datos de navegación compartidos por el menú, la portada y el pie de página.
// Los enlaces llevan filtros en la URL que el catálogo usa como filtros iniciales.

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

export const COLORES: { nombre: string; hex: string; href: string; familia: FamiliaColor }[] = [
  { nombre: "Negro", hex: "#1d1a1b", href: "/catalogo?color=negro", familia: "BLACK" },
  { nombre: "Vino", hex: "#6b1c2e", href: "/catalogo?color=vino", familia: "RED" },
  { nombre: "Rojo", hex: "#a3243b", href: "/catalogo?color=rojo", familia: "RED" },
  { nombre: "Esmeralda", hex: "#1f4d3d", href: "/catalogo?color=esmeralda", familia: "GREEN" },
  { nombre: "Azul noche", hex: "#22305a", href: "/catalogo?color=azul-noche", familia: "BLUE" },
  { nombre: "Champán", hex: "#d6bf94", href: "/catalogo?color=champan", familia: "GOLD" },
  { nombre: "Rosa", hex: "#e6b4b2", href: "/catalogo?color=rosa", familia: "PINK" },
  { nombre: "Lila", hex: "#c3b1d9", href: "/catalogo?color=lila", familia: "PURPLE" },
  { nombre: "Celeste", hex: "#a9c6df", href: "/catalogo?color=celeste", familia: "BLUE" },
];
