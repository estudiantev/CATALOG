"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProductoCatalogo } from "@/lib/catalogo";
import {
  CLAVES,
  type Clave,
  FAMILIAS_COLOR,
  type Filtros,
  NOMBRES_CLAVE,
  formatoSoles,
  nombreOpcion,
  ordenarValores,
} from "@/lib/productos";
import { resolverTarjeta } from "@/lib/variantes";

// Filtros que solo muestran u ocultan productos (no cambian precio ni fotos)
type Generales = {
  texto: string;
  ocasion: string[];
  marca: string[];
  disenador: string[];
  caracteristicas: string[];
};
type CampoGeneral = Exclude<keyof Generales, "texto">;

export type FiltrosIniciales = { variante: Filtros; texto: string };

const GENERALES: { campo: CampoGeneral; nombre: string; valores: (p: ProductoCatalogo) => (string | null)[] }[] = [
  { campo: "ocasion", nombre: "Ocasión", valores: (p) => [p.ocasion] },
  { campo: "marca", nombre: "Marca", valores: (p) => [p.marca] },
  { campo: "disenador", nombre: "Diseñador", valores: (p) => [p.disenador] },
  { campo: "caracteristicas", nombre: "Características", valores: (p) => p.caracteristicas },
];

// De dónde sale cada filtro de variante en el resumen del producto
const DISPONIBLES: Record<Clave, (p: ProductoCatalogo) => string[]> = {
  talla: (p) => p.tallas,
  largo: (p) => p.largos,
  escote: (p) => p.escotes,
  manga: (p) => p.mangas,
  silueta: (p) => p.siluetas,
  color: (p) => p.familias,
};

// Minúsculas y sin tildes, para que "Floreado" encuentre "floreados"
const normalizar = (texto: string) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const unicos = (valores: (string | null)[]) => Array.from(new Set(valores.filter((v): v is string => Boolean(v))));

const etiqueta = "text-[12px] leading-[18px] font-semibold tracking-[0.1em] text-topo uppercase";

