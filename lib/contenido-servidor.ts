import { unstable_cache } from "next/cache";
import { generateServerClientUsingReqRes } from "@aws-amplify/adapter-nextjs/data";
import { getUrl } from "aws-amplify/storage/server";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";
import { type ProductoCatalogo, leerDestacados } from "@/lib/catalogo";
import {
  type ClaveOcasion,
  type ContenidoInicio,
  type DatosSeccion,
  type Diapositiva,
  type Imagen,
  MAXIMO_DESTACADOS,
  OCASIONES,
  type Ocasion,
  PAGINA_INICIO,
  armarContenido,
  ocasionesEnInicio,
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

// Si la tabla no responde (o todavía no existe en el backend), se muestra el contenido por
// defecto: la tienda nunca se cae por el CMS.
function leerContenido(): Promise<ContenidoInicio> {
  return leerFilas().then(armarContenido, (error) => {
    console.error("No se pudo leer el contenido de la tienda:", error);
    return armarContenido([]);
  });
}

// Fotos de ambiente: el texto que las acompaña dice lo importante, así que van con alt=""
type FotoAmbiente = { url: string };

// Una foto que no se puede firmar se trata como si no hubiera foto: se ve la ilustración
export async function firmarFoto(imagen: Imagen | null): Promise<FotoAmbiente | null> {
  if (!imagen) return null;
  const url = await runWithAmplifyServerContext({
    nextServerContext: null,
    operation: (contextSpec) =>
      getUrl(contextSpec, { path: imagen.key, options: { expiresIn: VIGENCIA_URL } }).then(
        ({ url }) => url.toString(),
        () => null,
      ),
  });
  return url ? { url } : null;
}

// Cambia la `imagen` guardada por la `foto` ya firmada
type ConFoto<T> = Omit<T, "imagen"> & { foto: FotoAmbiente | null };
async function conFoto<T extends { imagen: Imagen | null }>({ imagen, ...resto }: T): Promise<ConFoto<T>> {
  return { ...resto, foto: await firmarFoto(imagen) };
}

export type DiapositivaLista = ConFoto<Diapositiva>;
export type OcasionLista = ConFoto<Ocasion>;

type TarjetaOcasionLista = { clave: ClaveOcasion; ocasion: OcasionLista };

function firmarOcasiones(datos: DatosSeccion["ocasiones"], claves: ClaveOcasion[]): Promise<TarjetaOcasionLista[]> {
  return Promise.all(claves.map(async (clave) => ({ clave, ocasion: await conFoto(datos[clave]) })));
}

// Lo que necesita la página de inicio; una sección en null está oculta
export type ContenidoPortada = {
  diapositivas: DiapositivaLista[];
  destacados: (Omit<DatosSeccion["destacados"], "productos"> & { productos: ProductoCatalogo[] }) | null;
  ocasiones: TarjetaOcasionLista[] | null;
  pasos: DatosSeccion["pasos"] | null;
  nosotros: ConFoto<DatosSeccion["nosotros"]> | null;
  inspiracion: ConFoto<DatosSeccion["inspiracion"]> | null;
};

// El marco de todas las páginas de la tienda: no lleva fotos, así que sale directo de la caché
export async function leerContenidoMarco() {
  const { anuncios, pie } = await leerContenido();
  return { anuncios: anuncios.visible ? anuncios.datos : null, pie: pie.datos };
}

// La página de inicio como visitante
export async function leerContenidoInicio(): Promise<ContenidoPortada> {
  const { portada, destacados, ocasiones, pasos, nosotros, inspiracion } = await leerContenido();

  const [diapositivas, productos, ocasionesListas, nosotrosListo, inspiracionLista] = await Promise.all([
    Promise.all(portada.datos.diapositivas.map((d) => conFoto(d))),
    destacados.visible
      ? leerDestacados(destacados.datos.productos, MAXIMO_DESTACADOS).catch((error) => {
          console.error("No se pudieron leer los productos destacados:", error);
          return [];
        })
      : Promise.resolve([]),
    ocasiones.visible ? firmarOcasiones(ocasiones.datos, ocasionesEnInicio(ocasiones.datos)) : null,
    nosotros.visible ? conFoto(nosotros.datos) : null,
    inspiracion.visible ? conFoto(inspiracion.datos) : null,
  ]);

  return {
    diapositivas,
    // Sin productos con stock la sección no se muestra (nada de tarjetas vacías)
    destacados: destacados.visible && productos.length ? { ...destacados.datos, productos } : null,
    ocasiones: ocasionesListas,
    pasos: pasos.visible ? pasos.datos : null,
    nosotros: nosotrosListo,
    inspiracion: inspiracionLista,
  };
}

// Las cuatro para /colecciones: "visible" solo oculta la sección de la página de inicio
export async function leerOcasiones() {
  const { ocasiones } = await leerContenido();
  return firmarOcasiones(
    ocasiones.datos,
    OCASIONES.map(({ clave }) => clave),
  );
}
