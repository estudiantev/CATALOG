import Link from "next/link";
import type { Foto } from "@/lib/catalogo";
import { formatoSoles } from "@/lib/productos";
import { FotosProducto } from "./tarjeta-producto";

// Tarjeta del carrusel de la página de inicio: la foto con su etiqueta y, debajo, el nombre, el
// alquiler (en gris) y la venta. Ocupa las dos filas del carrusel (fotos y textos) con subgrid.
export function TarjetaDestacado({
  href,
  nombre,
  precioVenta,
  precioAlquiler,
  desde,
  portada,
  hover,
  etiqueta,
  sizes,
}: {
  href: string;
  nombre: string;
  precioVenta: number;
  precioAlquiler: number;
  desde: boolean; // "Desde" solo si hay precios distintos
  portada: Foto | null;
  hover: Foto | null;
  etiqueta?: string; // se escribe en el panel, junto al producto elegido
  sizes: string;
}) {
  return (
    <Link href={href} className="group row-span-2 grid grid-rows-subgrid text-tinta">
      {/* Desde 1000 px la foto mide lo que le deja la fila; más abajo, su proporción */}
      <div className="relative aspect-[447/541] overflow-hidden bg-[#f7f7f7] min-[1000px]:aspect-auto">
        <FotosProducto portada={portada} hover={hover} sizes={sizes} />
        {etiqueta && (
          <span className="absolute top-0 left-0 bg-[#fbd1da] px-2.5 font-mono text-[14px] leading-[30px] tracking-[0.04em] uppercase">{etiqueta}</span>
        )}
      </div>
      <div className="pt-4">
        <h3 className="text-[17px] leading-[25px] group-hover:underline group-hover:underline-offset-3">{nombre}</h3>
        {/* RF-06: el menor precio entre las variantes */}
        {precioAlquiler > 0 && (
          <p className="text-[17px] leading-[25px] text-[#666666]">
            Alquiler {desde && "desde "}
            {formatoSoles.format(precioAlquiler)} por día
          </p>
        )}
        {precioVenta > 0 && (
          <p className="mt-1 text-[17px] leading-[25px]">
            {desde && "Desde "}
            {formatoSoles.format(precioVenta)}
          </p>
        )}
      </div>
    </Link>
  );
}