export function Catalogo({
  productos,
  filtrosIniciales,
}: {
  productos: ProductoCatalogo[];
  filtrosIniciales: FiltrosIniciales;
}) {
  const [filtros, setFiltros] = useState<Filtros>(filtrosIniciales.variante);
  const [generales, setGenerales] = useState<Generales>({
    texto: filtrosIniciales.texto,
    ocasion: [],
    marca: [],
    disenador: [],
    caracteristicas: [],
  });
  const [panelAbierto, setPanelAbierto] = useState(false);

  // RF-09: opciones del panel = unión de los valores con stock de todos los productos
  const opcionesVariante = useMemo(
    () =>
      CLAVES.map((clave) => ({
        clave,
        valores: ordenarValores(clave, unicos(productos.flatMap(DISPONIBLES[clave]))),
      })).filter((g) => g.valores.length > 0),
    [productos],
  );
  const opcionesGenerales = useMemo(
    () =>
      GENERALES.map((g) => ({ ...g, opciones: unicos(productos.flatMap(g.valores)).sort((a, b) => a.localeCompare(b)) })).filter(
        (g) => g.opciones.length > 0,
      ),
    [productos],
  );

  // RF-02 / RNF-01: filtrar no consulta la base de datos, todo es en memoria
  const tarjetas = useMemo(() => {
    const texto = normalizar(generales.texto.trim());
    return productos
      .filter(
        (p) =>
          (!texto || normalizar([p.nombre, p.textoBusqueda, p.marca, p.disenador].filter(Boolean).join(" ")).includes(texto)) &&
          (!generales.ocasion.length || (p.ocasion !== null && generales.ocasion.includes(p.ocasion))) &&
          (!generales.marca.length || (p.marca !== null && generales.marca.includes(p.marca))) &&
          (!generales.disenador.length || (p.disenador !== null && generales.disenador.includes(p.disenador))) &&
          (!generales.caracteristicas.length || p.caracteristicas.some((c) => generales.caracteristicas.includes(c))),
      )
      .flatMap((p) => {
        const tarjeta = resolverTarjeta(p, filtros);
        return tarjeta ? [{ producto: p, ...tarjeta }] : [];
      });
  }, [productos, filtros, generales]);

  const alternar = (lista: string[] = [], valor: string) =>
    lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
  const cantidadFiltros =
    Object.values(filtros).reduce((n, v) => n + (v?.length ?? 0), 0) +
    GENERALES.reduce((n, g) => n + generales[g.campo].length, 0) +
    (generales.texto.trim() ? 1 : 0);
  const limpiar = () => {
    setFiltros({});
    setGenerales({ texto: "", ocasion: [], marca: [], disenador: [], caracteristicas: [] });
  };

  const casilla = (marcada: boolean, onChange: () => void, contenido: React.ReactNode, clave: string) => (
    <label key={clave} className="flex cursor-pointer items-center gap-2.5 py-1 text-[15px]">
      <input type="checkbox" checked={marcada} onChange={onChange} className="size-4 accent-tinta" />
      {contenido}
    </label>
  );

  return (
    <div className="border-t-2 border-tinta lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-b-2 border-tinta bg-white lg:border-r-2 lg:border-b-0">
        <div className="flex items-center justify-between gap-3 px-[clamp(16px,3.6vw,54px)] py-4 lg:px-6">
          <button
            type="button"
            aria-expanded={panelAbierto}
            aria-controls="panel-filtros"
            onClick={() => setPanelAbierto((abierto) => !abierto)}
            className="cursor-pointer text-[14px] font-semibold tracking-[0.1em] uppercase lg:pointer-events-none"
          >
            Filtros{cantidadFiltros ? ` (${cantidadFiltros})` : ""}
          </button>
          {cantidadFiltros > 0 && (
            <button type="button" onClick={limpiar} className="cursor-pointer text-[14px] underline underline-offset-4">
              Limpiar
            </button>
          )}
        </div>
        <div id="panel-filtros" className={`${panelAbierto ? "block" : "hidden"} space-y-6 px-[clamp(16px,3.6vw,54px)] pb-6 lg:block lg:px-6`}>
          <label className="flex flex-col gap-1.5">
            <span className={etiqueta}>Buscar</span>
            <input
              type="search"
              placeholder="Gala, sirena, floreado…"
              value={generales.texto}
              onChange={(e) => setGenerales({ ...generales, texto: e.target.value })}
              className="h-11 border-2 border-tinta bg-white px-3 text-[15px] placeholder:text-topo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta"
            />
          </label>

          {opcionesVariante.map(({ clave, valores }) => (
            <fieldset key={clave}>
              <legend className={`${etiqueta} mb-1.5`}>{NOMBRES_CLAVE[clave]}</legend>
              {valores.map((valor) =>
                casilla(
                  filtros[clave]?.includes(valor) ?? false,
                  () => setFiltros({ ...filtros, [clave]: alternar(filtros[clave], valor) }),
                  <>
                    {clave === "color" && (
                      <span
                        aria-hidden="true"
                        className="size-3.5 flex-none rounded-full border border-tinta"
                        style={{ background: FAMILIAS_COLOR.find((f) => f.valor === valor)?.muestra }}
                      />
                    )}
                    {nombreOpcion(clave, valor)}
                  </>,
                  valor,
                ),
              )}
            </fieldset>
          ))}

          {opcionesGenerales.map(({ campo, nombre, opciones }) => (
            <fieldset key={campo}>
              <legend className={`${etiqueta} mb-1.5`}>{nombre}</legend>
              {opciones.map((valor) =>
                casilla(
                  generales[campo].includes(valor),
                  () => setGenerales({ ...generales, [campo]: alternar(generales[campo], valor) }),
                  valor,
                  valor,
                ),
              )}
            </fieldset>
          ))}
        </div>
      </aside>

      <div>
        <p aria-live="polite" className="px-[clamp(16px,3.6vw,54px)] py-3 text-[14px] text-topo lg:px-6">
          {tarjetas.length === 1 ? "1 producto" : `${tarjetas.length} productos`}
        </p>

        {tarjetas.length === 0 ? (
          <div className="border-t-2 border-tinta px-[clamp(16px,3.6vw,54px)] py-16 text-center">
            <p className="text-[18px]">
              {productos.length === 0 ? "Todavía no hay productos en esta categoría." : "No encontramos productos con esos filtros."}
            </p>
          </div>
        ) : (
          <ul aria-label="Productos" className="grid grid-cols-2 border-t-2 border-tinta md:grid-cols-3">
            {tarjetas.map(({ producto, variantId, precioVenta, precioAlquiler, desde, portada, hover }) => (
              <li key={producto.productId} className="border-r-2 border-b-2 border-tinta bg-white">
                {/* RF-10: abre el detalle con la combinación filtrada ya elegida */}
                <Link href={`/catalogo/${producto.productId}?v=${variantId}`} className="group flex h-full flex-col transition-colors hover:bg-arena active:bg-dorado">
                  <div className="relative aspect-[3/4] overflow-hidden bg-lino">
                    {portada ? (
                      <>
                        <Image
                          src={portada.url}
                          alt={portada.alt}
                          fill
                          unoptimized
                          sizes="(min-width: 768px) 33vw, 50vw"
                          className={`object-cover transition duration-[600ms] group-hover:scale-[1.04] ${hover ? "group-hover:opacity-0" : ""}`}
                        />
                        {/* RF-07: la contraportada aparece al pasar el cursor */}
                        {hover && (
                          <Image
                            src={hover.url}
                            alt=""
                            fill
                            unoptimized
                            sizes="(min-width: 768px) 33vw, 50vw"
                            className="object-cover opacity-0 transition duration-[600ms] group-hover:scale-[1.04] group-hover:opacity-100"
                          />
                        )}
                      </>
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-[13px] tracking-[0.1em] text-topo uppercase">
                        Sin foto
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 border-t-2 border-tinta px-4.5 pt-4 pb-5">
                    {producto.marca && <span className={etiqueta}>{producto.marca}</span>}
                    <span className="text-[18px] leading-[24px] group-hover:underline group-hover:underline-offset-4">{producto.nombre}</span>
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
