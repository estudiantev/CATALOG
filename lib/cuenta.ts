import { cookies } from "next/headers";
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/data";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { type Perfil, SIN_MEDIDAS } from "@/lib/perfil";
import type { Sesion } from "@/lib/sesion-servidor";

// Cliente de datos con la sesión de quien visita (sus cookies). La regla allow.owner()
// de Customer hace que cada clienta solo pueda leer su propio perfil.
const clienteDatos = generateServerClientUsingCookies<Schema>({ config: outputs, cookies });

const CAMPOS_PERFIL = [
  "email",
  "firstName",
  "lastName",
  "phone",
  "birthdate",
  "measurements.cupSize",
  "measurements.heightCm",
  "measurements.bustCm",
  "measurements.waistCm",
  "measurements.hipsCm",
] as const;

// Perfil armado solo con los datos del token: para quien todavía no tiene Customer
// (el staff, o una clienta si falló el trigger post-confirmation)
export function perfilDesdeSesion(sesion: Sesion): Perfil {
  return {
    existe: false,
    nombre: sesion.nombre,
    apellido: sesion.apellido,
    correo: sesion.correo,
    telefono: null,
    nacimiento: null,
    medidas: SIN_MEDIDAS,
  };
}

// El Customer de la clienta. null = no se pudo leer (no es lo mismo que "no existe":
// en ese caso no se debe mostrar el formulario, porque guardaría encima datos vacíos).
export async function leerPerfil(sesion: Sesion): Promise<Perfil | null> {
  if (!sesion.id) return null;
  try {
    const { data, errors } = await clienteDatos.models.Customer.get(
      { customerId: sesion.id },
      { selectionSet: CAMPOS_PERFIL },
    );
    if (errors?.length) {
      console.error("No se pudo leer el Customer:", errors);
      if (!data) return null;
    }
    if (!data) return perfilDesdeSesion(sesion);

    const medidas = data.measurements;
    return {
      existe: true,
      nombre: data.firstName || sesion.nombre,
      apellido: data.lastName || sesion.apellido,
      correo: data.email || sesion.correo,
      telefono: data.phone || null,
      nacimiento: data.birthdate || null,
      medidas: {
        altura: medidas?.heightCm ?? null,
        busto: medidas?.bustCm ?? null,
        cintura: medidas?.waistCm ?? null,
        cadera: medidas?.hipsCm ?? null,
        copa: medidas?.cupSize || null,
      },
    };
  } catch (error) {
    console.error("No se pudo leer el Customer:", error);
    return null;
  }
}
