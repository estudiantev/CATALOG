import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
// Configura Amplify antes de crear el cliente
import "@/components/compartido/configurar-amplify";

// Cliente de AppSync con la sesión del usuario: AppSync aplica las reglas de cada grupo
export const clienteDatos = generateClient<Schema>();

export type Producto = Schema["Product"]["type"];
export type Categoria = NonNullable<Producto["category"]>;
export type Talla = NonNullable<NonNullable<Producto["availableSizes"]>[number]>;
export type ColorProducto = NonNullable<NonNullable<Producto["availableColors"]>[number]>;
export type FamiliaColor = ColorProducto["family"];

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

export const NOMBRES_GRUPO: Record<string, string> = {
  ADMIN: "Administración",
  INVENTORY: "Inventario",
  MARKETING: "Marketing",
};

export const formatoSoles = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

// Mensaje legible para los errores que devuelve AppSync
export function mensajeErrorDatos(errores: { message: string; errorType?: string }[] | undefined) {
  const error = errores?.[0];
  if (!error) return "Ocurrió un error inesperado.";
  if (/unauthorized|not authorized/i.test(`${error.errorType} ${error.message}`)) {
    return "Tu grupo no tiene permiso para esta acción.";
  }
  return error.message;
}
