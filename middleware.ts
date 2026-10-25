import { type NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";

// Grupos de Cognito que pueden entrar al panel (amplify/auth/resource.ts)
const GRUPOS_STAFF = ["ADMIN", "INVENTORY", "MARKETING"];

// Esto es experiencia de usuario, no seguridad: los permisos reales los aplican AppSync y S3
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // null = no hay sesión; [] = hay sesión pero la cuenta no tiene grupos (clienta)
  const grupos = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        if (!session.tokens) return null;
        const claim = session.tokens.accessToken.payload["cognito:groups"];
        return Array.isArray(claim) ? claim.map(String) : [];
      } catch {
        return null;
      }
    },
  });

  const esStaff = grupos?.some((grupo) => GRUPOS_STAFF.includes(grupo)) ?? false;

  if (request.nextUrl.pathname === "/admin/login") {
    // Si ya entró como staff no tiene sentido mostrarle el login
    return esStaff ? NextResponse.redirect(new URL("/admin", request.url)) : response;
  }

  if (grupos === null) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Una clienta con sesión iniciada vuelve a la tienda
  if (!esStaff) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

// Solo corre en el panel; la tienda no pasa por aquí
export const config = {
  matcher: ["/admin/:path*"],
};
