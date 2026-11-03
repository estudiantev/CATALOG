import Link from "next/link";
import { BotonCerrarSesion } from "./boton-cerrar-sesion";
import { margenCuenta } from "./estilos-cuenta";

const SECCIONES = [
  { id: "resumen", nombre: "Resumen", href: "/cuenta" },
  { id: "perfil", nombre: "Mi perfil", href: "/cuenta/perfil" },
] as const;

const enlace = "relative py-3.5 text-[15px] leading-[20px] font-medium";

// Franja superior del área de la clienta: el título de la página y las pestañas.
// El rosa es el de la portada; la pestaña activa se apoya sobre el borde inferior.
export function CabeceraCuenta({
  titulo,
  descripcion,
  seccion,
  staff = false,
}: {
  titulo: string;
  descripcion: string;
  seccion: (typeof SECCIONES)[number]["id"];
  staff?: boolean;
}) {
  return (
    <header className="border-b-2 border-tinta bg-[#e8cdc3]">
      {/* A todo el ancho: Cerrar sesión queda bajo los íconos del encabezado */}
      <div className={`${margenCuenta} pt-[clamp(36px,5vw,72px)]`}>
        <h1 className="text-[clamp(40px,5vw,72px)] leading-none font-light tracking-[-0.02em] break-words">{titulo}</h1>
        <p className="mt-3 max-w-[52ch] text-[17px] leading-[26px] text-grafito">{descripcion}</p>

        <nav aria-label="Mi cuenta" className="mt-[clamp(28px,3.6vw,48px)] flex flex-wrap items-center gap-x-7">
          {SECCIONES.map((s) => (
            <Link
              key={s.id}
              href={s.href}
              aria-current={s.id === seccion ? "page" : undefined}
              className={`${enlace} after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-tinta after:opacity-0 hover:after:opacity-30 aria-[current=page]:after:opacity-100`}
            >
              {s.nombre}
            </Link>
          ))}
          <span className="ml-auto flex flex-wrap items-center gap-x-6">
            {staff && (
              <Link href="/admin" className={`${enlace} font-normal underline-offset-4 hover:underline`}>
                Panel de administración
              </Link>
            )}
            <BotonCerrarSesion />
          </span>
        </nav>
      </div>
    </header>
  );
}
