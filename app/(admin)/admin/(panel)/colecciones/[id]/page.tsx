import type { Metadata } from "next";
import { FormularioColeccion } from "@/components/admin/formulario-coleccion";
import { requerirStaff } from "@/lib/sesion-servidor";

export const metadata: Metadata = {
  title: "Editar colección",
};

export default async function EditarColeccionPage({ params }: { params: Promise<{ id: string }> }) {
  await requerirStaff("editarColecciones");
  const { id } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Editar colección</h1>
      <FormularioColeccion id={id} />
    </div>
  );
}
