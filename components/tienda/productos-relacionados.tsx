import Link from "next/link";
import type { ProductoCatalogo } from "@/lib/catalogo";
import { formatoSoles } from "@/lib/productos";
import { resolverTarjeta } from "@/lib/variantes";
import { hoverBlanca } from "./estilos-inicio";
import { Flecha } from "./iconos";
import { FotosProducto } from "./tarjeta-producto";

// "También te puede gustar", al final del detalle de un producto
export function ProductosRelacionados({ productos, verMas }: { productos: ProductoCatalogo[]; verMas: string }) {
  // Sin filtros: la tarjeta muestra la primera variante con stock y el precio "desde"
  const tarjetas = productos.flatMap((producto) => {
    const datos = resolverTarjeta(producto, {});
    return datos ? [{ producto, ...datos }] : [];
  });
  if (!tarjetas.length) return null;

  return (
    <section aria-labelledby="titulo-relacionados" className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 px-[clamp(16px,3vw,32px)] py-3.5">
        <h2
          id="titulo-relacionados"
          className="border border-tinta bg-acento px-3.5 py-[3px] font-archivo text-[clamp(17px,5.4vw,20px)] leading-[1.25] font-extrabold font-stretch-expanded tracking-[0.02em] text-white uppercase"
        >
          También te puede gustar
        </h2>
        <Link href={verMas} className="inline-flex min-h-10 items-center gap-1.5 text-[14px] font-medium text-tinta underline underline-offset-3 transition-colors duration-150 hover:text-acento">
          Ver catálogo <Flecha tamano={14} />
        </Link>
      </div>
      <ul aria-label="Productos relacionados" className="grid grid-cols-[repeat(5,minmax(200px,1fr))] overflow-x-auto [scrollbar-width:thin]">
        {tarjetas.map(({ producto, variantId, precioVenta, precioAlquiler, desde, portada, hover }) => (
          <li key={producto.productId} className="min-w-0">
            <Link href={`/catalogo/${producto.productId}?v=${variantId}`} className="group flex h-full flex-col">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#f3f3f3]">
                <FotosProducto portada={portada} hover={hover} sizes="(min-width: 1000px) 20vw, 200px" />
                {/* Decorativo: todavía no hay lista de favoritos, así que no es un botón */}
                <span aria-hidden="true" className={`absolute top-2 right-2 flex size-[30px] items-center justify-center bg-white text-tinta ${hoverBlanca}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
                  </svg>
                </span>
              </div>
              <div className="flex flex-auto flex-col gap-[3px] px-3 pt-2.5 pb-3">
                {producto.marca && <span className="text-[10px] font-semibold tracking-[0.12em] text-[#555555] uppercase">{producto.marca}</span>}
                <h3 className="text-[14px] font-medium text-tinta group-hover:underline group-hover:underline-offset-3">{producto.nombre}</h3>
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
          </li>
        ))}
      </ul>
    </section>
  );
}
