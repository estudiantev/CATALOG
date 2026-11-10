import Link from "next/link";
import { BotonCerrarSesion } from "./boton-cerrar-sesion";
import { margenCuenta } from "./estilos-cuenta";
import { RutaNavegacion } from "./ruta-navegacion";

const SECCIONES = [
  { id: "resumen", nombre: "Resumen", href: "/cuenta" },
  { id: "perfil", nombre: "Mi perfil", href: "/cuenta/perfil" },
] as const;

// Como Comprar / Alquilar en el detalle del producto: la actual en negro; las demás, azules al pasar
const pestana = (actual: boolean) =>
  `inline-flex min-h-11 items-center px-5 text-[15px] font-medium ${
    actual ? "bg-tinta text-white" : "bg-white text-tinta transition-colors duration-150 hover:bg-acento hover:text-white"
  }`;

// Parte de arriba del área de la clienta: la ruta, el título y las pestañas
export function CabeceraCuenta({
  titulo,
  descripcion,
  seccion,
}: {
  titulo: string;
  descripcion: string;
  seccion: (typeof SECCIONES)[number]["id"];
}) {
  return (
    <>
      <RutaNavegacion
        pasos={[
          { nombre: "Inicio", href: "/" },
          ...(seccion === "resumen" ? [{ nombre: "Mi cuenta" }] : [{ nombre: "Mi cuenta", href: "/cuenta" }, { nombre: "Mi perfil" }]),
        ]}
      />
      <header className={`flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pt-1 pb-6 ${margenCuenta}`}>
        <div className="min-w-0">
          <h1 className="text-[clamp(24px,2vw,28px)] leading-[1.15] font-medium tracking-[-0.01em] [overflow-wrap:anywhere]">{titulo}</h1>
          <p className="mt-1.5 max-w-[52ch] text-[15px] text-[#555555]">{descripcion}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label="Mi cuenta" className="flex">
            {SECCIONES.map((s) => (
              <Link key={s.id} href={s.href} aria-current={s.id === seccion ? "page" : undefined} className={pestana(s.id === seccion)}>
                {s.nombre}
              </Link>
            ))}
          </nav>
          <BotonCerrarSesion />
        </div>
      </header>
    </>
  );
}
