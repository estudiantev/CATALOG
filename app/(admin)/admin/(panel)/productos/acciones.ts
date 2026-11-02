"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/data";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { guardarResumen } from "@/lib/resumen";
import { requerirStaff } from "@/lib/sesion-servidor";

type Resultado = { ok: true } | { ok: false; error: string };

// Después de crear, editar, duplicar o eliminar variantes: recalcula el resumen del
// producto con la sesión de quien edita (AppSync aplica sus permisos) e invalida la caché
export async function recalcularResumen(productId: string): Promise<Resultado> {
  await requerirStaff("editarProducto");
  try {
    const cliente = generateServerClientUsingCookies<Schema>({ config: outputs, cookies });
    await guardarResumen(cliente, productId);
    revalidateTag("catalogo");
    return { ok: true };
  } catch (error) {
    console.error("No se pudo recalcular el resumen:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Error desconocido" };
  }
}

// Después de cambiar los datos generales o eliminar un producto
export async function invalidarCatalogo() {
  await requerirStaff();
  revalidateTag("catalogo");
}
