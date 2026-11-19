import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { EditorContenido } from "@/components/admin/contenido/editor-contenido";
import { Button } from "@/components/admin/ui/button";
import { requerirStaff } from "@/lib/sesion-servidor";

export const metadata: Metadata = {
  title: "Contenido",
};

// CMS de la página de inicio: lo editan ADMIN y MARKETING (lib/permisos.ts)
export default async function ContenidoPage() {
  await requerirStaff("editarContenido");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 basis-80 space-y-1">
          <h1 className="text-2xl font-semibold">Página de inicio</h1>
          <p className="text-muted-foreground">
            Cambia los textos, las fotos y los productos de la página de inicio, en el orden en que se ven. Los anuncios y el pie de página aparecen en toda la tienda. Cada sección se guarda por separado y se ve al guardarla.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink />
            Ver la página de inicio
          </Link>
        </Button>
      </div>
      <EditorContenido />
    </div>
  );
}
