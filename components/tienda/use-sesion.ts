"use client";

import { useEffect, useState } from "react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

export type SesionTienda = { nombre: string; correo: string };

const texto = (valor: unknown) => (typeof valor === "string" ? valor : "");

async function leerSesion(): Promise<SesionTienda | null> {
  try {
    // Sin sesión lanza un error sin ir a la red (fetchAuthSession pediría credenciales de invitado)
    await getCurrentUser();
    const { tokens } = await fetchAuthSession();
    const datos = tokens?.idToken?.payload;
    return datos ? { nombre: texto(datos.given_name), correo: texto(datos.email) } : null;
  } catch {
    return null;
  }
}

// Sesión de la clienta en el navegador, para el encabezado. Se revisa aquí y no en el
// servidor para que las páginas de la tienda sigan siendo estáticas.
// undefined = todavía se está revisando; null = no hay sesión.
export function useSesion() {
  const [sesion, setSesion] = useState<SesionTienda | null | undefined>(undefined);

  useEffect(() => {
    let vigente = true;
    const actualizar = () => leerSesion().then((s) => vigente && setSesion(s));

    actualizar();
    // Inicio o cierre de sesión en esta pestaña (correo, Google o registro) y token
    // renovado (por ejemplo, después de cambiar el nombre en Mi perfil)
    const dejarDeEscuchar = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedIn" || payload.event === "tokenRefresh") actualizar();
      if (payload.event === "signedOut" || payload.event === "tokenRefresh_failure") setSesion(null);
    });

    return () => {
      vigente = false;
      dejarDeEscuchar();
    };
  }, []);

  return sesion;
}
