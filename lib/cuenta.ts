import { cookies } from "next/headers";
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/data";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import type { Sesion } from "@/lib/sesion-servidor";

// Cliente de datos con la sesión de quien visita (sus cookies). La regla allow.owner()
// de Customer hace que cada clienta solo pueda leer su propio perfil.
const clienteDatos = generateServerClientUsingCookies<Schema>({ config: outputs, cookies });

export type Perfil = {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string | null;
};

async function leerCustomer(customerId: string) {
  try {
    const { data, errors } = await clienteDatos.models.Customer.get(
      { customerId },
      { selectionSet: ["email", "firstName", "lastName", "phone"] },
    );
    if (errors?.length) console.error("No se pudo leer el Customer:", errors);
    return data;
  } catch (error) {
    console.error("No se pudo leer el Customer:", error);
    return null;
  }
}

// Perfil para Mi cuenta: el Customer que crea post-confirmation, con los datos del token
// como respaldo (el staff no tiene Customer y el de una clienta pudo no crearse si falló el trigger)
export async function leerPerfil(sesion: Sesion): Promise<Perfil> {
  const cliente = sesion.id ? await leerCustomer(sesion.id) : null;
  return {
    nombre: cliente?.firstName || sesion.nombre,
    apellido: cliente?.lastName || sesion.apellido,
    correo: cliente?.email || sesion.correo,
    telefono: cliente?.phone || null,
  };
}
