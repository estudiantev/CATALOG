import { unstable_cache } from "next/cache";
import { cache } from "react";
import { generateServerClientUsingReqRes } from "@aws-amplify/adapter-nextjs/data";
import type { AmplifyServer } from "aws-amplify/adapter-core";
import { getUrl } from "aws-amplify/storage/server";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";
import {
  type Categoria,
  type FamiliaColor,
  type Opciones,
  type Talla,
  leerJson,
  opcionesDeVariante,
} from "@/lib/productos";
import { type ResumenVariante, fotosOrdenadas } from "@/lib/variantes";

// Cliente de datos para el servidor: cada llamada recibe el contextSpec de runWithAmplifyServerContext
const clienteDatosServidor = generateServerClientUsingReqRes<Schema>({ config: outputs });

export type Foto = { url: string; alt: string };

export type VarianteCatalogo = {
  variantId: string;
  opciones: Opciones;
  precioVenta: number;
  precioAlquiler: number;
  enStock: boolean;
  portada: Foto | null;
  hover: Foto | null;
};

export type ProductoCatalogo = {
  productId: string;
  nombre: string;
  categoria: string;
  textoBusqueda: string;
  ocasion: string | null;
  marca: string | null;
  disenador: string | null;
  caracteristicas: string[];
  precioVenta: number; // "desde" sin filtros
  precioAlquiler: number;
  // Para armar el panel de filtros
  tallas: Talla[];
  largos: string[];
  escotes: string[];
  mangas: string[];
  siluetas: string[];
  familias: FamiliaColor[];
  variantes: VarianteCatalogo[];
};

export type VarianteDetalle = {
  variantId: string;
  opciones: Opciones;
  precioVenta: number;
  precioAlquiler: number;
  stock: number;
  enStock: boolean;
  sku: string | null;
  colorNombre: string | null;
  colorHex: string | null;
  fotos: { url: string; miniatura: string; alt: string }[];
};

export type ProductoDetalle = {
  productId: string;
  nombre: string;
  categoria: string;
  descripcion: string | null;
  marca: string | null;
  disenador: string | null;
  ocasion: string | null;
  material: string | null;
  caracteristicas: string[];
  variantes: VarianteDetalle[];
};

// Las URLs firmadas duran 1 hora y se generan en cada visita, así nunca llegan vencidas
const VIGENCIA_URL = 60 * 60;
// Los datos del catálogo se leen de DynamoDB como mucho una vez cada 10 minutos por categoría
const CACHE_CATALOGO = 10 * 60;

function sinNulos<T>(xs?: (T | null)[] | null): T[] {
  return (xs ?? []).filter((x): x is T => x !== null);
}

// Firma rutas de S3 una sola vez por carga, aunque varias variantes compartan fotos
function firmador(contextSpec: AmplifyServer.ContextSpec) {
  const firmas = new Map<string, Promise<string | null>>();
  return (path: string) => {
    if (!firmas.has(path)) {
      firmas.set(
        path,
        getUrl(contextSpec, { path, options: { expiresIn: VIGENCIA_URL } })
          .then(({ url }) => url.toString())
          .catch(() => null),
      );
    }
    return firmas.get(path)!;
  };
}

const CAMPOS_CATALOGO = [
  "productId",
  "name",
  "category",
  "description",
  "brand",
  "designer",
  "occasion",
  "tags",
  "priceSale",
  "priceRent",
  "availableSizes",
  "availableLengths",
  "availableNecklines",
  "availableSleeves",
  "availableSilhouettes",
  "colorFamilies",
  "variantSummary",
  "createdAt",
] as const;

// AP-01: Query al índice por categoría (nunca un Scan). Solo los datos van a la caché;
// las URLs se firman en cada visita. revalidateTag("catalogo") la invalida desde el panel.
const leerProductosDeCategoria = unstable_cache(
  async (categoria: Categoria) =>
    runWithAmplifyServerContext({
      nextServerContext: null,
      operation: async (contextSpec) => {
        const productos = [];
        let nextToken: string | null | undefined;
        do {
          const respuesta = await clienteDatosServidor.models.Product.listProductByCategory(
            contextSpec,
            { category: categoria },
            { authMode: "identityPool", selectionSet: CAMPOS_CATALOGO, limit: 100, nextToken },
          );
          if (respuesta.errors?.length) {
            // Un producto con datos inválidos no debe tumbar todo el catálogo
            if (!respuesta.data?.length) throw new Error(respuesta.errors[0].message);
            console.error("Productos con errores en el catálogo:", respuesta.errors);
          }
          productos.push(...(respuesta.data ?? []).filter((p) => p !== null));
          nextToken = respuesta.nextToken;
        } while (nextToken);
        // Los más nuevos primero
        return productos.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      },
    }),
  ["catalogo"],
  { revalidate: CACHE_CATALOGO, tags: ["catalogo"] },
);

