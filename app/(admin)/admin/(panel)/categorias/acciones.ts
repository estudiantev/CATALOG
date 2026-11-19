"use server";

import { revalidateTag } from "next/cache";
import { requerirStaff } from "@/lib/sesion-servidor";

// Después de guardar las categorías: el menú y las páginas de los vestidos vuelven a leerlas
// (lib/categorias-servidor.ts las guarda en caché con la etiqueta "categorias")
export async function invalidarCategorias() {
  await requerirStaff("editarCategorias");
  revalidateTag("categorias");
}
