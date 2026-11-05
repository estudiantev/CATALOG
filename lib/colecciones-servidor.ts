import { unstable_cache } from "next/cache";
import { cache } from "react";
import { generateServerClientUsingReqRes } from "@aws-amplify/adapter-nextjs/data";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";
import { leerProductosColeccion } from "@/lib/catalogo";
import {
  MAXIMO_COLECCIONES_MENU,
  coleccionVisible,
  idsDeColeccion,
  ordenarColecciones,
  rutaColeccion,
  slugValido,
} from "@/lib/colecciones";
import { firmarFoto } from "@/lib/contenido-servidor";

// Cliente de datos para el servidor: cada llamada recibe el contextSpec de runWithAmplifyServerContext
const clienteDatosServidor = generateServerClientUsingReqRes<Schema>({ config: outputs });

// El menú se lee de DynamoDB como mucho una vez cada 10 minutos. Al guardar, el panel invalida
// la caché con revalidateTag("colecciones").
const CACHE_COLECCIONES = 10 * 60;

const CAMPOS_MENU = ["title", "slug", "isPublished", "startsAt", "endsAt", "position"] as const;

// A diferencia de Product, aquí sí va un Scan: son pocas filas y se leen de la caché
const leerFilasMenu = unstable_cache(
  async () =>
    runWithAmplifyServerContext({
      nextServerContext: null,
      operation: async (contextSpec) => {
        const filas = [];
        let nextToken: string | null | undefined;
        do {
          const respuesta = await clienteDatosServidor.models.Collection.list(contextSpec, {
            authMode: "identityPool",
            selectionSet: CAMPOS_MENU,
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
  ["colecciones"],
  { revalidate: CACHE_COLECCIONES, tags: ["colecciones"] },
);

// Si la tabla no responde (o todavía no existe en el backend), el menú sigue sin ellas.
// La fecha se revisa fuera de la caché, para que cada colección aparezca y desaparezca a su hora.
export async function leerColeccionesMenu() {
  const filas = await leerFilasMenu().catch((error) => {
    console.error("No se pudieron leer las colecciones del menú:", error);
    return [];
  });
  return ordenarColecciones(filas.filter((c) => coleccionVisible(c)))
    .slice(0, MAXIMO_COLECCIONES_MENU)
    .map((c) => ({ nombre: c.title, href: rutaColeccion(c.slug) }));
}

// Query al índice bySlug, como visitante. Una colección que no se puede ver es como si no
// existiera. cache() evita leerla dos veces en la misma petición (metadata y página).
export const obtenerColeccion = cache(async (slug: string) => {
  if (!slugValido(slug)) return null;
  return runWithAmplifyServerContext({
    nextServerContext: null,
    operation: async (contextSpec) => {
      const { data, errors } = await clienteDatosServidor.models.Collection.listCollectionBySlug(
        contextSpec,
        { slug },
        { authMode: "identityPool" },
      );
      if (errors?.length) throw new Error(errors[0].message);
      return data.find((c) => coleccionVisible(c)) ?? null;
    },
  });
});

export async function leerPaginaColeccion(slug: string) {
  const coleccion = await obtenerColeccion(slug);
  if (!coleccion) return null;
  const [productos, foto] = await Promise.all([
    leerProductosColeccion(idsDeColeccion(coleccion), coleccion.sortOrder ?? "MANUAL"),
    // Decorativa: el título de la colección va justo debajo
    firmarFoto(coleccion.imageKey ? { key: coleccion.imageKey } : null),
  ]);
  return { titulo: coleccion.title, descripcion: coleccion.description ?? null, foto, productos };
}
