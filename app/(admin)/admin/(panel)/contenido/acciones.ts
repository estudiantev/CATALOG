"use server";

import { revalidateTag } from "next/cache";
import { requerirStaff } from "@/lib/sesion-servidor";

// Después de guardar una sección: la página de inicio vuelve a leer el contenido
// (lib/contenido-servidor.ts lo guarda en caché con la etiqueta "contenido")
export async function invalidarContenido() {
  await requerirStaff("editarContenido");
  revalidateTag("contenido");
}

// Después de guardar las categorías: el menú y el catálogo vuelven a leerlas
// (lib/categorias-servidor.ts las guarda en caché con la etiqueta "categorias")
export async function invalidarCategorias() {
  await requerirStaff("editarContenido");
  revalidateTag("categorias");
}
