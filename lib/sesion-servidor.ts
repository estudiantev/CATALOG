import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";
import { type Accion, esStaff, puede } from "@/lib/permisos";

// id = sub de Cognito (también es el customerId de su perfil Customer)
export type Sesion = { id: string; correo: string; nombre: string; apellido: string; grupos: string[] };

const texto = (valor: unknown) => (typeof valor === "string" ? valor : "");

// Lee la sesión desde las cookies de la petición. El adaptador de Amplify valida
// la firma de los tokens de Cognito, así que una cookie alterada no pasa.
export async function obtenerSesion(): Promise<Sesion | null> {
  return runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: async (contextSpec) => {
      try {
        const { tokens } = await fetchAuthSession(contextSpec);
        if (!tokens) return null;
        const grupos = tokens.accessToken.payload["cognito:groups"];
        const datos = tokens.idToken?.payload;
        return {
          id: texto(tokens.accessToken.payload.sub),
          correo: texto(datos?.email),
          nombre: texto(datos?.given_name),
          apellido: texto(datos?.family_name),
          grupos: Array.isArray(grupos) ? grupos.map(String) : [],
        };
      } catch {
        return null;
      }
    },
  });
}

// Para las páginas del panel: sin sesión → login; sin grupo de staff → tienda;
// sin el permiso de la acción → listado de productos.
export async function requerirStaff(accion?: Accion): Promise<Sesion> {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/admin/login");
  if (!esStaff(sesion.grupos)) redirect("/");
  if (accion && !puede(sesion.grupos, accion)) redirect("/admin/productos");
  return sesion;
}
