import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BotonCerrarSesion } from "@/components/tienda/boton-cerrar-sesion";
import { MarcoCuenta, botonCuenta } from "@/components/tienda/marco-cuenta";
import { leerPerfil } from "@/lib/cuenta";
import { esStaff } from "@/lib/permisos";
import { obtenerSesion } from "@/lib/sesion-servidor";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: { index: false, follow: false },
};

const etiqueta = "text-[13px] leading-[18px] font-semibold tracking-[0.16em] text-topo uppercase";

// Página privada: lee la sesión de las cookies en cada visita (por eso no se guarda en caché)
export default async function CuentaPage() {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");

  const perfil = await leerPerfil(sesion);
  const nombreCompleto = [perfil.nombre, perfil.apellido].filter(Boolean).join(" ");

  return (
    <MarcoCuenta titulo="Mi Cuenta">
      <p className="mt-4 text-center text-[18px]">{perfil.nombre ? `Hola, ${perfil.nombre}` : "Hola"}</p>

      <dl className="mt-6 flex flex-col gap-4 border-t border-tinta pt-6 text-[16px] leading-[24px]">
        {nombreCompleto && (
          <div>
            <dt className={etiqueta}>Nombre</dt>
            <dd className="mt-1">{nombreCompleto}</dd>
          </div>
        )}
        <div>
          <dt className={etiqueta}>Correo</dt>
          <dd className="mt-1 break-all">{perfil.correo || "—"}</dd>
        </div>
        {perfil.telefono && (
          <div>
            <dt className={etiqueta}>Teléfono</dt>
            <dd className="mt-1">{perfil.telefono}</dd>
          </div>
        )}
      </dl>

      <div className="mt-8 flex flex-col items-center gap-3">
        <Link href="/catalogo" className={botonCuenta}>
          Ver catálogo
        </Link>
        <BotonCerrarSesion />
        {esStaff(sesion.grupos) && (
          <Link href="/admin" className="mt-1 text-[15px] underline underline-offset-2">
            Ir al panel de administración
          </Link>
        )}
      </div>
    </MarcoCuenta>
  );
}
