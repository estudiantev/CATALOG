"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "aws-amplify/auth";
import { BotonGoogle } from "@/components/tienda/boton-google";
import { botonCuenta, campoCuenta, errorCuenta } from "@/components/tienda/marco-cuenta";
import { mensajeErrorIngreso } from "@/lib/errores-auth";

export function FormularioIngreso({ aviso }: { aviso?: string }) {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  // Cuenta registrada que aún no confirmó su correo: se le ofrece terminar el registro
  const [porConfirmar, setPorConfirmar] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function iniciarSesion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPorConfirmar("");
    setEnviando(true);
    const usuario = correo.trim().toLowerCase();
    try {
      const { isSignedIn, nextStep } = await signIn({ username: usuario, password: contrasena });
      if (isSignedIn) {
        router.push("/");
        router.refresh();
        return;
      }
      if (nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        setError("Tu cuenta tiene una contraseña temporal. Ingresa desde el panel de administración para cambiarla.");
      } else if (nextStep.signInStep === "CONFIRM_SIGN_UP") {
        setPorConfirmar(usuario);
      } else {
        setError("Tu cuenta necesita un paso adicional que todavía no está disponible.");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "UserAlreadyAuthenticatedException") {
        router.push("/");
        return;
      }
      if (err instanceof Error && err.name === "UserNotConfirmedException") {
        setPorConfirmar(usuario);
        return;
      }
      setError(mensajeErrorIngreso(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <BotonGoogle />

      <hr className="mt-6 border-tinta" />

      <form onSubmit={iniciarSesion} noValidate className="mx-auto mt-6 flex w-full max-w-74 flex-col items-center">
        <p className="text-[18px]">Continuar con Correo</p>
        {aviso && <p className="mt-3 w-full text-center text-[14px] leading-[20px] text-grafito">{aviso}</p>}
        <label htmlFor="correo" className="sr-only">Correo</label>
        <input
          id="correo"
          type="email"
          autoComplete="email"
          placeholder="Correo"
          required
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className={`${campoCuenta} mt-4`}
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
          className={`${campoCuenta} mt-3`}
        />

        {/* Pendiente: recuperación de contraseña */}
        <a href="#" className="mt-4 text-[15px] hover:underline">
          ¿Olvidaste tu contraseña?
        </a>

        {error && (
          <p role="alert" className={`${errorCuenta} mt-4`}>
            {error}
          </p>
        )}
        {porConfirmar && (
          <p role="alert" className={`${errorCuenta} mt-4`}>
            Tu cuenta aún no está confirmada.{" "}
            <Link href={`/registro?confirmar=${encodeURIComponent(porConfirmar)}`} className="font-semibold underline">
              Confirmar mi correo
            </Link>
          </p>
        )}

        <button type="submit" disabled={enviando} className={`${botonCuenta} mt-5`}>
          {enviando ? "Ingresando…" : "Iniciar sesión"}
        </button>

        <Link href="/registro" className="mt-3 text-[15px] hover:underline">
          Crear cuenta
        </Link>
      </form>
    </>
  );
}
