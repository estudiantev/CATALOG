import { generateServerClientUsingReqRes } from "@aws-amplify/adapter-nextjs/data";
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

// Las URLs de S3 son firmadas y vencen; la página se genera en cada visita
const VIGENCIA_URL = 60 * 60;

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
          let imagen: ProductoCatalogo["imagen"] = null;
          if (principal) {
            try {
              const { url } = await getUrl(contextSpec, {
                path: principal.key,
                options: { expiresIn: VIGENCIA_URL },
              });
              imagen = { url: url.toString(), alt: principal.alt || producto.name || "" };
            } catch {
              imagen = null;
            }
          }
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
