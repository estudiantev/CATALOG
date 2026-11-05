import Image from "next/image";
import Link from "next/link";
import type { Foto } from "@/lib/catalogo";
import { formatoSoles } from "@/lib/productos";

const etiqueta = "text-[12px] leading-[18px] font-semibold tracking-[0.1em] text-topo uppercase";

// La portada y, al pasar el cursor, la contraportada. Va dentro de un marco `relative` del
// grupo (`group`) que forma la tarjeta.
export function FotosProducto({ portada, hover, sizes }: { portada: Foto | null; hover: Foto | null; sizes: string }) {
  if (!portada) {
    return <span className="absolute inset-0 flex items-center justify-center text-[13px] tracking-[0.1em] text-topo uppercase">Sin foto</span>;
  }
  return (
    <>
      <Image
        src={portada.url}
        alt={portada.alt}
        fill
        unoptimized
        sizes={sizes}
        className={`object-cover transition duration-[600ms] group-hover:scale-[1.04] ${hover ? "group-hover:opacity-0" : ""}`}
      />
      {/* RF-07: la contraportada aparece al pasar el cursor */}
      {hover && (
        <Image
          src={hover.url}
          alt=""
          fill
          unoptimized
          sizes={sizes}
          className="object-cover opacity-0 transition duration-[600ms] group-hover:scale-[1.04] group-hover:opacity-100"
        />
      )}
    </>
  );
}

// Tarjeta de un producto en el catálogo. Va dentro de un <li> que pone los bordes de la cuadrícula.
export function TarjetaProducto({
  href,
  nombre,
  marca,
  precioVenta,
  precioAlquiler,
  desde,
  portada,
  hover,
  sizes,
}: {
  href: string;
  nombre: string;
  marca: string | null;
  precioVenta: number;
  precioAlquiler: number;
  desde: boolean; // "Desde" solo si hay precios distintos
  portada: Foto | null;
  hover: Foto | null;
  sizes: string;
}) {
  return (
    <Link href={href} className="group flex h-full flex-col transition-colors hover:bg-arena active:bg-dorado">
      <div className="relative aspect-[3/4] overflow-hidden bg-lino">
        <FotosProducto portada={portada} hover={hover} sizes={sizes} />
      </div>
      <div className="flex flex-col gap-0.5 border-t-2 border-tinta px-4.5 pt-4 pb-5">
        {marca && <span className={etiqueta}>{marca}</span>}
        <span className="text-[18px] leading-[24px] group-hover:underline group-hover:underline-offset-4">{nombre}</span>
        {/* RF-06: el menor precio entre las variantes que cumplen los filtros */}
        <span className="text-[16px] leading-[24px]">
          {desde && "Desde "}
          {formatoSoles.format(precioVenta)}
        </span>
        <span className="text-[14px] leading-[20px] text-grafito">
          Alquiler {desde && "desde "}
          {formatoSoles.format(precioAlquiler)} por día
        </span>
      </div>
    </Link>
  );
}
