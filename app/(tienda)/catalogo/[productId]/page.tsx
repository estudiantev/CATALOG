import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetalleProducto } from "@/components/tienda/detalle-producto";
import { type ProductoDetalle, obtenerProducto } from "@/lib/catalogo";

// Las fotos usan URLs firmadas de S3 que vencen: la página se genera en cada visita
export const dynamic = "force-dynamic";

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
      <p className="px-4 py-24 text-center text-[18px]">
        No pudimos cargar este producto. Inténtalo de nuevo en unos minutos.
      </p>
    );
  }
  if (!producto) notFound();

  return <DetalleProducto producto={producto} variantIdInicial={Array.isArray(v) ? v[0] : v} />;
}
