"use server";

import { revalidateTag } from "next/cache";
import { requerirStaff } from "@/lib/sesion-servidor";

// Después de guardar una sección: la página de inicio vuelve a leer el contenido
// (lib/contenido-servidor.ts lo guarda en caché con la etiqueta "contenido")
export async function invalidarContenido() {
  await requerirStaff("editarContenido");
  revalidateTag("contenido");
}
