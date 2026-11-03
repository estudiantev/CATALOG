"use client";

// Completa el inicio de sesión con Google cuando Cognito devuelve a la usuaria a la tienda.
// Es necesario en apps de varias páginas: la página de llegada no es la que empezó el login.
import "aws-amplify/auth/enable-oauth-listener";
import { Hub } from "aws-amplify/utils";
import { DESTINO_POR_DEFECTO, destinoSeguro } from "@/lib/redireccion";

// Cognito siempre vuelve a la portada (callbackUrls); el destino real viaja en el customState
// que puso BotonGoogle. Amplify emite customOAuthState antes que signInWithRedirect y guarda
// los tokens (cookies) antes de ambos.
let destino = DESTINO_POR_DEFECTO;

// Se registra al cargar el módulo para no perder el evento mientras la página se hidrata
Hub.listen("auth", ({ payload }) => {
  switch (payload.event) {
    case "customOAuthState":
      destino = destinoSeguro(payload.data);
      break;
    case "signInWithRedirect":
      window.location.assign(destino);
      break;
    case "signInWithRedirect_failure":
      window.location.assign("/login?google=error");
      break;
  }
});

export function RetornoGoogle() {
  return null;
}
