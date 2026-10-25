"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithRedirect } from "aws-amplify/auth";
import { errorCuenta } from "@/components/tienda/marco-cuenta";

// Lleva a Google a través de Cognito. Al volver (callbackUrls de amplify/auth/resource.ts),
// RetornoGoogle termina el inicio de sesión. Si es la primera vez, Cognito crea la cuenta
// sin grupo y el trigger post-confirmation crea su Customer.
export function BotonGoogle() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [redirigiendo, setRedirigiendo] = useState(false);

  async function continuarConGoogle() {
    setError("");
    setRedirigiendo(true);
    try {
      await signInWithRedirect({ provider: "Google" });
    } catch (err) {
      setRedirigiendo(false);
      if (err instanceof Error && err.name === "UserAlreadyAuthenticatedException") {
        router.push("/");
        return;
      }
      // Sin oauth en amplify_outputs.json o sin la URL de este sitio en callbackUrls
      setError("El inicio con Google no está disponible por ahora. Usa tu correo.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={continuarConGoogle}
        disabled={redirigiendo}
        className="mx-auto mt-6 flex h-[54px] w-full max-w-74 cursor-pointer items-center justify-center gap-3 border-2 border-tinta bg-white text-[18px] transition-colors hover:bg-arena disabled:cursor-wait disabled:opacity-70"
      >
        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        {redirigiendo ? "Abriendo Google…" : "Continuar con Google"}
      </button>
      {error && (
        <p role="alert" className={`${errorCuenta} mt-3`}>
          {error}
        </p>
      )}
    </>
  );
}
