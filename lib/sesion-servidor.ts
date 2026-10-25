import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";
import { type Accion, esStaff, puede } from "@/lib/permisos";

export type Sesion = { correo: string; grupos: string[] };

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
        const correo = tokens.idToken?.payload.email;
        return {
          correo: typeof correo === "string" ? correo : "",
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
