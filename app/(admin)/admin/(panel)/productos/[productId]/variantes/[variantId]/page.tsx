import type { Metadata } from "next";
import { FormularioVariante } from "@/components/admin/formulario-variante";
import { puede } from "@/lib/permisos";
import { requerirStaff } from "@/lib/sesion-servidor";

export const metadata: Metadata = {
  title: "Editar variante",
};

export default async function EditarVariantePage({
  params,
}: {
  params: Promise<{ productId: string; variantId: string }>;
}) {
  const { grupos } = await requerirStaff("editarProducto");
  const { productId, variantId } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Editar variante</h1>
      <FormularioVariante productId={productId} variantId={variantId} puedeBorrarImagenes={puede(grupos, "borrarImagenes")} />
    </div>
  );
}
