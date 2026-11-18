import { unstable_cache } from "next/cache";
import { cache } from "react";
import { generateServerClientUsingReqRes } from "@aws-amplify/adapter-nextjs/data";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";
import { type FilaCategoria, armarCategorias } from "@/lib/categorias";

// Cliente de datos para el servidor: cada llamada recibe el contextSpec de runWithAmplifyServerContext
const clienteDatosServidor = generateServerClientUsingReqRes<Schema>({ config: outputs });

// La lista se lee de DynamoDB como mucho una vez cada 10 minutos. Al guardar, el panel invalida
// la caché con revalidateTag("categorias").
const CACHE_CATEGORIAS = 10 * 60;

const CAMPOS = ["code", "name", "plural", "slug", "inMenu", "position"] as const;

// Un Scan, como en Collection: son pocas filas y salen de la caché
const leerFilas = unstable_cache(
  async () =>
    runWithAmplifyServerContext({
      nextServerContext: null,
      operation: async (contextSpec) => {
        const filas: FilaCategoria[] = [];
        let nextToken: string | null | undefined;
        do {
          const respuesta = await clienteDatosServidor.models.Category.list(contextSpec, {
            authMode: "identityPool",
            selectionSet: CAMPOS,
            limit: 100,
            nextToken,
          });
          if (respuesta.errors?.length) throw new Error(respuesta.errors[0].message);
          filas.push(...respuesta.data);
          nextToken = respuesta.nextToken;
        } while (nextToken);
        return filas;
      },
    }),
  ["categorias-lista"],
  { revalidate: CACHE_CATEGORIAS, tags: ["categorias"] },
);

// Todas, en orden. Si la tabla no responde (o todavía no existe en el backend), la tienda sigue con
// las de siempre. cache() evita leerlas dos veces en la misma petición (layout y página).
export const leerCategorias = cache(async () => {
  const filas = await leerFilas().catch((error) => {
    console.error("No se pudieron leer las categorías:", error);
    return [];
  });
  return armarCategorias(filas);
});
