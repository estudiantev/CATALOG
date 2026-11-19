import type { Metadata } from "next";
import { Catalogo, type FiltrosIniciales } from "@/components/tienda/catalogo";
import { COLORES } from "@/components/tienda/datos";
import { RutaNavegacion } from "@/components/tienda/ruta-navegacion";
import { type ProductoCatalogo, leerCatalogo } from "@/lib/catalogo";
import { rutaCategoria, tituloCategoria } from "@/lib/categorias";
import { leerCategorias } from "@/lib/categorias-servidor";
import { TALLAS } from "@/lib/productos";

// Las fotos usan URLs firmadas de S3 que vencen: se firman en cada visita.
// Los datos de DynamoDB sí se guardan en caché 10 minutos (lib/catalogo.ts).
export const dynamic = "force-dynamic";

// Las colecciones del menú se buscan en la ocasión, descripción, características y silueta
const COLECCIONES_URL: Record<string, string> = {
  gala: "gala",
  xv: "xv",
  cortos: "corto",
  floreados: "floreado",
};

type Parametros = Record<string, string | string[] | undefined>;
type Props = { searchParams: Promise<Parametros> };

const leer = (parametros: Parametros, nombre: string) => {
  const v = parametros[nombre];
  return Array.isArray(v) ? v[0] : v;
};

// ?categoria=<slug>: la de una categoría; sin él (o con una que ya no existe), todos los vestidos
async function categoriaDe(parametros: Parametros) {
  const slug = leer(parametros, "categoria");
  return slug ? (await leerCategorias()).find((c) => c.slug === slug) : undefined;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const categoria = await categoriaDe(await searchParams);
  return { title: categoria ? tituloCategoria(categoria) : "Vestidos" };
}

// Los enlaces del menú (?ocasion=, ?talla=, ?color=, ?coleccion=, ?modalidad=) llegan como filtros iniciales
function filtrosDesdeUrl(parametros: Parametros): FiltrosIniciales {
  const familia = COLORES.find((c) => c.href === `/vestidos?color=${leer(parametros, "color")}`)?.familia;
  const talla = TALLAS.find((t) => t.valor === leer(parametros, "talla"))?.valor;
  const ocasion = leer(parametros, "ocasion")?.trim();
  const modalidad = leer(parametros, "modalidad");
  return {
    variante: { ...(familia ? { color: [familia] } : {}), ...(talla ? { talla: [talla] } : {}) },
    generales: ocasion ? { ocasion: [ocasion] } : {},
    texto: COLECCIONES_URL[leer(parametros, "coleccion") ?? ""] ?? "",
    modo: modalidad === "compra" || modalidad === "alquiler" ? modalidad : "todo",
  };
}

export default async function VestidosPage({ searchParams }: Props) {
  const parametros = await searchParams;
  // RF-01: cada categoría tiene su propia página con sus vestidos
  const categoria = await categoriaDe(parametros);
  const filtrosIniciales = filtrosDesdeUrl(parametros);
  const titulo = categoria ? tituloCategoria(categoria) : "Vestidos";
  const ruta = [
    { nombre: "Inicio", href: "/" },
    ...(categoria ? [{ nombre: "Vestidos", href: "/vestidos" }, { nombre: categoria.nombre }] : [{ nombre: "Vestidos" }]),
  ];

  let productos: ProductoCatalogo[] | null = null;
  try {
    productos = await leerCatalogo(categoria?.codigo);
  } catch (error) {
    console.error("No se pudo cargar el catálogo:", error);
  }

  if (!productos) {
    return (
      <div className="bg-white font-cuerpo text-[15px] text-tinta">
        <h1 className="sr-only">{titulo}</h1>
        <RutaNavegacion pasos={ruta} />
        <p className="px-6 py-24 text-center text-[18px]">No pudimos cargar los vestidos. Inténtalo de nuevo en unos minutos.</p>
      </div>
    );
  }

  // key: al llegar desde otro enlace del menú, los filtros vuelven a empezar
  return (
    <Catalogo
      key={`${categoria ? rutaCategoria(categoria.slug) : "todos"}-${JSON.stringify(filtrosIniciales)}`}
      productos={productos}
      ruta={ruta}
      titulo={titulo}
      filtrosIniciales={filtrosIniciales}
    />
  );
}
