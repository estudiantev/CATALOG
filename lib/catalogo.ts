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
  type Producto,
  type Talla,
  imagenPrincipal,
} from "@/lib/productos";

// Cliente de datos para el servidor: cada llamada recibe el contextSpec de runWithAmplifyServerContext
const clienteDatosServidor = generateServerClientUsingReqRes<Schema>({ config: outputs });

// Lo que la tienda necesita de cada producto (sin datos internos)
export type ProductoCatalogo = {
  productId: string;
  nombre: string;
  categoria: Categoria | null;
  // Texto donde busca el filtro: ocasión, silueta, etiquetas y descripción
  textoBusqueda: string;
  precioVenta: number;
  precioAlquiler: number;
  tallas: Talla[];
  familias: FamiliaColor[];
  imagen: { url: string; alt: string } | null;
};

// Todo lo que muestra la página de detalle
export type ProductoDetalle = {
  productId: string;
  nombre: string;
  categoria: Categoria | null;
  descripcion: string | null;
  ocasion: string | null;
  silueta: string | null;
  material: string | null;
  etiquetas: string[];
  precioVenta: number;
  precioAlquiler: number;
  tallas: Talla[];
  colores: { nombre: string; hex: string | null }[];
  imagenes: { url: string; alt: string }[];
};

// Las URLs de S3 son firmadas y vencen; las páginas se generan en cada visita
const VIGENCIA_URL = 60 * 60;

// URL firmada de una foto; null si no se pudo firmar
async function urlFirmada(contextSpec: AmplifyServer.ContextSpec, path: string) {
  try {
    const { url } = await getUrl(contextSpec, { path, options: { expiresIn: VIGENCIA_URL } });
    return url.toString();
  } catch {
    return null;
  }
}

// Lee el catálogo como visitante, sin la sesión de quien lo mira: Product permite
// lectura a invitados y las fotos de product-images/* también (allow.guest).
export async function obtenerCatalogo(): Promise<ProductoCatalogo[]> {
  return runWithAmplifyServerContext({
    nextServerContext: null,
    operation: async (contextSpec) => {
      const productos: Producto[] = [];
      let nextToken: string | null | undefined;
      do {
        const respuesta = await clienteDatosServidor.models.Product.list(contextSpec, {
          authMode: "identityPool",
          limit: 100,
          nextToken,
        });
        if (respuesta.errors) throw new Error(respuesta.errors[0].message);
        productos.push(...respuesta.data);
        nextToken = respuesta.nextToken;
      } while (nextToken);

      // Los más nuevos primero
      productos.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      return Promise.all(
        productos.map(async (producto) => {
          const principal = imagenPrincipal(producto.imagenes);
          const url = principal ? await urlFirmada(contextSpec, principal.key) : null;
          const imagen = url ? { url, alt: principal?.alt || producto.name || "" } : null;
          return {
            productId: producto.productId,
            nombre: producto.name || "Sin nombre",
            categoria: producto.category ?? null,
            textoBusqueda: [producto.occasion, producto.silhouette, producto.description, ...(producto.tags ?? [])]
              .filter(Boolean)
              .join(" "),
            precioVenta: producto.priceSale,
            precioAlquiler: producto.priceRent,
            tallas: (producto.availableSizes ?? []).filter((t): t is Talla => t !== null),
            familias: (producto.colorFamilies ?? []).filter((f): f is FamiliaColor => f !== null),
            imagen,
          };
        }),
      );
    },
  });
}

// Lee un producto como visitante, con todas sus fotos: la principal primero y luego
// en su orden. cache() evita leerlo dos veces en la misma petición (metadata y página).
export const obtenerProducto = cache(async (productId: string): Promise<ProductoDetalle | null> => {
  return runWithAmplifyServerContext({
    nextServerContext: null,
    operation: async (contextSpec) => {
      const { data: producto, errors } = await clienteDatosServidor.models.Product.get(
        contextSpec,
        { productId },
        { authMode: "identityPool" },
      );
      if (errors) throw new Error(errors[0].message);
      if (!producto) return null;

      const principal = imagenPrincipal(producto.imagenes);
      const fotos = (producto.imagenes ?? [])
        .flatMap((imagen) => (imagen ? [imagen] : []))
        .sort((a, b) => Number(b === principal) - Number(a === principal) || (a.position ?? 0) - (b.position ?? 0));
      const imagenes = await Promise.all(
        fotos.map(async (foto) => ({ url: await urlFirmada(contextSpec, foto.key), alt: foto.alt || producto.name || "" })),
      );

      return {
        productId: producto.productId,
        nombre: producto.name || "Sin nombre",
        categoria: producto.category ?? null,
        descripcion: producto.description ?? null,
        ocasion: producto.occasion ?? null,
        silueta: producto.silhouette ?? null,
        material: producto.material ?? null,
        etiquetas: (producto.tags ?? []).filter((t): t is string => Boolean(t)),
        precioVenta: producto.priceSale,
        precioAlquiler: producto.priceRent,
        tallas: (producto.availableSizes ?? []).filter((t): t is Talla => t !== null),
        colores: (producto.availableColors ?? []).flatMap((c) => (c ? [{ nombre: c.name, hex: c.hex ?? null }] : [])),
        imagenes: imagenes.filter((imagen): imagen is { url: string; alt: string } => imagen.url !== null),
      };
    },
  });
});
