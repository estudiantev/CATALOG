import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { CATEGORIAS, type Producto, type Variante } from "@/lib/productos";
// Configura Amplify antes de crear el cliente
import "@/components/compartido/configurar-amplify";

// Cliente de AppSync con la sesión del usuario: AppSync aplica las reglas de cada grupo
export const clienteDatos = generateClient<Schema>();

export const NOMBRES_GRUPO: Record<string, string> = {
  ADMIN: "Administración",
  INVENTORY: "Inventario",
  MARKETING: "Marketing",
};

// Mensaje legible para los errores que devuelve AppSync
export function mensajeErrorDatos(errores: { message: string; errorType?: string }[] | undefined) {
  const error = errores?.[0];
  if (!error) return "Ocurrió un error inesperado.";
  if (/unauthorized|not authorized/i.test(`${error.errorType} ${error.message}`)) {
    return "Tu grupo no tiene permiso para esta acción.";
  }
  return error.message;
}

// Todos los productos, consultando el índice de cada categoría (nunca un Scan de la tabla)
export async function cargarProductos() {
  const productos: Producto[] = [];
  for (const { valor } of CATEGORIAS) {
    let nextToken: string | null | undefined;
    do {
      const respuesta = await clienteDatos.models.Product.listProductByCategory({ category: valor }, { limit: 100, nextToken });
      if (respuesta.errors?.length) throw new Error(mensajeErrorDatos(respuesta.errors));
      productos.push(...respuesta.data);
      nextToken = respuesta.nextToken;
    } while (nextToken);
  }
  return productos.sort((a, b) => a.name.localeCompare(b.name));
}

// AP-09: un producto y todas sus variantes, en orden. Las variantes salen de un Query al
// índice por productId (el cargador producto.variants() haría un Scan de toda la tabla).
export async function cargarVariantes(productId: string) {
  const leerVariantes = async () => {
    const variantes: Variante[] = [];
    let nextToken: string | null | undefined;
    do {
      const respuesta = await clienteDatos.models.ProductVariant.listVariantsByProduct({ productId }, { limit: 100, nextToken });
      if (respuesta.errors?.length) throw new Error(mensajeErrorDatos(respuesta.errors));
      variantes.push(...respuesta.data);
      nextToken = respuesta.nextToken;
    } while (nextToken);
    return variantes;
  };
  const [{ data: producto, errors }, variantes] = await Promise.all([
    clienteDatos.models.Product.get({ productId }),
    leerVariantes(),
  ]);
  if (errors?.length) throw new Error(mensajeErrorDatos(errors));
  if (!producto) return null;
  return { producto, variantes: variantes.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)) };
}
