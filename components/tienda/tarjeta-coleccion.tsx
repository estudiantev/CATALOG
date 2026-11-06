import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
import type { ClaveOcasion } from "@/lib/contenido";
import type { OcasionLista } from "@/lib/contenido-servidor";
import { COLECCIONES } from "./datos";
import { Flecha } from "./iconos";
import { Vestido } from "./vestido";

type Ilustracion = ComponentProps<typeof Vestido>;

// Los nombres y enlaces salen de COLECCIONES (también arman el menú); la modalidad, la
// descripción y la foto de cada una se editan en /admin/contenido. Sin foto se ve la ilustración.
const FIJAS: Record<ClaveOcasion, { coleccion: (typeof COLECCIONES)[number]; vestido: Ilustracion }> = {
  gala: { coleccion: COLECCIONES[0], vestido: { forma: "sirena", color: "#1d1a1b", className: "h-[94%] w-auto" } },
  xv: { coleccion: COLECCIONES[1], vestido: { forma: "xv", color: "#e6b4b2", className: "mb-[2%] h-[90%] w-auto" } },
  cortos: { coleccion: COLECCIONES[2], vestido: { forma: "corto", color: "#a3243b", className: "h-[96%] w-auto" } },
  floreados: { coleccion: COLECCIONES[3], vestido: { forma: "floreado", color: "#bcd3e6", className: "h-[96%] w-auto" } },
};

export function TarjetaColeccion({
  href,
  nombre,
  modalidad,
  descripcion,
  foto,
  vestido,
  sizes,
}: {
  href: string;
  nombre: string;
  modalidad?: string;
  descripcion: string;
  foto: { url: string } | null;
  vestido?: Ilustracion; // sin foto ni ilustración queda el fondo de color
  sizes: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex h-full min-h-[420px] flex-col items-start justify-end overflow-hidden bg-acento2 p-7 text-white transition-[filter] duration-200 hover:brightness-90"
    >
      {foto ? (
        <>
          <Image src={foto.url} alt="" fill unoptimized sizes={sizes} className="object-cover" />
          <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        </>
      ) : (
        vestido && (
          <span aria-hidden="true" className="absolute inset-x-0 top-6 bottom-[170px] flex items-end justify-center">
            <Vestido {...vestido} />
          </span>
        )
      )}
      {modalidad && <span className="relative text-[10px] leading-[15px] font-semibold tracking-[0.16em] uppercase">{modalidad}</span>}
      <span className="relative mt-2 font-archivo text-[26px] leading-[1.02] font-black font-stretch-expanded tracking-[0.01em] uppercase">{nombre}</span>
      {/* La de una colección del panel puede ser larga: aquí va solo el comienzo */}
      {descripcion && <span className="relative mt-2 line-clamp-3 text-[14px] leading-[1.4]">{descripcion}</span>}
      <span className="relative mt-3.5 inline-flex items-center gap-2 border border-white bg-white px-3 py-2 font-archivo text-[10px] font-bold tracking-[0.14em] text-tinta uppercase transition-[background-color,color,gap] duration-200 group-hover:gap-3 group-hover:bg-transparent group-hover:text-white">
        Ver colección <Flecha tamano={12} />
      </span>
    </Link>
  );
}

// De Gala, De XV, Cortos o Floreados
export function TarjetaOcasion({ clave, ocasion, sizes }: { clave: ClaveOcasion; ocasion: OcasionLista; sizes: string }) {
  const { coleccion, vestido } = FIJAS[clave];
  return (
    <TarjetaColeccion
      href={coleccion.href}
      nombre={coleccion.nombre}
      modalidad={ocasion.modalidad}
      descripcion={ocasion.descripcion}
      foto={ocasion.foto}
      vestido={vestido}
      sizes={sizes}
    />
  );
}
