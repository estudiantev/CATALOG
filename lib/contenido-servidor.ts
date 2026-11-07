import { unstable_cache } from "next/cache";
import { generateServerClientUsingReqRes } from "@aws-amplify/adapter-nextjs/data";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";
import { type ProductoCatalogo, leerDestacados } from "@/lib/catalogo";
import { rutaColeccion } from "@/lib/colecciones";
import { leerColeccionesPublicadas } from "@/lib/colecciones-servidor";
import {
  type ClaveOcasion,
  type ContenidoInicio,
  type DatosSeccion,
  type Diapositiva,
  type Imagen,
  MAXIMO_DESTACADOS,
  type Ocasion,
  PAGINA_INICIO,
  armarContenido,
  esOcasion,
  slugDeEleccion,
  tarjetasVigentes,
} from "@/lib/contenido";
import { type FotoAmbiente, firmarFoto } from "@/lib/foto-servidor";

// Cliente de datos para el servidor: cada llamada recibe el contextSpec de runWithAmplifyServerContext
const clienteDatosServidor = generateServerClientUsingReqRes<Schema>({ config: outputs });

// Los textos se leen de DynamoDB como mucho una vez cada 10 minutos. Al guardar, el panel
// invalida la caché con revalidateTag("contenido"), así que los cambios se ven enseguida.
const CACHE_CONTENIDO = 10 * 60;

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

// Cambia la `imagen` guardada por la `foto` ya firmada
type ConFoto<T> = Omit<T, "imagen"> & { foto: FotoAmbiente | null };
async function conFoto<T extends { imagen: Imagen | null }>({ imagen, ...resto }: T): Promise<ConFoto<T>> {
  return { ...resto, foto: await firmarFoto(imagen) };
}

export type DiapositivaLista = ConFoto<Omit<Diapositiva, "imagenMovil">> & { fotoMovil: FotoAmbiente | null };
export type OcasionLista = ConFoto<Ocasion>;

async function firmarDiapositiva({ imagenMovil, ...diapositiva }: Diapositiva): Promise<DiapositivaLista> {
  const [lista, fotoMovil] = await Promise.all([conFoto(diapositiva), firmarFoto(imagenMovil)]);
  return { ...lista, fotoMovil };
}

type InspiracionLista = ConFoto<Omit<DatosSeccion["inspiracion"], "video">> & { video: FotoAmbiente | null };

async function firmarInspiracion({ video, ...datos }: DatosSeccion["inspiracion"]): Promise<InspiracionLista> {
  const [lista, videoFirmado] = await Promise.all([conFoto(datos), firmarFoto(video)]);
  return { ...lista, video: videoFirmado };
}

type TarjetaOcasionLista = { clave: ClaveOcasion; ocasion: OcasionLista; titulo?: string };
type TarjetaColeccionLista = Awaited<ReturnType<typeof leerColeccionesPublicadas>>[number] & { modalidad?: string };
type TarjetaInicioLista = TarjetaOcasionLista | TarjetaColeccionLista;

// Las elegidas en el panel, en su orden. Lo que su tarjeta deja vacío sale de la colección.
async function leerTarjetasInicio(datos: DatosSeccion["ocasiones"]): Promise<TarjetaInicioLista[]> {
  const publicadas = new Map((await leerColeccionesPublicadas()).map((coleccion) => [coleccion.href, coleccion]));
  const tarjetas = tarjetasVigentes(datos, (slug) => publicadas.has(rutaColeccion(slug)));
  return Promise.all(
    tarjetas.map(async ({ eleccion, titulo, modalidad, descripcion, imagen }): Promise<TarjetaInicioLista> => {
      if (esOcasion(eleccion)) {
        const propia = datos[eleccion];
        return { clave: eleccion, titulo, ocasion: { modalidad, descripcion: descripcion || propia.descripcion, foto: await firmarFoto(imagen ?? propia.imagen) } };
      }
      const coleccion = publicadas.get(rutaColeccion(slugDeEleccion(eleccion) ?? ""))!;
      return {
        ...coleccion,
        nombre: titulo || coleccion.nombre,
        modalidad,
        descripcion: descripcion || coleccion.descripcion,
        foto: imagen ? await firmarFoto(imagen) : coleccion.foto,
      };
    }),
  );
}

// Lo que necesita la página de inicio; una sección en null está oculta
export type ContenidoPortada = {
  diapositivas: DiapositivaLista[];
  destacados: (Omit<DatosSeccion["destacados"], "productos"> & { productos: ProductoCatalogo[] }) | null;
  ocasiones: TarjetaInicioLista[] | null;
  pasos: DatosSeccion["pasos"] | null;
  nosotros: ConFoto<DatosSeccion["nosotros"]> | null;
  inspiracion: InspiracionLista | null;
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
    Promise.all(portada.datos.diapositivas.map(firmarDiapositiva)),
    destacados.visible
      ? leerDestacados(destacados.datos.productos, MAXIMO_DESTACADOS).catch((error) => {
          console.error("No se pudieron leer los productos destacados:", error);
          return [];
        })
      : Promise.resolve([]),
    ocasiones.visible ? leerTarjetasInicio(ocasiones.datos) : null,
    nosotros.visible ? conFoto(nosotros.datos) : null,
    inspiracion.visible ? firmarInspiracion(inspiracion.datos) : null,
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

// Los pasos del alquiler, para el detalle de cada producto. Son los de la sección "Alquiler en 3
// pasos" del panel, aunque esa sección esté oculta en la página de inicio.
export async function leerPasosAlquiler() {
  const { pasos } = await leerContenido();
  return pasos.datos.pasos;
}
