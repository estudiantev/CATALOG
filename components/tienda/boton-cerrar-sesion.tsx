"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "aws-amplify/auth";

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
      setError("No se cerró la sesión. Inténtalo de nuevo.");
    }
  }

  return (
    <span className="flex items-center gap-3">
      <button
        type="button"
        onClick={cerrarSesion}
        disabled={saliendo}
        className="cursor-pointer py-3.5 text-[15px] leading-[20px] underline-offset-4 hover:underline disabled:cursor-wait disabled:opacity-60"
      >
        {saliendo ? "Cerrando sesión…" : "Cerrar sesión"}
      </button>
      {error && (
        <span role="alert" className="text-[14px] leading-[20px] text-vino">
          {error}
        </span>
      )}
    </span>
  );
}
