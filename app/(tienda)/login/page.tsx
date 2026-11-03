import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FormularioIngreso } from "@/components/tienda/formulario-ingreso";
import { MarcoCuenta } from "@/components/tienda/marco-cuenta";
import { destinoSeguro } from "@/lib/redireccion";
import { obtenerSesion } from "@/lib/sesion-servidor";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default async function LoginPage({
  searchParams,
}: {
  // ?siguiente=<ruta>: a dónde volver después de entrar (si no, a Mi cuenta)
  searchParams: Promise<{ confirmada?: string; google?: string; siguiente?: string | string[] }>;
}) {
  const { confirmada, google, siguiente } = await searchParams;
  const destino = destinoSeguro(siguiente);

  // Con la sesión ya iniciada no se muestra el formulario
  if (await obtenerSesion()) redirect(destino);

  const aviso = confirmada
    ? "Tu cuenta está confirmada. Ya puedes iniciar sesión."
    : google
      ? "No se pudo iniciar sesión con Google. Inténtalo de nuevo o usa tu correo."
      : undefined;

  return (
    <MarcoCuenta titulo="Iniciar Sesión">
      <FormularioIngreso aviso={aviso} destino={destino} />
    </MarcoCuenta>
  );
}
