import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CabeceraCuenta } from "@/components/tienda/cabecera-cuenta";
import { ResumenCuenta } from "@/components/tienda/resumen-cuenta";
import { leerPerfil, perfilDesdeSesion } from "@/lib/cuenta";
import { obtenerSesion } from "@/lib/sesion-servidor";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: { index: false, follow: false },
};

// Resumen de la cuenta. Lee la sesión de las cookies en cada visita (no se guarda en caché).
export default async function CuentaPage({
  searchParams,
}: {
  // ?guardado=1: viene de guardar Mi perfil
  searchParams: Promise<{ guardado?: string }>;
}) {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");

  const { guardado } = await searchParams;
  // Si no se pudo leer el Customer, al menos se muestran los datos del token
  const perfil = (await leerPerfil(sesion)) ?? perfilDesdeSesion(sesion);

  return (
    <>
      <CabeceraCuenta
        titulo={perfil.nombre ? `Hola, ${perfil.nombre}` : "Hola"}
        descripcion="Aquí están tus datos y tus medidas."
        seccion="resumen"
      />
      <ResumenCuenta perfil={perfil} guardado={Boolean(guardado)} />
    </>
  );
}
