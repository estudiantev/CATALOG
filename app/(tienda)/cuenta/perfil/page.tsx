import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FormularioPerfil } from "@/components/tienda/formulario-perfil";
import { MarcoCuenta, errorCuenta } from "@/components/tienda/marco-cuenta";
import { leerPerfil } from "@/lib/cuenta";
import { hoyEnPeru } from "@/lib/perfil";
import { enlaceCuenta } from "@/lib/redireccion";
import { obtenerSesion } from "@/lib/sesion-servidor";

export const metadata: Metadata = {
  title: "Mi perfil",
  robots: { index: false, follow: false },
};

// Gestión del perfil (Customer): nombre, apellido, celular, fecha de nacimiento y medidas
export default async function PerfilPage() {
  const sesion = await obtenerSesion();
  if (!sesion) redirect(enlaceCuenta("/login", "/cuenta/perfil"));

  const perfil = await leerPerfil(sesion);

  return (
    <MarcoCuenta titulo="Mi Perfil">
      {perfil ? (
        <FormularioPerfil perfil={perfil} customerId={sesion.id} nombreEnToken={sesion.nombre} hoy={hoyEnPeru()} />
      ) : (
        // Sin los datos guardados no se muestra el formulario: guardaría encima campos vacíos
        <div className="mt-6 flex flex-col items-center gap-4">
          <p role="alert" className={errorCuenta}>
            No pudimos cargar tus datos. Recarga la página o inténtalo en unos minutos.
          </p>
          <Link href="/cuenta" className="text-[15px] underline underline-offset-2">
            Volver a Mi cuenta
          </Link>
        </div>
      )}
    </MarcoCuenta>
  );
}
