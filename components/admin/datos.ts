import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { type Categoria, type FilaCategoria, SIN_CATEGORIA, armarCategorias, nombreDeCategoria } from "@/lib/categorias";
import { type Coleccion, ordenarColecciones } from "@/lib/colecciones";
import { type Producto, type Variante, leerJson } from "@/lib/productos";
import type { ResumenVariante } from "@/lib/variantes";
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

// El modelo existe en el cliente solo después de desplegar el backend con la tabla Category
export function tablaCategorias() {
  const tabla = clienteDatos.models.Category;
  if (!tabla) {
    throw new Error(
      "La tabla Category todavía no existe en el backend. Despliega los cambios de amplify/ (npx ampx sandbox o el pipeline de Amplify) y recarga la página.",
    );
  }
  return tabla;
}

// Todas, en orden, con las de siempre aunque no tengan fila. Un Scan a propósito: son pocas filas.
// Mientras la tabla no esté desplegada, los productos siguen con las de siempre; la página de
// Categorías, que la edita, pide `exigirTabla` para avisar que falta desplegar.
export async function cargarCategorias(exigirTabla = false): Promise<Categoria[]> {
  if (!clienteDatos.models.Category && !exigirTabla) return armarCategorias([]);
  const filas: FilaCategoria[] = [];
  let nextToken: string | null | undefined;
  do {
    const respuesta = await tablaCategorias().list({ limit: 100, nextToken });
    if (respuesta.errors?.length) throw new Error(mensajeErrorDatos(respuesta.errors));
    filas.push(...respuesta.data);
    nextToken = respuesta.nextToken;
  } while (nextToken);
  return armarCategorias(filas);
}

// Los productos de una categoría (su código) con un Query al índice listProductByCategory
async function productosDeCategoria(codigo: string) {
  const productos: Producto[] = [];
  let nextToken: string | null | undefined;
  do {
    const respuesta = await clienteDatos.models.Product.listProductByCategory({ category: codigo }, { limit: 100, nextToken });
    if (respuesta.errors?.length) throw new Error(mensajeErrorDatos(respuesta.errors));
    productos.push(...respuesta.data);
    nextToken = respuesta.nextToken;
  } while (nextToken);
  return productos;
}

// Todos los productos: un Query por categoría, en paralelo (nunca un Scan de la tabla), más el de
// los que todavía no tienen una
export async function cargarProductos(categorias: Categoria[]) {
  const codigos = [...categorias.map((c) => c.codigo), SIN_CATEGORIA];
  const productos = (await Promise.all(codigos.map(productosDeCategoria))).flat();
  return productos.sort((a, b) => a.name.localeCompare(b.name));
}

// Los nombres de los vestidos de esa categoría: mientras tenga alguno, no se puede eliminar
export async function productosEnCategoria(codigo: string) {
  const nombres: string[] = [];
  let nextToken: string | null | undefined;
  do {
    const respuesta = await clienteDatos.models.Product.listProductByCategory({ category: codigo }, { selectionSet: ["name"], limit: 100, nextToken });
    if (respuesta.errors?.length) throw new Error(mensajeErrorDatos(respuesta.errors));
    nombres.push(...respuesta.data.map((p) => p.name));
    nextToken = respuesta.nextToken;
  } while (nextToken);
  return nombres.sort((a, b) => a.localeCompare(b, "es"));
}

// `categoria`: el nombre de su categoría, para reconocerlo en la lista
export type OpcionProducto = { productId: string; nombre: string; categoria: string; conStock: boolean };

// Para elegir productos en el CMS y en las colecciones
export async function cargarOpcionesProducto(): Promise<OpcionProducto[]> {
  const categorias = await cargarCategorias();
  const productos = await cargarProductos(categorias);
  return productos.map((p) => ({
    productId: p.productId,
    nombre: p.name,
    categoria: nombreDeCategoria(p.category, categorias) || "Sin categoría",
    conStock: leerJson<ResumenVariante[]>(p.variantSummary, []).some((v) => v.inStock),
  }));
}

// El modelo existe en el cliente solo después de desplegar el backend con la tabla Collection
export function tablaColecciones() {
  const tabla = clienteDatos.models.Collection;
  if (!tabla) {
    throw new Error(
      "La tabla Collection todavía no existe en el backend. Despliega los cambios de amplify/ (npx ampx sandbox o el pipeline de Amplify) y recarga la página.",
    );
  }
  return tabla;
}

// Todas, publicadas o no. Un Scan a propósito: son pocas filas (lib/colecciones-servidor.ts)
export async function cargarColecciones() {
  const colecciones: Coleccion[] = [];
  let nextToken: string | null | undefined;
  do {
    const respuesta = await tablaColecciones().list({ limit: 100, nextToken });
    if (respuesta.errors?.length) throw new Error(mensajeErrorDatos(respuesta.errors));
    colecciones.push(...respuesta.data);
    nextToken = respuesta.nextToken;
  } while (nextToken);
  return ordenarColecciones(colecciones);
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
