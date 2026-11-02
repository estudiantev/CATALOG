import type { Metadata } from "next";
import Link from "next/link";
import { Catalogo, type FiltrosIniciales } from "@/components/tienda/catalogo";
import { COLORES } from "@/components/tienda/datos";
import { type ProductoCatalogo, leerCatalogo } from "@/lib/catalogo";
import { CATEGORIAS } from "@/lib/productos";

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

// Los enlaces del menú (?coleccion=, ?color=) llegan como filtros iniciales
function filtrosDesdeUrl(parametros: Parametros): FiltrosIniciales {
  const familia = COLORES.find((c) => c.href === `/catalogo?color=${leer(parametros, "color")}`)?.familia;
  return {
    variante: familia ? { color: [familia] } : {},
    texto: COLECCIONES_URL[leer(parametros, "coleccion") ?? ""] ?? "",
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

  return (
    <section className="pt-[clamp(40px,4.4vw,64px)]">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 px-[clamp(16px,3.6vw,54px)] pb-6">
        <div>
          <h1 className="text-[clamp(24px,2vw,30px)] leading-[1.2] font-medium tracking-[0.08em] uppercase">
            {categoria.plural}
          </h1>
          <p className="mt-1 text-topo">En venta y alquiler, en Tacna.</p>
        </div>
        <nav aria-label="Categorías" className="flex gap-6">
          {CATEGORIAS.map((c) => (
            <Link
              key={c.valor}
              href={`/catalogo?categoria=${c.slug}`}
              aria-current={c.valor === categoria.valor ? "page" : undefined}
              className="text-[14px] font-medium tracking-[0.1em] uppercase underline-offset-[6px] hover:underline aria-[current=page]:underline aria-[current=page]:decoration-2"
            >
              {c.plural}
            </Link>
          ))}
        </nav>
      </div>
      {productos ? (
        // key: al llegar desde otro enlace del menú, los filtros vuelven a empezar
        <Catalogo key={`${categoria.valor}-${JSON.stringify(filtrosIniciales)}`} productos={productos} filtrosIniciales={filtrosIniciales} />
      ) : (
        <p className="border-t-2 border-tinta px-[clamp(16px,3.6vw,54px)] py-16 text-center text-[18px]">
          No pudimos cargar el catálogo. Inténtalo de nuevo en unos minutos.
        </p>
      )}
    </section>
  );
}
