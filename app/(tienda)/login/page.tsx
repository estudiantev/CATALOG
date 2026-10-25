import type { Metadata } from "next";
import { FormularioIngreso } from "@/components/tienda/formulario-ingreso";
import { MarcoCuenta } from "@/components/tienda/marco-cuenta";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmada?: string; google?: string }>;
}) {
  const { confirmada, google } = await searchParams;
  const aviso = confirmada
    ? "Tu cuenta está confirmada. Ya puedes iniciar sesión."
    : google
      ? "No se pudo iniciar sesión con Google. Inténtalo de nuevo o usa tu correo."
      : undefined;

  return (
    <MarcoCuenta titulo="Iniciar Sesión">
      <FormularioIngreso aviso={aviso} />
    </MarcoCuenta>
  );
}
