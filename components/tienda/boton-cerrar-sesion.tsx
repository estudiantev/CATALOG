"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "aws-amplify/auth";
import { hoverBlanca } from "./estilos-inicio";

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
    <span className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={cerrarSesion}
        disabled={saliendo}
        className={`inline-flex min-h-11 cursor-pointer items-center gap-2 bg-white px-4 font-archivo text-[12px] font-semibold tracking-[0.08em] text-tinta uppercase disabled:cursor-wait disabled:opacity-60 ${hoverBlanca}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
        {saliendo ? "Cerrando sesión…" : "Cerrar sesión"}
      </button>
      {error && (
        <span role="alert" className="text-[14px] leading-[20px] font-medium text-[#b3261e]">
          {error}
        </span>
      )}
    </span>
  );
}
