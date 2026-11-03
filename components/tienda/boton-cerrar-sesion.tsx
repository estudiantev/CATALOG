"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "aws-amplify/auth";
import { errorCuenta } from "@/components/tienda/marco-cuenta";

const botonSecundario =
  "flex h-[46px] w-56 cursor-pointer items-center justify-center rounded-lg border-2 border-tinta bg-white text-[15px] font-semibold tracking-[0.06em] text-tinta uppercase transition-colors hover:bg-arena disabled:cursor-wait disabled:opacity-70";

// Borra las cookies de la sesión. Si entró con Google, Amplify pasa por el cierre de sesión
// de Cognito y vuelve a la portada (logoutUrls de amplify/auth/resource.ts).
export function BotonCerrarSesion() {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);
  const [error, setError] = useState("");

  async function cerrarSesion() {
    setError("");
    setSaliendo(true);
    try {
      await signOut();
      // replace: el botón Atrás no vuelve a mostrar Mi cuenta
      router.replace("/");
      router.refresh();
    } catch {
      setSaliendo(false);
      setError("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    }
  }

  return (
    <>
      <button type="button" onClick={cerrarSesion} disabled={saliendo} className={botonSecundario}>
        {saliendo ? "Cerrando sesión…" : "Cerrar sesión"}
      </button>
      {error && (
        <p role="alert" className={errorCuenta}>
          {error}
        </p>
      )}
    </>
  );
}
