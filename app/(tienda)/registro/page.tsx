import type { Metadata } from "next";
import { FormularioRegistro } from "@/components/tienda/formulario-registro";
import { MarcoCuenta } from "@/components/tienda/marco-cuenta";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default async function RegistroPage({
  searchParams,
}: {
  // ?confirmar=<correo>: retoma la confirmación de una cuenta ya registrada
  searchParams: Promise<{ confirmar?: string }>;
}) {
  const { confirmar } = await searchParams;

  return (
    <MarcoCuenta titulo="Crear Cuenta">
      <FormularioRegistro correoPorConfirmar={confirmar} />
    </MarcoCuenta>
  );
}
