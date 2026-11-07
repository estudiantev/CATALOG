import Link from "next/link";
import type { Foto } from "@/lib/catalogo";
import { formatoSoles } from "@/lib/productos";
import { hoverBlanca } from "./estilos-inicio";
import { FotosProducto } from "./tarjeta-producto";

// Tarjeta del carrusel de la página de inicio
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
    <Link href={href} className="group flex min-w-0 flex-auto flex-col border-r border-tinta">
      {/* Desde 1000 px llena el alto de la sección; más abajo, la forma vertical de un vestido */}
      <div className="relative aspect-[4/7] max-h-[720px] overflow-hidden bg-[#f0f0f0] transition-colors duration-200 group-hover:bg-[#e8e8e8] min-[1000px]:aspect-auto min-[1000px]:max-h-none min-[1000px]:min-h-[300px] min-[1000px]:flex-auto">
        <FotosProducto portada={portada} hover={hover} sizes={sizes} />
        {etiqueta && (
          <span className="absolute top-3 left-3 bg-[#fbd1da] px-2 py-[5px] text-[11px] leading-none font-semibold tracking-[0.08em] text-tinta uppercase">
            {etiqueta}
          </span>
        )}
        {/* Decorativo: todavía no hay lista de favoritos, así que no es un botón */}
        <span aria-hidden="true" className={`absolute top-2.5 right-2.5 flex size-8 items-center justify-center border border-tinta bg-white text-tinta ${hoverBlanca}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
          </svg>
        </span>
      </div>
      <div className="flex flex-none flex-col gap-1 px-3.5 pt-2.5 pb-3">
        <h3 className="truncate text-[13px] text-tinta group-hover:underline group-hover:underline-offset-3">{nombre}</h3>
        {/* RF-06: el menor precio entre las variantes. Venta y alquiler en una sola línea */}
        <p className="text-[11px] whitespace-nowrap text-[#555555] min-[700px]:text-[12px]">
          <span className="text-tinta">
            {desde && "Desde "}
            {formatoSoles.format(precioVenta)}
          </span>
          {" · "}
          Alquiler {desde && "desde "}
          {formatoSoles.format(precioAlquiler)}/día
        </p>
      </div>
    </Link>
  );
}
