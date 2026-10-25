import type { Metadata } from "next";
import { FormularioIngreso } from "@/components/tienda/formulario-ingreso";
import { MarcoCuenta } from "@/components/tienda/marco-cuenta";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmada?: string }>;
}) {
  const { confirmada } = await searchParams;

  return (
    <MarcoCuenta titulo="Iniciar Sesión">
      <FormularioIngreso aviso={confirmada ? "Tu cuenta está confirmada. Ya puedes iniciar sesión." : undefined} />
    </MarcoCuenta>
  );
}
