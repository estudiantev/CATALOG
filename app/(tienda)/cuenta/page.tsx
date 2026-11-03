import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BotonCerrarSesion } from "@/components/tienda/boton-cerrar-sesion";
import { MarcoCuenta, botonCuenta, etiquetaCuenta } from "@/components/tienda/marco-cuenta";
import { leerPerfil, perfilDesdeSesion } from "@/lib/cuenta";
import { MEDIDAS, formatoFecha, formatoTelefono } from "@/lib/perfil";
import { esStaff } from "@/lib/permisos";
import { obtenerSesion } from "@/lib/sesion-servidor";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: { index: false, follow: false },
};

const formatoCm = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 1 });

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className={etiquetaCuenta}>{etiqueta}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

// Página privada: lee la sesión de las cookies en cada visita (por eso no se guarda en caché)
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
  const nombreCompleto = [perfil.nombre, perfil.apellido].filter(Boolean).join(" ");
  const medidas = [
    ...MEDIDAS.flatMap((m) => {
      const valor = perfil.medidas[m.campo];
      return valor === null ? [] : [{ etiqueta: m.etiqueta, texto: `${formatoCm.format(valor)} cm` }];
    }),
    ...(perfil.medidas.copa ? [{ etiqueta: "Copa", texto: perfil.medidas.copa }] : []),
  ];

  return (
    <MarcoCuenta titulo="Mi Cuenta">
      <p className="mt-4 text-center text-[18px]">{perfil.nombre ? `Hola, ${perfil.nombre}` : "Hola"}</p>
      {guardado && (
        <p role="status" className="mt-3 text-center text-[14px] leading-[20px] text-grafito">
          Tus datos se guardaron.
        </p>
      )}

      <dl className="mt-6 flex flex-col gap-4 border-t border-tinta pt-6 text-[16px] leading-[24px]">
        {nombreCompleto && <Dato etiqueta="Nombre">{nombreCompleto}</Dato>}
        <Dato etiqueta="Correo">
          <span className="break-all">{perfil.correo || "—"}</span>
        </Dato>
        {perfil.telefono && <Dato etiqueta="Celular">{formatoTelefono(perfil.telefono)}</Dato>}
        {perfil.nacimiento && <Dato etiqueta="Fecha de nacimiento">{formatoFecha(perfil.nacimiento)}</Dato>}
        <Dato etiqueta="Mis medidas">
          {medidas.length > 0 ? (
            <ul className="grid grid-cols-2 gap-x-3">
              {medidas.map((m) => (
                <li key={m.etiqueta}>
                  <span className="text-grafito">{m.etiqueta}:</span> {m.texto}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-grafito">Todavía no las registras.</span>
          )}
        </Dato>
      </dl>

      <div className="mt-8 flex flex-col items-center gap-3">
        <Link href="/cuenta/perfil" className={botonCuenta}>
          Editar mi perfil
        </Link>
        <BotonCerrarSesion />
        <Link href="/catalogo" className="mt-1 text-[15px] underline underline-offset-2">
          Ver catálogo
        </Link>
        {esStaff(sesion.grupos) && (
          <Link href="/admin" className="text-[15px] underline underline-offset-2">
            Ir al panel de administración
          </Link>
        )}
      </div>
    </MarcoCuenta>
  );
}
