import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
import type { ClaveOcasion } from "@/lib/contenido";
import { COLECCIONES } from "./datos";
import { cajaEsquina } from "./estilos-inicio";
import { Vestido } from "./vestido";

type Ilustracion = ComponentProps<typeof Vestido>;

// Las cuatro fijas: el nombre y el enlace salen de COLECCIONES (también arman el menú). Sin foto
// se ve la ilustración del vestido.
const FIJAS: Record<ClaveOcasion, { coleccion: (typeof COLECCIONES)[number]; vestido: Ilustracion }> = {
  gala: { coleccion: COLECCIONES[0], vestido: { forma: "sirena", color: "#1d1a1b", className: "h-[94%] w-auto" } },
  xv: { coleccion: COLECCIONES[1], vestido: { forma: "xv", color: "#e6b4b2", className: "mb-[2%] h-[90%] w-auto" } },
  cortos: { coleccion: COLECCIONES[2], vestido: { forma: "corto", color: "#a3243b", className: "h-[96%] w-auto" } },
  floreados: { coleccion: COLECCIONES[3], vestido: { forma: "floreado", color: "#bcd3e6", className: "h-[96%] w-auto" } },
};

// Un cuadro de la sección Colecciones de la página de inicio: la foto y, al centro, el nombre en
// una etiqueta blanca. Desde 1000 px la sección llena la pantalla: si el cuadro no entra, baja
// de alto (80 px son los márgenes de la sección).
export function CuadroColeccion({
  href,
  nombre,
  foto,
  vestido,
  sizes,
}: {
  href: string;
  nombre: string;
  foto: { url: string } | null;
  vestido?: Ilustracion; // sin foto ni ilustración queda el fondo gris
  sizes: string;
}) {
  return (
    <Link
      href={href}
      className="group relative block aspect-square overflow-hidden bg-[#f3f3f3] text-tinta min-[1000px]:max-h-[calc(100svh-var(--alto-marco)-80px)]"
    >
      {foto ? (
        <Image src={foto.url} alt="" fill unoptimized sizes={sizes} className="object-cover" />
      ) : (
        vestido && (
          <span aria-hidden="true" className="absolute inset-x-0 top-6 bottom-0 flex items-end justify-center">
            <Vestido {...vestido} />
          </span>
        )
      )}
      {/* Un nombre largo pasa a la línea siguiente en vez de salirse del cuadro */}
      <span
        className={`absolute top-1/2 left-1/2 w-max max-w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 px-6 py-[17px] text-center text-[18px] leading-[23px] break-words group-hover:underline group-hover:underline-offset-3 ${cajaEsquina}`}
      >
        {nombre}
      </span>
    </Link>
  );
}

// De Gala, De XV, Cortos o Floreados. En la página de inicio puede llevar otro título.
export function CuadroOcasion({ clave, titulo, foto, sizes }: { clave: ClaveOcasion; titulo: string; foto: { url: string } | null; sizes: string }) {
  const { coleccion, vestido } = FIJAS[clave];
  return <CuadroColeccion href={coleccion.href} nombre={titulo || coleccion.nombre} foto={foto} vestido={vestido} sizes={sizes} />;
}
