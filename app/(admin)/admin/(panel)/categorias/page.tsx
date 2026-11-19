import type { Metadata } from "next";
import { EditorCategorias } from "@/components/admin/editor-categorias";
import { requerirStaff } from "@/lib/sesion-servidor";

export const metadata: Metadata = {
  title: "Categorías",
};

// Las categorías de los vestidos: las editan ADMIN y MARKETING (lib/permisos.ts). En cada producto
// se eligen las suyas.
export default async function CategoriasPage() {
  await requerirStaff("editarCategorias");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Categorías</h1>
        <p className="text-sm text-muted-foreground">
          Los tipos de vestido, como Floreados o De gala. Cada una tiene su página en la tienda, y en cada producto eliges en cuáles está.
        </p>
      </div>
      <EditorCategorias />
    </div>
  );
}
