import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ComponentProps } from "react";
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

// La página de inicio las muestra con las letras y el degradado un 25 % más fuertes. El nombre
// baja lo justo para que su palabra más larga (--letras) entre sin partirse: cada letra de
// esta fuente ocupa cerca de 0.92 veces su tamaño. Una palabra enorme sí se parte.
const ESTILOS = {
  normal: {
    tarjeta: "",
    degradado: "from-black/70 via-black/20",
    ilustracion: "bottom-[170px]",
    modalidad: "text-[10px] leading-[15px]",
    nombre: "text-[26px]",
    descripcion: "text-[14px]",
    boton: "text-[10px]",
    flecha: 12,
  },
  grande: {
    tarjeta: "@container",
    degradado: "from-black/[0.875] via-black/25",
    ilustracion: "bottom-[212px]",
    modalidad: "text-[12.5px] leading-[19px]",
    nombre: "line-clamp-3 text-[clamp(20px,calc(100cqw/(var(--letras)*0.92)),32.5px)] wrap-anywhere",
    descripcion: "text-[17.5px] wrap-anywhere",
    boton: "text-[12.5px]",
    flecha: 15,
  },
};

export function TarjetaColeccion({
  href,
  nombre,
  modalidad,
  descripcion,
  foto,
  vestido,
  sizes,
  grande = false,
}: {
  href: string;
  nombre: string;
  modalidad?: string;
  descripcion: string;
  foto: { url: string } | null;
  vestido?: Ilustracion; // sin foto ni ilustración queda el fondo de color
  sizes: string;
  grande?: boolean;
}) {
  const estilo = ESTILOS[grande ? "grande" : "normal"];
  const letras = Math.max(...nombre.split(/\s+/).map((palabra) => palabra.length));
  return (
    <Link
      href={href}
      className={`group relative flex h-full min-h-[420px] flex-col items-start justify-end overflow-hidden bg-acento2 p-7 text-white transition-[filter] duration-200 hover:brightness-90 ${estilo.tarjeta}`}
    >
      {foto ? (
        <>
          <Image src={foto.url} alt="" fill unoptimized sizes={sizes} className="object-cover" />
          <span aria-hidden="true" className={`absolute inset-0 bg-linear-to-t to-transparent ${estilo.degradado}`} />
        </>
      ) : (
        vestido && (
          <span aria-hidden="true" className={`absolute inset-x-0 top-6 flex items-end justify-center ${estilo.ilustracion}`}>
            <Vestido {...vestido} />
          </span>
        )
      )}
      {modalidad && <span className={`relative font-semibold tracking-[0.16em] uppercase ${estilo.modalidad}`}>{modalidad}</span>}
      <span style={{ "--letras": letras } as CSSProperties} className={`relative mt-2 font-archivo leading-[1.02] font-black font-stretch-expanded tracking-[0.01em] uppercase ${estilo.nombre}`}>
        {nombre}
      </span>
      {/* La de una colección del panel puede ser larga: aquí va solo el comienzo */}
      {descripcion && <span className={`relative mt-2 line-clamp-3 leading-[1.4] ${estilo.descripcion}`}>{descripcion}</span>}
      <span
        className={`relative mt-3.5 inline-flex items-center gap-2 border border-white bg-white px-3 py-2 font-archivo font-bold tracking-[0.14em] text-tinta uppercase transition-[background-color,border-color,color,gap] duration-200 group-hover:gap-3 group-hover:border-acento group-hover:bg-acento group-hover:text-white ${estilo.boton}`}
      >
        Ver colección <Flecha tamano={estilo.flecha} />
      </span>
    </Link>
  );
}

// De Gala, De XV, Cortos o Floreados
export function TarjetaOcasion({ clave, ocasion, sizes, grande }: { clave: ClaveOcasion; ocasion: OcasionLista; sizes: string; grande?: boolean }) {
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
      grande={grande}
    />
  );
}
