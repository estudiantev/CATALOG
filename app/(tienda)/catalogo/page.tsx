import type { Metadata } from "next";
import { Catalogo, type Filtros, SIN_FILTROS } from "@/components/tienda/catalogo";
import { COLORES } from "@/components/tienda/datos";
import { type ProductoCatalogo, obtenerCatalogo } from "@/lib/catalogo";

export const metadata: Metadata = {
  title: "Catálogo",
};

// Las fotos usan URLs firmadas de S3 que vencen: el catálogo se genera en cada visita
export const dynamic = "force-dynamic";

const CATEGORIAS_URL: Record<string, string> = {
  vestidos: "DRESS",
  joyeria: "JEWELRY",
  accesorios: "ACCESSORY",
};

// Las colecciones del menú se buscan en la ocasión, silueta y etiquetas del producto
const COLECCIONES_URL: Record<string, string> = {
  gala: "gala",
  xv: "xv",
  cortos: "corto",
  floreados: "floreado",
};

type Parametros = Record<string, string | string[] | undefined>;

// Los enlaces del menú (?coleccion=, ?color=, ?categoria=) son los filtros iniciales
function filtrosDesdeUrl(parametros: Parametros): Filtros {
  const valor = (nombre: string) => {
    const v = parametros[nombre];
    return Array.isArray(v) ? v[0] : v;
  };
  const color = valor("color");
  return {
    ...SIN_FILTROS,
    busqueda: COLECCIONES_URL[valor("coleccion") ?? ""] ?? "",
    categoria: CATEGORIAS_URL[valor("categoria") ?? ""] ?? "",
    familia: COLORES.find((c) => c.href === `/catalogo?color=${color}`)?.familia ?? "",
  };
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<Parametros>;
}) {
  const filtrosIniciales = filtrosDesdeUrl(await searchParams);

  let productos: ProductoCatalogo[] | null = null;
  try {
    productos = await obtenerCatalogo();
  } catch (error) {
    console.error("No se pudo cargar el catálogo:", error);
  }

  return (
    <section className="pt-[clamp(40px,4.4vw,64px)]">
      <div className="px-[clamp(16px,3.6vw,54px)] pb-6">
        <h1 className="text-[clamp(24px,2vw,30px)] leading-[1.2] font-medium tracking-[0.08em] uppercase">
          Nuestro catálogo
        </h1>
        <p className="mt-1 text-topo">Vestidos de gala, de XV, cortos y floreados en venta y alquiler.</p>
      </div>
      {productos ? (
        // key: al llegar desde otro enlace del menú, los filtros vuelven a empezar
        <Catalogo key={JSON.stringify(filtrosIniciales)} productos={productos} filtrosIniciales={filtrosIniciales} />
      ) : (
        <p className="border-t-2 border-tinta px-[clamp(16px,3.6vw,54px)] py-16 text-center text-[18px]">
          No pudimos cargar el catálogo. Inténtalo de nuevo en unos minutos.
        </p>
      )}
    </section>
  );
}
