import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetalleProducto } from "@/components/tienda/detalle-producto";
import { ProductosRelacionados } from "@/components/tienda/productos-relacionados";
import { RutaNavegacion } from "@/components/tienda/ruta-navegacion";
import { type ProductoDetalle, leerRelacionados, obtenerProducto } from "@/lib/catalogo";
import { leerPasosAlquiler } from "@/lib/contenido-servidor";
import { CATEGORIAS } from "@/lib/productos";

// Las fotos usan URLs firmadas de S3 que vencen: la página se genera en cada visita
export const dynamic = "force-dynamic";

// Los que caben en una fila de "También te puede gustar"
const RELACIONADOS = 5;

type Props = {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ v?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  const producto = await obtenerProducto(productId).catch(() => null);
  return { title: producto?.nombre ?? "Producto" };
}

export default async function ProductoPage({ params, searchParams }: Props) {
  const { productId } = await params;
  // RF-10: ?v= llega desde la tarjeta del catálogo con la combinación que se filtró
  const { v } = await searchParams;

  let producto: ProductoDetalle | null;
  try {
    producto = await obtenerProducto(productId);
  } catch (error) {
    console.error("No se pudo cargar el producto:", error);
    return (
      <p className="bg-white px-4 py-24 text-center font-cuerpo text-[15px] text-tinta">
        No pudimos cargar este producto. Inténtalo de nuevo en unos minutos.
      </p>
    );
  }
  if (!producto) notFound();

  const categoria = CATEGORIAS.find((c) => c.valor === producto.categoria);
  const catalogoCategoria = categoria ? `/catalogo?categoria=${categoria.slug}` : "/catalogo";
  // Si fallan, el detalle se muestra igual: sin relacionados o sin los pasos del alquiler
  const [pasos, relacionados] = await Promise.all([
    leerPasosAlquiler().catch(() => []),
    leerRelacionados(producto.productId, producto.categoria, RELACIONADOS).catch((error) => {
      console.error("No se pudieron leer los productos relacionados:", error);
      return [];
    }),
  ]);

  return (
    <article className="bg-white font-cuerpo text-[15px] text-tinta">
      <RutaNavegacion
        pasos={[
          { nombre: "Inicio", href: "/" },
          { nombre: "Catálogo", href: "/catalogo" },
          ...(categoria ? [{ nombre: categoria.plural, href: catalogoCategoria }] : []),
          { nombre: producto.nombre },
        ]}
      />

      <DetalleProducto producto={producto} variantIdInicial={Array.isArray(v) ? v[0] : v} pasos={pasos} />

      <ProductosRelacionados productos={relacionados} verMas={catalogoCategoria} />
    </article>
  );
}
