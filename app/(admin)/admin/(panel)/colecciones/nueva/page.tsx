import type { Metadata } from "next";
import { FormularioColeccion } from "@/components/admin/formulario-coleccion";
import { requerirStaff } from "@/lib/sesion-servidor";

export const metadata: Metadata = {
  title: "Nueva colección",
};

export default async function NuevaColeccionPage() {
  await requerirStaff("editarColecciones");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Nueva colección</h1>
      <FormularioColeccion />
    </div>
  );
}
