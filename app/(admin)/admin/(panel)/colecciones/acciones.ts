"use server";

import { revalidateTag } from "next/cache";
import { requerirStaff } from "@/lib/sesion-servidor";

// Después de crear, editar o eliminar una colección: el menú de la tienda vuelve a leerlas
// (lib/colecciones-servidor.ts lo guarda en caché con la etiqueta "colecciones")
export async function invalidarColecciones() {
  await requerirStaff("editarColecciones");
  revalidateTag("colecciones");
}
