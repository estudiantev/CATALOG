import type { Metadata } from "next";
import { FormularioProducto } from "@/components/admin/formulario-producto";
import { puede } from "@/lib/permisos";
import { requerirStaff } from "@/lib/sesion-servidor";

export const metadata: Metadata = {
  title: "Editar producto",
};

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { grupos } = await requerirStaff("editarProducto");
  const { productId } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Editar producto</h1>
      <FormularioProducto productId={productId} puedeBorrarImagenes={puede(grupos, "borrarImagenes")} />
    </div>
  );
}
