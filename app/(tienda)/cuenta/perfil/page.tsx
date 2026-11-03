import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CabeceraCuenta } from "@/components/tienda/cabecera-cuenta";
import { contenedorCuenta, textoError } from "@/components/tienda/estilos-cuenta";
import { FormularioPerfil } from "@/components/tienda/formulario-perfil";
import { leerPerfil } from "@/lib/cuenta";
import { hoyEnPeru } from "@/lib/perfil";
import { esStaff } from "@/lib/permisos";
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
    <>
      <CabeceraCuenta
        titulo="Mi perfil"
        descripcion="Actualiza tus datos y tus medidas cuando cambien."
        seccion="perfil"
        staff={esStaff(sesion.grupos)}
      />

      <div className={`${contenedorCuenta} py-[clamp(36px,5vw,64px)]`}>
        {perfil ? (
          <FormularioPerfil perfil={perfil} customerId={sesion.id} nombreEnToken={sesion.nombre} hoy={hoyEnPeru()} />
        ) : (
          // Sin los datos guardados no se muestra el formulario: guardaría encima campos vacíos
          <div className="flex max-w-[52ch] flex-col items-start gap-4">
            <p role="alert" className={textoError}>
              No se pudieron cargar tus datos. Recarga la página o vuelve a intentarlo en unos minutos.
            </p>
            <Link href="/cuenta" className="text-[15px] underline underline-offset-4">
              Volver al resumen
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
