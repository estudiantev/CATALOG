import type { Metadata } from "next";
import { FormularioProducto } from "@/components/admin/formulario-producto";
import { VariantesProducto } from "@/components/admin/variantes-producto";
import { puede } from "@/lib/permisos";
import { requerirStaff } from "@/lib/sesion-servidor";

export const metadata: Metadata = {
  title: "Editar producto",
};

export default async function EditarProductoPage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ nuevo?: string }>;
}) {
  const { grupos } = await requerirStaff("editarProducto");
  const { productId } = await params;
  const { nuevo } = await searchParams;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Editar producto</h1>
      <FormularioProducto productId={productId} />
      <VariantesProducto
        productId={productId}
        puedeCrear={puede(grupos, "crearProducto")}
        puedeEliminar={puede(grupos, "eliminarProducto")}
        nuevo={nuevo === "1"}
      />
    </div>
  );
}
