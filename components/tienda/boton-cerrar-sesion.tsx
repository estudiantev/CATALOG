"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "aws-amplify/auth";
import { botonSecundario, errorCuenta } from "@/components/tienda/marco-cuenta";

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
