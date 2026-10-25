"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "aws-amplify/auth";
import { mensajeErrorIngreso } from "@/lib/errores-auth";

const campo =
  "h-[46px] w-full border border-tinta bg-white px-3 text-[16px] text-tinta placeholder:text-topo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta";

export function FormularioIngreso() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function iniciarSesion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: correo.trim().toLowerCase(),
        password: contrasena,
      });
      if (isSignedIn) {
        router.push("/");
        router.refresh();
        return;
      }
      if (nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        setError("Tu cuenta tiene una contraseña temporal. Ingresa desde el panel de administración para cambiarla.");
      } else if (nextStep.signInStep === "CONFIRM_SIGN_UP") {
        setError("Tu cuenta aún no está confirmada. Revisa el código que te enviamos por correo.");
      } else {
        setError("Tu cuenta necesita un paso adicional que todavía no está disponible.");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "UserAlreadyAuthenticatedException") {
        router.push("/");
        return;
      }
      setError(mensajeErrorIngreso(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex w-full max-w-95 flex-col items-center gap-6">
      <div className="w-full border border-tinta px-6 pt-10 pb-8">
        <h1 className="text-center font-display text-[44px] leading-[1.1] font-bold text-tinta">
          Iniciar Sesión
        </h1>

        {/* Solo visual: el ingreso con Google se conectará más adelante */}
        <button type="button" className="mx-auto mt-6 flex h-[54px] w-full max-w-74 cursor-pointer items-center justify-center border-2 border-tinta bg-white text-[18px] transition-colors hover:bg-arena">
          Continuar con Google
        </button>

        <hr className="mt-6 border-tinta" />

        <form onSubmit={iniciarSesion} noValidate className="mx-auto mt-6 flex w-full max-w-74 flex-col items-center">
          <p className="text-[18px]">Continuar con Correo</p>
          <label htmlFor="correo" className="sr-only">Correo</label>
          <input
            id="correo"
            type="email"
            autoComplete="email"
            placeholder="Correo"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className={`${campo} mt-4`}
          />
          <label htmlFor="contrasena" className="sr-only">Contraseña</label>
          <input
            id="contrasena"
            type="password"
            autoComplete="current-password"
            placeholder="Contraseña"
            required
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className={`${campo} mt-3`}
          />

          {/* Pendiente: recuperación de contraseña */}
          <a href="#" className="mt-4 text-[15px] hover:underline">
            ¿Olvidaste tu contraseña?
          </a>

          {error && (
            <p role="alert" className="mt-4 w-full text-center text-[14px] leading-[20px] text-vino">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="mt-5 flex h-[46px] w-56 cursor-pointer items-center justify-center rounded-lg bg-tinta text-[15px] font-semibold tracking-[0.06em] text-white uppercase transition-colors hover:bg-grafito disabled:cursor-wait disabled:opacity-70"
          >
            {enviando ? "Ingresando…" : "Iniciar sesión"}
          </button>

          {/* Pendiente: registro de clientas */}
          <a href="#" className="mt-3 text-[15px] hover:underline">
            Crear cuenta
          </a>
        </form>
      </div>

      <p className="text-[15px]">
        <Link href="#" className="underline underline-offset-2">Términos</Link>
        {" y "}
        <Link href="#" className="underline underline-offset-2">Aviso de privacidad</Link>
      </p>
    </div>
  );
}
