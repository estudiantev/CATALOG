import type { Schema } from "@/amplify/data/resource";

// Tipos, listas fijas y etiquetas de Product y ProductVariant, compartidos por la tienda,
// el servidor y el panel

export type Producto = Schema["Product"]["type"];
export type Variante = Schema["ProductVariant"]["type"];
export type Talla = Schema["Size"]["type"];
export type FamiliaColor = Schema["ColorFamily"]["type"];
export type ImagenProducto = Schema["ProductImage"]["type"];

export const CATEGORIAS = [
  { valor: "DRESS", nombre: "Vestido", plural: "Vestidos", slug: "vestidos" },
  { valor: "JEWELRY", nombre: "Joya", plural: "Joyas", slug: "joyas" },
  { valor: "ACCESSORY", nombre: "Accesorio", plural: "Accesorios", slug: "accesorios" },
] as const;

export type Categoria = (typeof CATEGORIAS)[number]["valor"];

export const TALLAS = [
  { valor: "XXS", nombre: "XXS" },
  { valor: "XS", nombre: "XS" },
  { valor: "S", nombre: "S" },
  { valor: "M", nombre: "M" },
  { valor: "L", nombre: "L" },
  { valor: "XL", nombre: "XL" },
  { valor: "XXL", nombre: "XXL" },
  { valor: "ONE_SIZE", nombre: "Talla única" },
] satisfies { valor: Talla; nombre: string }[];

export const FAMILIAS_COLOR = [
  { valor: "BLACK", nombre: "Negro", muestra: "#1d1a1b" },
  { valor: "WHITE", nombre: "Blanco", muestra: "#ffffff" },
  { valor: "IVORY", nombre: "Marfil", muestra: "#f4efe1" },
  { valor: "NUDE", nombre: "Nude", muestra: "#e3c4a8" },
  { valor: "PINK", nombre: "Rosa", muestra: "#e6b4b2" },
  { valor: "RED", nombre: "Rojo", muestra: "#a3243b" },
  { valor: "BLUE", nombre: "Azul", muestra: "#22305a" },
  { valor: "GREEN", nombre: "Verde", muestra: "#1f4d3d" },
  { valor: "PURPLE", nombre: "Morado", muestra: "#c3b1d9" },
  { valor: "GOLD", nombre: "Dorado", muestra: "#d6bf94" },
  { valor: "SILVER", nombre: "Plateado", muestra: "#c0c0c0" },
  { valor: "MULTI", nombre: "Multicolor", muestra: "conic-gradient(#a3243b, #d6bf94, #1f4d3d, #22305a, #a3243b)" },
] satisfies { valor: FamiliaColor; nombre: string; muestra: string }[];

// Listas fijas: el panel solo deja elegir de aquí, así los filtros siempre coinciden
export const LARGOS = [
  { valor: "mini", nombre: "Mini" },
  { valor: "corto", nombre: "Corto" },
  { valor: "midi", nombre: "Midi" },
  { valor: "largo", nombre: "Largo" },
];

export const ESCOTES = [
  { valor: "corazon", nombre: "Corazón" },
  { valor: "v", nombre: "En V" },
  { valor: "redondo", nombre: "Redondo" },
  { valor: "cuadrado", nombre: "Cuadrado" },
  { valor: "strapless", nombre: "Strapless" },
  { valor: "halter", nombre: "Halter" },
  { valor: "hombros-descubiertos", nombre: "Hombros descubiertos" },
  { valor: "asimetrico", nombre: "Asimétrico" },
  { valor: "cuello-alto", nombre: "Cuello alto" },
];

export const MANGAS = [
  { valor: "sin-mangas", nombre: "Sin mangas" },
  { valor: "tirantes", nombre: "Tirantes" },
  { valor: "corta", nombre: "Manga corta" },
  { valor: "tres-cuartos", nombre: "Manga 3/4" },
  { valor: "larga", nombre: "Manga larga" },
  { valor: "globo", nombre: "Manga globo" },
];

export const SILUETAS = [
  { valor: "sirena", nombre: "Sirena" },
  { valor: "princesa", nombre: "Princesa" },
  { valor: "linea-a", nombre: "Línea A" },
  { valor: "recta", nombre: "Recta" },
  { valor: "imperio", nombre: "Corte imperio" },
  { valor: "ajustada", nombre: "Ajustada" },
];

// Las 6 opciones de una variante. El código las trata igual: si cambian el precio,
// las fotos o ambas cosas sale de los datos de cada variante.
export const CLAVES = ["talla", "largo", "escote", "manga", "silueta", "color"] as const;
export type Clave = (typeof CLAVES)[number];
export type Opciones = Partial<Record<Clave, string>>;
export type Filtros = Partial<Record<Clave, string[]>>; // { talla: ["M"], color: ["RED"] }

export const NOMBRES_CLAVE: Record<Clave, string> = {
  talla: "Talla",
  largo: "Largo",
  escote: "Escote",
  manga: "Manga",
  silueta: "Silueta",
  color: "Color",
};

export const VALORES_CLAVE: Record<Clave, readonly { valor: string; nombre: string }[]> = {
  talla: TALLAS,
  largo: LARGOS,
  escote: ESCOTES,
  manga: MANGAS,
  silueta: SILUETAS,
  color: FAMILIAS_COLOR,
};

export const nombreOpcion = (clave: Clave, valor: string) =>
  VALORES_CLAVE[clave].find((v) => v.valor === valor)?.nombre ?? valor;

// Ordena los valores según su lista fija; los desconocidos van al final
export const ordenarValores = (clave: Clave, valores: string[]) => {
  const orden = VALORES_CLAVE[clave].map((v) => v.valor);
  const posicion = (valor: string) => (orden.includes(valor) ? orden.indexOf(valor) : orden.length);
  return [...valores].sort((a, b) => posicion(a) - posicion(b) || a.localeCompare(b));
};

// "M · Midi · Rojo": la combinación en palabras, en el orden de CLAVES
export const describirOpciones = (opciones: Opciones) =>
  CLAVES.flatMap((clave) => (opciones[clave] ? [nombreOpcion(clave, opciones[clave])] : [])).join(" · ");

export function opcionesDeVariante(v: {
  size?: string | null;
  length?: string | null;
  neckline?: string | null;
  sleeve?: string | null;
  silhouette?: string | null;
  colorFamily?: string | null;
}): Opciones {
  const opciones = {
    talla: v.size,
    largo: v.length,
    escote: v.neckline,
    manga: v.sleeve,
    silueta: v.silhouette,
    color: v.colorFamily,
  };
  return Object.fromEntries(Object.entries(opciones).filter(([, valor]) => valor)) as Opciones;
}

// Los campos a.json() pueden llegar como texto o ya convertidos
export function leerJson<T>(valor: unknown, porDefecto: T): T {
  if (typeof valor === "string") {
    try {
      return JSON.parse(valor) as T;
    } catch {
      return porDefecto;
    }
  }
  return (valor as T | null | undefined) ?? porDefecto;
}

export const formatoSoles = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

// Carpeta de S3 de las fotos de un producto (debe estar dentro de "product-images/*",
// la ruta que autoriza amplify/storage/resource.ts)
export const carpetaImagenes = (productId: string) => `product-images/${productId}/`;
