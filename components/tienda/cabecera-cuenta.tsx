import Link from "next/link";
import { BotonCerrarSesion } from "./boton-cerrar-sesion";
import { margenCuenta } from "./estilos-cuenta";
import { RutaNavegacion } from "./ruta-navegacion";

const SECCIONES = [
  { id: "resumen", nombre: "Resumen", href: "/cuenta" },
  { id: "perfil", nombre: "Mi perfil", href: "/cuenta/perfil" },
] as const;

// Como Comprar / Alquilar en el detalle del producto: la actual en negro; las demás, azules al pasar
const pestana = (actual: boolean, primera: boolean) =>
  `inline-flex min-h-11 items-center px-5 text-[15px] font-medium ${primera ? "" : "border-l border-tinta"} ${
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
      <header className={`flex flex-wrap items-end justify-between gap-x-8 gap-y-6 border-b border-tinta pt-10 pb-8 ${margenCuenta}`}>
        <div className="min-w-0">
          <h1 className="text-[clamp(32px,2.8vw,42px)] leading-[1.1] font-medium tracking-[-0.01em] [overflow-wrap:anywhere]">{titulo}</h1>
          <p className="mt-3 max-w-[52ch] text-[16px] text-[#555555]">{descripcion}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label="Mi cuenta" className="flex border border-tinta">
            {SECCIONES.map((s, i) => (
              <Link key={s.id} href={s.href} aria-current={s.id === seccion ? "page" : undefined} className={pestana(s.id === seccion, i === 0)}>
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
