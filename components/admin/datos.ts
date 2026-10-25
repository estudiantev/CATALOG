import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
// Configura Amplify antes de crear el cliente
import "@/components/compartido/configurar-amplify";

// Cliente de AppSync con la sesión del usuario: AppSync aplica las reglas de cada grupo
export const clienteDatos = generateClient<Schema>();

export const NOMBRES_GRUPO: Record<string, string> = {
  ADMIN: "Administración",
  INVENTORY: "Inventario",
  MARKETING: "Marketing",
};

// Mensaje legible para los errores que devuelve AppSync
export function mensajeErrorDatos(errores: { message: string; errorType?: string }[] | undefined) {
  const error = errores?.[0];
  if (!error) return "Ocurrió un error inesperado.";
  if (/unauthorized|not authorized/i.test(`${error.errorType} ${error.message}`)) {
    return "Tu grupo no tiene permiso para esta acción.";
  }
  return error.message;
}
