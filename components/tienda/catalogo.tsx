"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ProductoCatalogo } from "@/lib/catalogo";
import { CATEGORIAS, FAMILIAS_COLOR, TALLAS, formatoSoles } from "@/lib/productos";

export type Filtros = {
  busqueda: string;
  categoria: string;
  familia: string;
  talla: string;
};

export const SIN_FILTROS: Filtros = { busqueda: "", categoria: "", familia: "", talla: "" };

// Minúsculas y sin tildes, para que "Floreado" encuentre "floreados"
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const campo =
  "h-12 border-2 border-tinta bg-white px-3 text-[15px] text-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta";
const etiqueta = "text-[12px] leading-[18px] font-semibold tracking-[0.1em] text-topo uppercase";

export function Catalogo({
  productos,
  filtrosIniciales,
}: {
  productos: ProductoCatalogo[];
  filtrosIniciales: Filtros;
}) {
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const cambiar = (campo: keyof Filtros, valor: string) => setFiltros({ ...filtros, [campo]: valor });

  // Solo se ofrecen las opciones que tienen algún producto (y la elegida, aunque no tenga)
  const categorias = CATEGORIAS.filter(
    (c) => c.valor === filtros.categoria || productos.some((p) => p.categoria === c.valor),
  );
  const familias = FAMILIAS_COLOR.filter(
    (f) => f.valor === filtros.familia || productos.some((p) => p.familias.includes(f.valor)),
  );
  const tallas = TALLAS.filter(
    (t) => t.valor === filtros.talla || productos.some((p) => p.tallas.includes(t.valor)),
  );

  const busqueda = normalizar(filtros.busqueda.trim());
  const visibles = productos.filter(
    (p) =>
      (!busqueda || normalizar(`${p.nombre} ${p.textoBusqueda}`).includes(busqueda)) &&
      (!filtros.categoria || p.categoria === filtros.categoria) &&
      (!filtros.familia || p.familias.some((f) => f === filtros.familia)) &&
      (!filtros.talla || p.tallas.some((t) => t === filtros.talla)),
  );
  const hayFiltros = Object.values(filtros).some(Boolean);

  return (
    <>
      <div role="search" className="flex flex-wrap items-end gap-3 border-t-2 border-tinta bg-white px-[clamp(16px,3.6vw,54px)] py-5">
        <label className="flex min-w-0 flex-[2_1_220px] flex-col gap-1.5">
          <span className={etiqueta}>Buscar</span>
          <input
            type="search"
            placeholder="Gala, sirena, floreado…"
            value={filtros.busqueda}
            onChange={(e) => cambiar("busqueda", e.target.value)}
            className={`${campo} placeholder:text-topo`}
          />
        </label>
        {[
          { nombre: "Categoría", campoFiltro: "categoria" as const, opciones: categorias, todas: "Todas" },
          { nombre: "Color", campoFiltro: "familia" as const, opciones: familias, todas: "Todos" },
          { nombre: "Talla", campoFiltro: "talla" as const, opciones: tallas, todas: "Todas" },
        ].map((filtro) => (
          <label key={filtro.campoFiltro} className="flex min-w-0 flex-[1_1_150px] flex-col gap-1.5">
            <span className={etiqueta}>{filtro.nombre}</span>
            <select
              value={filtros[filtro.campoFiltro]}
              onChange={(e) => cambiar(filtro.campoFiltro, e.target.value)}
              className={`${campo} cursor-pointer`}
            >
              <option value="">{filtro.todas}</option>
              {filtro.opciones.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>{opcion.nombre}</option>
              ))}
            </select>
          </label>
        ))}
        {hayFiltros && (
          <button
            type="button"
            onClick={() => setFiltros(SIN_FILTROS)}
            className="h-12 cursor-pointer border-2 border-tinta bg-white px-5 text-[14px] font-semibold tracking-[0.06em] uppercase transition-colors hover:bg-arena active:bg-dorado"
          >
            Limpiar
          </button>
        )}
      </div>

      <p aria-live="polite" className="border-t-2 border-tinta px-[clamp(16px,3.6vw,54px)] py-3 text-[14px] text-topo">
        {visibles.length === 1 ? "1 producto" : `${visibles.length} productos`}
      </p>

      {visibles.length === 0 ? (
        <div className="border-t-2 border-tinta px-[clamp(16px,3.6vw,54px)] py-16 text-center">
          <p className="text-[18px]">
            {productos.length === 0
              ? "Todavía no hay productos en el catálogo."
              : "No encontramos productos con esos filtros."}
          </p>
        </div>
      ) : (
        <ul aria-label="Productos" className="grid grid-cols-2 border-t-2 border-tinta md:grid-cols-3 xl:grid-cols-4">
          {visibles.map((producto) => (
            <li key={producto.productId} className="border-r-2 border-b-2 border-tinta bg-white">
              <Link href={`/catalogo/${producto.productId}`} className="group flex h-full flex-col transition-colors hover:bg-arena active:bg-dorado">
                <div className="relative aspect-[3/4] overflow-hidden bg-lino">
                  {producto.imagen ? (
                    <Image
                      src={producto.imagen.url}
                      alt={producto.imagen.alt}
                      fill
                      unoptimized
                      sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                      className="object-cover transition-transform duration-[600ms] group-hover:scale-[1.04]"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-[13px] tracking-[0.1em] text-topo uppercase">
                      Sin foto
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 border-t-2 border-tinta px-4.5 pt-4 pb-5">
                  <span className={etiqueta}>
                    {CATEGORIAS.find((c) => c.valor === producto.categoria)?.nombre ?? "Venta y alquiler"}
                  </span>
                  <span className="text-[18px] leading-[24px] group-hover:underline group-hover:underline-offset-4">{producto.nombre}</span>
                  <span className="text-[16px] leading-[24px] text-grafito">
                    Venta {formatoSoles.format(producto.precioVenta)} · Alquiler {formatoSoles.format(producto.precioAlquiler)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
