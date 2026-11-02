import type { Metadata } from "next";
import { FormularioProducto } from "@/components/admin/formulario-producto";
import { requerirStaff } from "@/lib/sesion-servidor";

export const metadata: Metadata = {
  title: "Nuevo producto",
};

export default async function NuevoProductoPage() {
  await requerirStaff("crearProducto");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Nuevo producto</h1>
      <FormularioProducto />
    </div>
  );
}
