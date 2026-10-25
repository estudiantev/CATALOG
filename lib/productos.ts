import type { Schema } from "@/amplify/data/resource";

// Tipos y etiquetas del modelo Product, compartidos por la tienda y el panel

export type Producto = Schema["Product"]["type"];
export type Categoria = NonNullable<Producto["category"]>;
export type Talla = NonNullable<NonNullable<Producto["availableSizes"]>[number]>;
export type ColorProducto = NonNullable<NonNullable<Producto["availableColors"]>[number]>;
export type FamiliaColor = ColorProducto["family"];
export type ImagenProducto = NonNullable<NonNullable<Producto["imagenes"]>[number]>;

export const CATEGORIAS = [
  { valor: "DRESS", nombre: "Vestido" },
  { valor: "JEWELRY", nombre: "Joyería" },
  { valor: "ACCESSORY", nombre: "Accesorio" },
] satisfies { valor: Categoria; nombre: string }[];

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
  { valor: "BLACK", nombre: "Negro" },
  { valor: "WHITE", nombre: "Blanco" },
  { valor: "IVORY", nombre: "Marfil" },
  { valor: "NUDE", nombre: "Nude" },
  { valor: "PINK", nombre: "Rosa" },
  { valor: "RED", nombre: "Rojo" },
  { valor: "BLUE", nombre: "Azul" },
  { valor: "GREEN", nombre: "Verde" },
  { valor: "PURPLE", nombre: "Morado" },
  { valor: "GOLD", nombre: "Dorado" },
  { valor: "SILVER", nombre: "Plateado" },
  { valor: "MULTI", nombre: "Multicolor" },
] satisfies { valor: FamiliaColor; nombre: string }[];

export const formatoSoles = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

// Carpeta de S3 de las fotos de un producto (debe estar dentro de "product-images/*",
// la ruta que autoriza amplify/storage/resource.ts)
export const carpetaImagenes = (productId: string) => `product-images/${productId}/`;

// La foto marcada como principal o, si no hay, la primera según su posición
export function imagenPrincipal(imagenes: Producto["imagenes"]) {
  const validas = (imagenes ?? []).filter((imagen): imagen is ImagenProducto => imagen !== null);
  return (
    validas.find((imagen) => imagen.isPrimary) ??
    validas.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0] ??
    null
  );
}
