import Link from "next/link";
import type { Foto } from "@/lib/catalogo";
import { formatoSoles } from "@/lib/productos";
import { FotosProducto } from "./tarjeta-producto";

// Tarjeta compacta de la cuadrícula de la página de inicio
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
    <Link href={href} className="group flex h-full min-w-0 flex-col border-r border-tinta">
      {/* Desde 1000 px llena el alto de la sección; más abajo, la forma vertical de un vestido */}
      <div className="relative aspect-[2/3] max-h-[640px] min-h-[150px] flex-auto overflow-hidden bg-[#f3f3f3] min-[1000px]:aspect-auto min-[1000px]:max-h-none">
        <FotosProducto portada={portada} hover={hover} sizes={sizes} />
        {etiqueta && (
          <span className={`absolute top-2.5 left-2.5 px-1.5 py-1 text-[10px] leading-none font-semibold tracking-[0.08em] text-white uppercase ${etiqueta.toLowerCase() === "nuevo" ? "bg-acento" : "bg-acento2"}`}>
            {etiqueta}
          </span>
        )}
        {/* Decorativo: todavía no hay lista de favoritos, así que no es un botón */}
        <span aria-hidden="true" className="absolute top-2 right-2 flex size-[30px] items-center justify-center border border-tinta bg-white text-tinta transition-colors duration-150 hover:border-acento2 hover:bg-acento2 hover:text-white">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
          </svg>
        </span>
      </div>
      <div className="flex flex-none flex-col gap-[3px] border-t border-tinta px-3 pt-2.5 pb-3">
        <h3 className="truncate text-[13px] font-medium text-tinta group-hover:underline group-hover:underline-offset-3">{nombre}</h3>
        {/* RF-06: el menor precio entre las variantes */}
        <span className="text-[12px] text-[#555555]">
          {desde && "Desde "}
          {formatoSoles.format(precioVenta)}
        </span>
        <span className="text-[12px] text-[#555555]">
          Alquiler {desde && "desde "}
          {formatoSoles.format(precioAlquiler)} por día
        </span>
      </div>
    </Link>
  );
}
