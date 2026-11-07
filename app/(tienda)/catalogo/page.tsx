import type { Metadata } from "next";
import { Catalogo, type FiltrosIniciales } from "@/components/tienda/catalogo";
import { COLORES } from "@/components/tienda/datos";
import { RutaNavegacion } from "@/components/tienda/ruta-navegacion";
import { type ProductoCatalogo, leerCatalogo } from "@/lib/catalogo";
import { CATEGORIAS, TALLAS } from "@/lib/productos";

export const metadata: Metadata = {
  title: "Catálogo",
};

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

const leer = (parametros: Parametros, nombre: string) => {
  const v = parametros[nombre];
  return Array.isArray(v) ? v[0] : v;
};

// Los enlaces del menú (?ocasion=, ?talla=, ?color=, ?coleccion=, ?modalidad=) llegan como filtros iniciales
function filtrosDesdeUrl(parametros: Parametros): FiltrosIniciales {
  const familia = COLORES.find((c) => c.href === `/catalogo?color=${leer(parametros, "color")}`)?.familia;
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

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<Parametros>;
}) {
  const parametros = await searchParams;
  // RF-01: cada categoría es su propio catálogo; sin ?categoria= se muestran los vestidos
  const categoria = CATEGORIAS.find((c) => c.slug === leer(parametros, "categoria")) ?? CATEGORIAS[0];
  const filtrosIniciales = filtrosDesdeUrl(parametros);

  let productos: ProductoCatalogo[] | null = null;
  try {
    productos = await leerCatalogo(categoria.valor);
  } catch (error) {
    console.error("No se pudo cargar el catálogo:", error);
  }

  if (!productos) {
    return (
      <div className="bg-white font-cuerpo text-[15px] text-tinta">
        <h1 className="sr-only">Catálogo de {categoria.plural.toLowerCase()}</h1>
        <RutaNavegacion pasos={[{ nombre: "Inicio", href: "/" }, { nombre: "Catálogo", href: "/catalogo" }, { nombre: categoria.plural }]} />
        <p className="border-b border-tinta px-6 py-24 text-center text-[18px]">No pudimos cargar el catálogo. Inténtalo de nuevo en unos minutos.</p>
      </div>
    );
  }

  // key: al llegar desde otro enlace del menú, los filtros vuelven a empezar
  return (
    <Catalogo
      key={`${categoria.valor}-${JSON.stringify(filtrosIniciales)}`}
      productos={productos}
      ruta={[{ nombre: "Inicio", href: "/" }, { nombre: "Catálogo", href: "/catalogo" }, { nombre: categoria.plural }]}
      categoria={categoria.valor}
      filtrosIniciales={filtrosIniciales}
    />
  );
}
