import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FormularioRegistro } from "@/components/tienda/formulario-registro";
import { MarcoCuenta } from "@/components/tienda/marco-cuenta";
import { destinoSeguro } from "@/lib/redireccion";
import { obtenerSesion } from "@/lib/sesion-servidor";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default async function RegistroPage({
  searchParams,
}: {
  // ?confirmar=<correo>: retoma la confirmación de una cuenta ya registrada
  // ?siguiente=<ruta>: a dónde ir después de crear la cuenta (si no, a Mi cuenta)
  searchParams: Promise<{ confirmar?: string; siguiente?: string | string[] }>;
}) {
  const { confirmar, siguiente } = await searchParams;
  const destino = destinoSeguro(siguiente);

  // Con la sesión ya iniciada no tiene sentido crear otra cuenta
  if (await obtenerSesion()) redirect(destino);

  return (
    <MarcoCuenta titulo="Crear Cuenta">
      <FormularioRegistro correoPorConfirmar={confirmar} destino={destino} />
    </MarcoCuenta>
  );
}
