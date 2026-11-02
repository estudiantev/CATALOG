import type { Metadata } from "next";
import { FormularioVariante } from "@/components/admin/formulario-variante";
import { puede } from "@/lib/permisos";
import { requerirStaff } from "@/lib/sesion-servidor";

export const metadata: Metadata = {
  title: "Nueva variante",
};

export default async function NuevaVariantePage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  // ?desde=<variantId>: duplicar una variante (empieza como copia, con sus mismas fotos)
  searchParams: Promise<{ desde?: string }>;
}) {
  const { grupos } = await requerirStaff("crearProducto");
  const { productId } = await params;
  const { desde } = await searchParams;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{desde ? "Duplicar variante" : "Nueva variante"}</h1>
      <FormularioVariante productId={productId} desde={desde} puedeBorrarImagenes={puede(grupos, "borrarImagenes")} />
    </div>
  );
}
