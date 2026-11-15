import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
import { Flecha } from "./iconos";
import { Vestido } from "./vestido";

type Ilustracion = ComponentProps<typeof Vestido>;

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
      <span className="relative mt-3.5 inline-flex items-center gap-2 border border-white bg-white px-3 py-2 font-archivo text-[10px] font-bold tracking-[0.14em] text-tinta uppercase transition-[background-color,border-color,color,gap] duration-200 group-hover:gap-3 group-hover:bg-acento group-hover:text-white">
        Ver colección <Flecha tamano={12} />
      </span>
    </Link>
  );
}
