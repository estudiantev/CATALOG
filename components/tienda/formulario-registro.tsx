"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { autoSignIn, confirmSignUp, resendSignUpCode, signUp } from "aws-amplify/auth";
import { botonCuenta, campoCuenta, errorCuenta } from "@/components/tienda/marco-cuenta";
import { mensajeErrorRegistro } from "@/lib/errores-auth";

// Registro de clientas: la cuenta se crea sin grupo (no da acceso al panel) y el
// trigger post-confirmation crea su perfil Customer al confirmar el correo
export function FormularioRegistro({ correoPorConfirmar }: { correoPorConfirmar?: string }) {
  const router = useRouter();
  const [paso, setPaso] = useState<"datos" | "codigo">(correoPorConfirmar ? "codigo" : "datos");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState(correoPorConfirmar ?? "");
  const [contrasena, setContrasena] = useState("");
  const [repetir, setRepetir] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);

  const usuario = correo.trim().toLowerCase();

  async function registrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) return setError("Escribe tu nombre.");
    if (!/^\S+@\S+\.\S+$/.test(usuario)) return setError("Escribe un correo válido.");
    if (contrasena !== repetir) return setError("Las contraseñas no coinciden.");

    setEnviando(true);
    try {
      const { nextStep } = await signUp({
        username: usuario,
        password: contrasena,
        options: {
          userAttributes: {
            email: usuario,
            given_name: nombre.trim(),
            ...(apellido.trim() && { family_name: apellido.trim() }),
          },
          // Al confirmar el código inicia sesión sin volver a pedir la contraseña
          autoSignIn: true,
        },
      });
      if (nextStep.signUpStep === "CONFIRM_SIGN_UP") setPaso("codigo");
      else router.push("/login?confirmada=1");
    } catch (err) {
      setError(mensajeErrorRegistro(err));
    } finally {
      setEnviando(false);
    }
  }

  async function confirmar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setAviso("");
    setEnviando(true);
    try {
      const { nextStep } = await confirmSignUp({ username: usuario, confirmationCode: codigo.trim() });
      if (nextStep.signUpStep === "COMPLETE_AUTO_SIGN_IN") {
        const { isSignedIn } = await autoSignIn();
        if (isSignedIn) {
          router.push("/");
          router.refresh();
          return;
        }
      }
      // Sin inicio automático (por ejemplo, al volver a confirmar desde el login)
      router.push("/login?confirmada=1");
    } catch (err) {
      setError(mensajeErrorRegistro(err));
    } finally {
      setEnviando(false);
    }
  }

  async function reenviarCodigo() {
    setError("");
    setAviso("");
    try {
      await resendSignUpCode({ username: usuario });
      setAviso("Te enviamos un código nuevo.");
    } catch (err) {
      setError(mensajeErrorRegistro(err));
    }
  }

  if (paso === "codigo") {
    return (
      <form onSubmit={confirmar} noValidate className="mx-auto mt-6 flex w-full max-w-74 flex-col items-center">
        <p className="text-center text-[16px] leading-[24px] text-grafito">
          Te enviamos un código a <strong className="font-medium text-tinta">{usuario}</strong>. Escríbelo para activar tu cuenta.
        </p>
        <label htmlFor="codigo" className="sr-only">Código de verificación</label>
        <input
          id="codigo"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="Código"
          required
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          className={`${campoCuenta} mt-5 text-center tracking-[0.3em]`}
        />
        {error && <p role="alert" className={`${errorCuenta} mt-4`}>{error}</p>}
        {aviso && <p className="mt-4 w-full text-center text-[14px] leading-[20px] text-grafito">{aviso}</p>}
        <button type="submit" disabled={enviando} className={`${botonCuenta} mt-5`}>
          {enviando ? "Confirmando…" : "Confirmar"}
        </button>
        <button type="button" onClick={reenviarCodigo} className="mt-3 cursor-pointer text-[15px] hover:underline">
          Reenviar código
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={registrar} noValidate className="mx-auto mt-6 flex w-full max-w-74 flex-col items-center">
      <label htmlFor="nombre" className="sr-only">Nombre</label>
      <input id="nombre" autoComplete="given-name" placeholder="Nombre" required value={nombre} onChange={(e) => setNombre(e.target.value)} className={campoCuenta} />
      <label htmlFor="apellido" className="sr-only">Apellido</label>
      <input id="apellido" autoComplete="family-name" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} className={`${campoCuenta} mt-3`} />
      <label htmlFor="correo" className="sr-only">Correo</label>
      <input id="correo" type="email" autoComplete="email" placeholder="Correo" required value={correo} onChange={(e) => setCorreo(e.target.value)} className={`${campoCuenta} mt-3`} />
      <label htmlFor="contrasena" className="sr-only">Contraseña</label>
      <input id="contrasena" type="password" autoComplete="new-password" placeholder="Contraseña" required value={contrasena} onChange={(e) => setContrasena(e.target.value)} className={`${campoCuenta} mt-3`} />
      <label htmlFor="repetir" className="sr-only">Repite la contraseña</label>
      <input id="repetir" type="password" autoComplete="new-password" placeholder="Repite la contraseña" required value={repetir} onChange={(e) => setRepetir(e.target.value)} className={`${campoCuenta} mt-3`} />
      <p className="mt-2 w-full text-[13px] leading-[18px] text-topo">
        Mínimo 8 caracteres, con mayúsculas, minúsculas, números y símbolos.
      </p>

      {error && <p role="alert" className={`${errorCuenta} mt-4`}>{error}</p>}

      <button type="submit" disabled={enviando} className={`${botonCuenta} mt-5`}>
        {enviando ? "Creando cuenta…" : "Crear cuenta"}
      </button>

      <p className="mt-3 text-[15px]">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="underline underline-offset-2">Inicia sesión</Link>
      </p>
    </form>
  );
}
