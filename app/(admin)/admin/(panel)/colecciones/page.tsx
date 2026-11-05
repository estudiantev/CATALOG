import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TablaColecciones } from "@/components/admin/tabla-colecciones";
import { Button } from "@/components/admin/ui/button";
import { requerirStaff } from "@/lib/sesion-servidor";

export const metadata: Metadata = {
  title: "Colecciones",
};

export default async function ColeccionesPage() {
  await requerirStaff("editarColecciones");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Colecciones</h1>
          <p className="text-sm text-muted-foreground">Agrupa productos para una temporada, una promoción o una ocasión.</p>
        </div>
        <Button asChild>
          <Link href="/admin/colecciones/nueva">
            <Plus />
            Nueva colección
          </Link>
        </Button>
      </div>
      <TablaColecciones />
    </div>
  );
}