// Lee el catálogo de una categoría como visitante: Product permite lectura a invitados
// y las fotos de product-images/* también (allow.guest)
export async function leerCatalogo(categoria: Categoria): Promise<ProductoCatalogo[]> {
  const productos = await leerProductosDeCategoria(categoria);

  return runWithAmplifyServerContext({
    nextServerContext: null,
    operation: async (contextSpec) => {
      const firmar = firmador(contextSpec);
      const foto = async (key: string | null, alt: string): Promise<Foto | null> => {
        if (!key) return null;
        const url = await firmar(key);
        return url ? { url, alt } : null;
      };

      return Promise.all(
        productos.map(async (producto) => {
          const alt = producto.name || "";
          const resumen = leerJson<ResumenVariante[]>(producto.variantSummary, []);
          return {
            productId: producto.productId,
            nombre: producto.name || "Sin nombre",
            categoria: producto.category,
            textoBusqueda: [producto.occasion, producto.description, ...(producto.tags ?? []), ...(producto.availableSilhouettes ?? [])]
              .filter(Boolean)
              .join(" "),
            ocasion: producto.occasion ?? null,
            marca: producto.brand ?? null,
            disenador: producto.designer ?? null,
            caracteristicas: sinNulos(producto.tags),
            precioVenta: producto.priceSale,
            precioAlquiler: producto.priceRent,
            tallas: sinNulos(producto.availableSizes),
            largos: sinNulos(producto.availableLengths),
            escotes: sinNulos(producto.availableNecklines),
            mangas: sinNulos(producto.availableSleeves),
            siluetas: sinNulos(producto.availableSilhouettes),
            familias: sinNulos(producto.colorFamilies),
            variantes: await Promise.all(
              resumen.map(async (v) => ({
                variantId: v.variantId,
                opciones: v.options,
                precioVenta: v.priceSale,
                precioAlquiler: v.priceRent,
                enStock: v.inStock,
                portada: await foto(v.cover, alt),
                hover: await foto(v.hover, alt),
              })),
            ),
          };
        }),
      );
    },
  });
}

// AP-05: un producto con todas sus variantes y sus fotos grandes, leído como visitante.
// Get del producto y Query de sus variantes al índice por productId, en paralelo y paginando
// (la selección anidada "variants.*" solo traería las primeras 100).
// cache() evita leerlo dos veces en la misma petición (metadata y página).
export const obtenerProducto = cache(async (productId: string): Promise<ProductoDetalle | null> => {
  return runWithAmplifyServerContext({
    nextServerContext: null,
    operation: async (contextSpec) => {
      const leerVariantes = async () => {
        const variantes = [];
        let nextToken: string | null | undefined;
        do {
          const respuesta = await clienteDatosServidor.models.ProductVariant.listVariantsByProduct(
            contextSpec,
            { productId },
            { authMode: "identityPool", limit: 100, nextToken },
          );
          if (respuesta.errors?.length) throw new Error(respuesta.errors[0].message);
          variantes.push(...respuesta.data);
          nextToken = respuesta.nextToken;
        } while (nextToken);
        return variantes;
      };
      const [{ data: producto, errors }, todas] = await Promise.all([
        clienteDatosServidor.models.Product.get(
          contextSpec,
          { productId },
          {
            authMode: "identityPool",
            selectionSet: ["productId", "name", "category", "description", "brand", "designer", "occasion", "material", "tags"],
          },
        ),
        leerVariantes(),
      ]);
      if (errors?.length && !producto) throw new Error(errors[0].message);
      if (!producto) return null;

      const firmar = firmador(contextSpec);
      const alt = producto.name || "";
      const variantes = todas.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

      return {
        productId: producto.productId,
        nombre: producto.name || "Sin nombre",
        categoria: producto.category,
        descripcion: producto.description ?? null,
        marca: producto.brand ?? null,
        disenador: producto.designer ?? null,
        ocasion: producto.occasion ?? null,
        material: producto.material ?? null,
        caracteristicas: sinNulos(producto.tags),
        variantes: await Promise.all(
          variantes.map(async (v) => {
            const fotos = await Promise.all(
              fotosOrdenadas(v.images).map(async (f) => ({
                url: await firmar(f.key),
                miniatura: await firmar(f.thumbKey ?? f.key),
                alt: f.alt || alt,
              })),
            );
            return {
              variantId: v.id,
              opciones: opcionesDeVariante(v),
              precioVenta: v.priceSale,
              precioAlquiler: v.priceRent,
              stock: v.stock ?? 0,
              enStock: (v.stock ?? 0) > 0,
              sku: v.sku ?? null,
              colorNombre: v.colorName ?? null,
              colorHex: v.colorHex ?? null,
              fotos: fotos.flatMap((f) => (f.url ? [{ url: f.url, miniatura: f.miniatura ?? f.url, alt: f.alt }] : [])),
            };
          }),
        ),
      };
    },
  });
});
