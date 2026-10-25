import { type NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";
import { esStaff } from "@/lib/permisos";

// Primera barrera del panel. Las páginas vuelven a verificar en el servidor
// (lib/sesion-servidor.ts) y AppSync/S3 aplican los permisos reales.
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

  const staff = grupos !== null && esStaff(grupos);

  if (request.nextUrl.pathname === "/admin/login") {
    // Si ya entró como staff no tiene sentido mostrarle el login
    return staff ? NextResponse.redirect(new URL("/admin", request.url)) : response;
  }

  if (grupos === null) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Una clienta con sesión iniciada vuelve a la tienda
  if (!staff) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

// Solo corre en el panel; la tienda no pasa por aquí
export const config = {
  matcher: ["/admin/:path*"],
};
