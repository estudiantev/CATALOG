"use client";

// Completa el inicio de sesión con Google cuando Cognito devuelve a la usuaria a la tienda.
// Es necesario en apps de varias páginas: la página de llegada no es la que empezó el login.
import "aws-amplify/auth/enable-oauth-listener";
import { Hub } from "aws-amplify/utils";

// Se registra al cargar el módulo para no perder el evento mientras la página se hidrata
Hub.listen("auth", ({ payload }) => {
  if (payload.event === "signInWithRedirect_failure") {
    window.location.assign("/login?google=error");
  }
});

export function RetornoGoogle() {
  return null;
}
