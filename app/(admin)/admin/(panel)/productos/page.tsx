import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TablaProductos } from "@/components/admin/tabla-productos";
import { Button } from "@/components/admin/ui/button";
import { puede } from "@/lib/permisos";
import { requerirStaff } from "@/lib/sesion-servidor";

export const metadata: Metadata = {
  title: "Productos",
};

export default async function ProductosPage() {
  const { grupos } = await requerirStaff();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-muted-foreground">Gestiona el catálogo de la tienda.</p>
        </div>
        {puede(grupos, "crearProducto") && (
          <Button asChild>
            <Link href="/admin/productos/nuevo">
              <Plus />
              Nuevo producto
            </Link>
          </Button>
        )}
      </div>
      <TablaProductos
        puedeEditar={puede(grupos, "editarProducto")}
        puedeEliminar={puede(grupos, "eliminarProducto")}
      />
    </div>
  );
}
