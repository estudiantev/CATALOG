import { unstable_cache } from "next/cache";
import { generateServerClientUsingReqRes } from "@aws-amplify/adapter-nextjs/data";
import { getUrl } from "aws-amplify/storage/server";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";
import { type Foto, type ProductoCatalogo, leerDestacados } from "@/lib/catalogo";
import {
  type DatosSeccion,
  type Diapositiva,
  MAXIMO_DESTACADOS,
  PAGINA_INICIO,
  armarContenido,
} from "@/lib/contenido";

// Cliente de datos para el servidor: cada llamada recibe el contextSpec de runWithAmplifyServerContext
const clienteDatosServidor = generateServerClientUsingReqRes<Schema>({ config: outputs });

// Los textos se leen de DynamoDB como mucho una vez cada 10 minutos. Al guardar, el panel
// invalida la caché con revalidateTag("contenido"), así que los cambios se ven enseguida.
const CACHE_CONTENIDO = 10 * 60;
// Las URLs firmadas de las fotos duran 1 hora y se generan en cada visita
const VIGENCIA_URL = 60 * 60;

// Query a las filas de la página (clave de partición "inicio"), como visitante
const leerFilas = unstable_cache(
  async () =>
    runWithAmplifyServerContext({
      nextServerContext: null,
      operation: async (contextSpec) => {
        const { data, errors } = await clienteDatosServidor.models.Content.list(contextSpec, {
          page: PAGINA_INICIO,
          authMode: "identityPool",
          selectionSet: ["section", "data", "visible"],
        });
        if (errors?.length) {
          if (!data?.length) throw new Error(errors[0].message);
          console.error("Filas de contenido con errores:", errors);
        }
        return (data ?? []).filter((fila) => fila !== null).map((fila) => ({ section: fila.section, data: fila.data, visible: fila.visible }));
      },
    }),
  ["contenido", PAGINA_INICIO],
  { revalidate: CACHE_CONTENIDO, tags: ["contenido"] },
);

export type DiapositivaLista = Omit<Diapositiva, "imagen"> & { foto: Foto | null };

// Lo que necesita la página de inicio; una sección en null está oculta
export type ContenidoPortada = {
  diapositivas: DiapositivaLista[];
  ocasiones: DatosSeccion["ocasiones"] | null;
  destacados: (Omit<DatosSeccion["destacados"], "productos"> & { productos: ProductoCatalogo[] }) | null;
  pasos: DatosSeccion["pasos"] | null;
};

const aLista = (d: Diapositiva, foto: Foto | null): DiapositivaLista => ({
  antetitulo: d.antetitulo,
  titulo: d.titulo,
  texto: d.texto,
  botonPrincipal: d.botonPrincipal,
  botonSecundario: d.botonSecundario,
  foto,
});

// Una foto que no se puede firmar se cambia por las ilustraciones de vestidos
async function firmarFotos(diapositivas: Diapositiva[]): Promise<DiapositivaLista[]> {
  if (!diapositivas.some((d) => d.imagen)) return diapositivas.map((d) => aLista(d, null));
  return runWithAmplifyServerContext({
    nextServerContext: null,
    operation: (contextSpec) =>
      Promise.all(
        diapositivas.map(async (d) => {
          if (!d.imagen) return aLista(d, null);
          const { key, alt } = d.imagen;
          const url = await getUrl(contextSpec, { path: key, options: { expiresIn: VIGENCIA_URL } }).then(
            ({ url }) => url.toString(),
            () => null,
          );
          return aLista(d, url ? { url, alt } : null);
        }),
      ),
  });
}

// La página de inicio como visitante. Si la tabla no responde (o todavía no existe en el
// backend), se muestra el contenido por defecto: la portada nunca se cae por el CMS.
export async function leerContenidoInicio(): Promise<ContenidoPortada> {
  const contenido = await leerFilas().then(armarContenido, (error) => {
    console.error("No se pudo leer el contenido de la página de inicio:", error);
    return armarContenido([]);
  });
  const { portada, ocasiones, destacados, pasos } = contenido;

  const [diapositivas, productos] = await Promise.all([
    firmarFotos(portada.datos.diapositivas),
    destacados.visible
      ? leerDestacados(destacados.datos.productos, MAXIMO_DESTACADOS).catch((error) => {
          console.error("No se pudieron leer los productos destacados:", error);
          return [];
        })
      : Promise.resolve([]),
  ]);

  return {
    diapositivas,
    ocasiones: ocasiones.visible ? ocasiones.datos : null,
    // Sin productos con stock la sección no se muestra (nada de tarjetas vacías)
    destacados: destacados.visible && productos.length ? { ...destacados.datos, productos } : null,
    pasos: pasos.visible ? pasos.datos : null,
  };
}
