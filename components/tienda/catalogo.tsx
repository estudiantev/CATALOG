"use client";

import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import type { Foto, ProductoCatalogo } from "@/lib/catalogo";
import { CATEGORIAS, type Categoria, type Clave, FAMILIAS_COLOR, type Filtros, NOMBRES_CLAVE, formatoSoles, nombreOpcion, ordenarValores } from "@/lib/productos";
import { resolverTarjeta } from "@/lib/variantes";
import { botonAzul, hoverBlanca } from "./estilos-inicio";
import { RutaNavegacion } from "./ruta-navegacion";
import { FotosProducto } from "./tarjeta-producto";

export type Modo = "todo" | "compra" | "alquiler";
// generales: los filtros que no son de variante, como la ocasión (?ocasion= del menú)
export type FiltrosIniciales = { variante: Filtros; generales?: Partial<Record<"ocasion", string[]>>; texto: string; modo: Modo };

const MODOS: { valor: Modo; nombre: string }[] = [
  { valor: "todo", nombre: "Todo" },
  { valor: "compra", nombre: "Comprar" },
  { valor: "alquiler", nombre: "Alquilar" },
];

const ORDENES = [
  { valor: "novedades", nombre: "Novedades" },
  { valor: "precio-asc", nombre: "Precio: de menor a mayor" },
  { valor: "precio-desc", nombre: "Precio: de mayor a menor" },
  { valor: "az", nombre: "Nombre: A a Z" },
  { valor: "za", nombre: "Nombre: Z a A" },
] as const;
type Orden = (typeof ORDENES)[number]["valor"];

// "Cargar más" suma de a una fila de 4, tres veces
const POR_PAGINA = 12;

// Filtros que solo muestran u ocultan productos (no cambian el precio ni las fotos)
type CampoGeneral = "ocasion" | "marca" | "disenador" | "material" | "caracteristicas";
const GENERALES: { id: CampoGeneral; nombre: string; valores: (p: ProductoCatalogo) => (string | null)[] }[] = [
  { id: "ocasion", nombre: "Ocasiones", valores: (p) => [p.ocasion] },
  { id: "marca", nombre: "Marcas", valores: (p) => [p.marca] },
  { id: "disenador", nombre: "Diseñadores", valores: (p) => [p.disenador] },
  { id: "material", nombre: "Materiales", valores: (p) => [p.material] },
  { id: "caracteristicas", nombre: "Etiquetas", valores: (p) => p.caracteristicas },
];
// Los de variante, en el orden del diseño: la talla en botones y el color al final, con su muestra
const DE_VARIANTE: Clave[] = ["talla", "largo", "escote", "manga", "silueta", "color"];

type IdGrupo = CampoGeneral | Clave;
type Elegidos = Partial<Record<IdGrupo, string[]>>;
type TipoGrupo = "lista" | "botones" | "colores";
type Grupo = { id: IdGrupo; nombre: string; tipo: TipoGrupo; opciones: { valor: string; nombre: string; cantidad: number }[] };

// Minúsculas y sin tildes, para que "Floreado" encuentre "floreados"
const normalizar = (texto: string) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const unicos = (valores: (string | null | undefined)[]) => Array.from(new Set(valores.filter((v): v is string => Boolean(v))));
const muestra = (familia: string) => FAMILIAS_COLOR.find((f) => f.valor === familia)?.muestra ?? "transparent";
const nombreDe = (id: IdGrupo, valor: string) => ((DE_VARIANTE as string[]).includes(id) ? nombreOpcion(id as Clave, valor) : valor);

// Con la modalidad elegida solo cuentan las variantes que se venden (o se alquilan)
function conModo(p: ProductoCatalogo, modo: Modo): ProductoCatalogo {
  if (modo === "todo") return p;
  return { ...p, variantes: p.variantes.filter((v) => (modo === "compra" ? v.precioVenta > 0 : v.precioAlquiler > 0)) };
}

const caja = "border border-tinta";
const boton = (elegido: boolean) =>
  `${caja} ${elegido ? "bg-tinta text-white" : `cursor-pointer bg-white text-tinta ${hoverBlanca}`}`;

type Tarjeta = NonNullable<ReturnType<typeof resolverTarjeta<Foto>>> & {
  producto: ProductoCatalogo;
  colores: string[];
  color?: string;
};

function TarjetaCatalogo({ tarjeta, onColor }: { tarjeta: Tarjeta; onColor: (productId: string, color: string) => void }) {
  const { producto, variantId, precioVenta, precioAlquiler, desde, portada, hover, colores, color } = tarjeta;
  // RF-10: abre el detalle con la combinación filtrada (y el color elegido) ya elegida
  const href = `/catalogo/${producto.productId}?v=${variantId}`;
  return (
    <li className="group/tarjeta flex min-w-0 flex-col border-r border-b border-tinta">
      {/* La foto lleva al mismo lugar que el nombre: para el lector de pantalla basta con uno */}
      <Link href={href} tabIndex={-1} aria-hidden="true" className="group relative block aspect-[3/4] overflow-hidden bg-[#f3f3f3]">
        <FotosProducto portada={portada} hover={hover} sizes="(min-width: 1200px) 25vw, (min-width: 900px) 33vw, 50vw" />
        {/* Decorativo: todavía no hay lista de favoritos, así que no es un botón */}
        <span className={`absolute top-2 right-2 flex size-[30px] items-center justify-center border border-tinta bg-white text-tinta ${hoverBlanca}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
          </svg>
        </span>
      </Link>
      <div className="flex flex-auto flex-col gap-1 border-t border-tinta px-3.5 pt-3 pb-3.5">
        <h3 className="text-[15px] font-medium [overflow-wrap:anywhere]">
          <Link href={href} className="group-hover/tarjeta:underline group-hover/tarjeta:underline-offset-3">
            {producto.nombre}
          </Link>
        </h3>
        {/* RF-06: el menor precio entre las variantes que cumplen los filtros */}
        <p className="flex flex-wrap gap-x-3.5 gap-y-0.5 text-[13px]">
          {/* En una tarjeta angosta se parten en dos líneas, pero el precio va siempre junto */}
          {precioVenta > 0 && (
            <span>
              <span className="font-semibold text-acento">Compra</span> {desde && "desde "}
              <span className="whitespace-nowrap">{formatoSoles.format(precioVenta)}</span>
            </span>
          )}
          {precioAlquiler > 0 && (
            <span>
              <span className="font-semibold text-acento2">Alquiler</span> {desde && "desde "}
              <span className="whitespace-nowrap">{formatoSoles.format(precioAlquiler)}</span> por día
            </span>
          )}
        </p>
        {colores.length > 0 && (
          <div role="group" aria-label={`Colores de ${producto.nombre}`} className="mt-auto flex flex-wrap pt-2.5">
            {colores.map((c) => {
              const elegido = c === color;
              const claro = c === "WHITE" || c === "IVORY";
              return (
                <button
                  key={c}
                  type="button"
                  aria-label={nombreOpcion("color", c)}
                  title={nombreOpcion("color", c)}
                  aria-pressed={elegido}
                  onClick={() => onColor(producto.productId, c)}
                  className={`size-[34px] cursor-pointer focus-visible:-outline-offset-2 ${
                    elegido ? "shadow-[inset_0_0_0_2px_#ffffff,inset_0_0_0_3px_#111111]" : claro ? "shadow-[inset_0_0_0_1px_#bdbdbd]" : ""
                  }`}
                  style={{ background: muestra(c) }}
                />
              );
            })}
          </div>
        )}
      </div>
    </li>
  );
}

// El catálogo de una categoría (/catalogo) o los productos de una colección (/coleccion/…).
// Los filtros van arriba de los productos, así la lista usa todo el ancho. Con `categoria` lleva
// su título; `encabezado` va entre la ruta y los filtros (la portada de la colección).
export function Catalogo({
  productos,
  ruta,
  categoria,
  encabezado,
  filtrosIniciales = { variante: {}, texto: "", modo: "todo" },
}: {
  productos: ProductoCatalogo[];
  ruta: { nombre: string; href?: string }[];
  categoria?: Categoria;
  encabezado?: ReactNode;
  filtrosIniciales?: FiltrosIniciales;
}) {
  const actual = CATEGORIAS.find((c) => c.valor === categoria);
  const [modo, setModo] = useState<Modo>(filtrosIniciales.modo);
  const [texto, setTexto] = useState(filtrosIniciales.texto);
  const [elegidos, setElegidos] = useState<Elegidos>(() => ({ ...filtrosIniciales.variante, ...filtrosIniciales.generales }));
  const [orden, setOrden] = useState<Orden>("novedades");
  const [limite, setLimite] = useState(POR_PAGINA);
  const [colorDe, setColorDe] = useState<Record<string, string>>({}); // productId → color elegido en su tarjeta
  // El grupo cuyas opciones se ven debajo de la fila de filtros (uno a la vez)
  const [abierto, setAbierto] = useState<IdGrupo | null>(null);

  // Lo que queda con la modalidad y la búsqueda: de aquí salen las cantidades del panel
  const base = useMemo(() => {
    const buscado = normalizar(texto.trim());
    return productos
      .map((p) => conModo(p, modo))
      .filter((p) => p.variantes.some((v) => v.enStock))
      .filter((p) => !buscado || normalizar([p.nombre, p.textoBusqueda, p.marca, p.disenador, p.material].filter(Boolean).join(" ")).includes(buscado));
  }, [productos, modo, texto]);

  const filtrosVariante = useMemo<Filtros>(
    () => Object.fromEntries(DE_VARIANTE.flatMap((clave) => (elegidos[clave]?.length ? [[clave, elegidos[clave]]] : []))),
    [elegidos],
  );

  // RF-09: las opciones salen de todos los productos de la categoría (no desaparecen al filtrar)
  const grupos = useMemo<Grupo[]>(() => {
    const generales = GENERALES.map((g) => ({
      id: g.id,
      nombre: g.nombre,
      tipo: "lista" as const,
      opciones: unicos(productos.flatMap(g.valores))
        .sort((a, b) => a.localeCompare(b, "es"))
        .map((valor) => ({ valor, nombre: valor, cantidad: base.filter((p) => g.valores(p).includes(valor)).length })),
    }));
    const deVariante = DE_VARIANTE.map((clave) => ({
      id: clave,
      nombre: clave === "color" ? "Color" : NOMBRES_CLAVE[clave],
      tipo: (clave === "talla" ? "botones" : clave === "color" ? "colores" : "lista") as TipoGrupo,
      opciones: ordenarValores(clave, unicos(productos.flatMap((p) => p.variantes.filter((v) => v.enStock).map((v) => v.opciones[clave])))).map((valor) => ({
        valor,
        nombre: nombreOpcion(clave, valor),
        cantidad: base.filter((p) => p.variantes.some((v) => v.enStock && v.opciones[clave] === valor)).length,
      })),
    }));
    return [...generales, ...deVariante].filter((g) => g.opciones.length > 0);
  }, [productos, base]);

  // RF-02 / RNF-01: filtrar no consulta la base de datos, todo es en memoria
  const tarjetas = useMemo(() => {
    const sinColor: Filtros = { ...filtrosVariante, color: undefined };
    const lista = base
      .filter((p) =>
        GENERALES.every((g) => {
          const elegidosGrupo = elegidos[g.id];
          return !elegidosGrupo?.length || g.valores(p).some((v) => v !== null && elegidosGrupo.includes(v));
        }),
      )
      .flatMap((p): Tarjeta[] => {
        const inicial = resolverTarjeta(p, filtrosVariante);
        if (!inicial) return [];
        // Los colores que se pueden elegir en la tarjeta: los que tienen stock con los demás filtros
        const colores = ordenarValores("color", unicos(p.variantes.filter((v) => v.enStock).map((v) => v.opciones.color))).filter((c) =>
          resolverTarjeta(p, { ...sinColor, color: [c] }),
        );
        const colorInicial = p.variantes.find((v) => v.variantId === inicial.variantId)?.opciones.color;
        const pedido = colorDe[p.productId];
        const color = pedido && colores.includes(pedido) ? pedido : colorInicial;
        const tarjeta = color && color !== colorInicial ? (resolverTarjeta(p, { ...sinColor, color: [color] }) ?? inicial) : inicial;
        return [{ producto: p, ...tarjeta, colores, color }];
      });

    // Por precio cuenta el de la modalidad elegida; en "Todo", el de venta
    const precio = (t: Tarjeta) => (modo === "alquiler" ? t.precioAlquiler : t.precioVenta || t.precioAlquiler);
    if (orden === "precio-asc") lista.sort((a, b) => precio(a) - precio(b));
    if (orden === "precio-desc") lista.sort((a, b) => precio(b) - precio(a));
    if (orden === "az") lista.sort((a, b) => a.producto.nombre.localeCompare(b.producto.nombre, "es"));
    if (orden === "za") lista.sort((a, b) => b.producto.nombre.localeCompare(a.producto.nombre, "es"));
    return lista; // "Novedades": ya vienen los más nuevos primero
  }, [base, elegidos, filtrosVariante, colorDe, orden, modo]);

  // Cualquier cambio en los filtros vuelve a la primera página
  const alternar = (id: IdGrupo, valor: string) => {
    setElegidos((e) => {
      const lista = e[id] ?? [];
      return { ...e, [id]: lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor] };
    });
    setLimite(POR_PAGINA);
  };
  const limpiar = () => {
    setElegidos({});
    setTexto("");
    setLimite(POR_PAGINA);
  };

  const chips = [
    ...(texto.trim() ? [{ clave: "texto", nombre: `“${texto.trim()}”`, quitar: () => setTexto("") }] : []),
    ...[...GENERALES.map((g) => g.id), ...DE_VARIANTE].flatMap((id) =>
      (elegidos[id] ?? []).map((valor) => ({ clave: `${id}-${valor}`, nombre: nombreDe(id, valor), quitar: () => alternar(id, valor) })),
    ),
  ];
  const visibles = tarjetas.slice(0, limite);
  const grupoAbierto = grupos.find((g) => g.id === abierto);
  const productosTexto = (n: number) => (n === 1 ? "1 producto" : `${n} productos`);

  return (
    <div className="bg-white font-cuerpo text-[15px] text-tinta">
      {actual && <h1 className="sr-only">Catálogo de {actual.plural.toLowerCase()}</h1>}
      <RutaNavegacion sinLinea pasos={ruta}>
        <div role="group" aria-label="Modalidad" className="flex border border-tinta">
          {MODOS.map((m, i) => (
            <button
              key={m.valor}
              type="button"
              aria-pressed={modo === m.valor}
              onClick={() => {
                setModo(m.valor);
                setLimite(POR_PAGINA);
              }}
              className={`min-h-[30px] px-3 text-[13px] font-medium ${i > 0 ? "border-l border-tinta" : ""} ${
                modo === m.valor ? "bg-acento text-white" : "cursor-pointer bg-white text-tinta transition-colors duration-150 hover:bg-acento hover:text-white"
              }`}
            >
              {m.nombre}
            </button>
          ))}
        </div>
      </RutaNavegacion>
      {encabezado}

      {/* Buscar, un botón por grupo de filtros y el orden. En el celular los botones se deslizan de lado. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 px-[clamp(16px,3vw,32px)] pt-1 pb-3">
        <input
          type="search"
          aria-label="Buscar en el catálogo"
          placeholder="Buscar: gala, sirena, floreado…"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setLimite(POR_PAGINA);
          }}
          className="min-h-9 w-full rounded-none border border-tinta bg-white px-3 text-[14px] text-tinta placeholder:text-[#8a8a8a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento min-[760px]:w-64"
        />
        <div
          role="group"
          aria-label="Filtros"
          className="-mx-[clamp(16px,3vw,32px)] flex min-w-0 flex-[1_1_100%] gap-1.5 overflow-x-auto px-[clamp(16px,3vw,32px)] [scrollbar-width:none] min-[760px]:mx-0 min-[760px]:flex-[1_1_0] min-[760px]:flex-wrap min-[760px]:overflow-visible min-[760px]:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {grupos.map((g) => {
            const cantidad = elegidos[g.id]?.length ?? 0;
            const esAbierto = abierto === g.id;
            return (
              <button
                key={g.id}
                type="button"
                aria-expanded={esAbierto}
                aria-controls="panel-filtro"
                onClick={() => setAbierto((a) => (a === g.id ? null : g.id))}
                className={`inline-flex min-h-9 flex-none items-center gap-2 px-3 font-archivo text-[12px] font-bold tracking-[0.1em] uppercase ${boton(esAbierto)}`}
              >
                {g.nombre}
                {cantidad > 0 && (
                  <span className={`inline-flex h-5 min-w-5 items-center justify-center px-1.5 text-[11px] tracking-normal ${esAbierto ? "bg-white text-tinta" : "bg-acento text-white"}`}>
                    {cantidad}
                    <span className="sr-only"> elegidos</span>
                  </span>
                )}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={esAbierto ? "rotate-180" : undefined}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            );
          })}
        </div>
        <label className="ml-auto flex items-center gap-2 text-[13px] font-medium">
          Ordenar por
          <select
            value={orden}
            onChange={(e) => {
              setOrden(e.target.value as Orden);
              setLimite(POR_PAGINA);
            }}
            className="min-h-9 cursor-pointer rounded-none border border-tinta bg-white px-2.5 text-[14px] text-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
          >
            {ORDENES.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Las opciones del grupo abierto, a todo el ancho */}
      <div
        id="panel-filtro"
        role="region"
        aria-label={grupoAbierto ? `Filtro: ${grupoAbierto.nombre}` : "Filtro"}
        hidden={!grupoAbierto}
        onKeyDown={(e) => e.key === "Escape" && setAbierto(null)}
        className="border-y border-tinta px-[clamp(16px,3vw,32px)] py-4"
      >
        {grupoAbierto && (
          <div className="flex items-start gap-6">
            <div className="min-w-0 flex-auto">
              {grupoAbierto.tipo === "botones" ? (
                <div className="flex flex-wrap gap-1.5">
                  {grupoAbierto.opciones.map((o) => {
                    const elegido = elegidos[grupoAbierto.id]?.includes(o.valor) ?? false;
                    return (
                      <button
                        key={o.valor}
                        type="button"
                        aria-pressed={elegido}
                        onClick={() => alternar(grupoAbierto.id, o.valor)}
                        className={`min-h-9 min-w-11 px-2.5 text-[13px] font-medium ${boton(elegido)}`}
                      >
                        {o.nombre}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,180px),1fr))] gap-x-8 gap-y-2.5">
                  {grupoAbierto.opciones.map((o) => (
                    <li key={o.valor}>
                      <label className="group/opcion flex cursor-pointer items-center gap-2.5 text-[14px]">
                        <input
                          type="checkbox"
                          checked={elegidos[grupoAbierto.id]?.includes(o.valor) ?? false}
                          onChange={() => alternar(grupoAbierto.id, o.valor)}
                          className="size-4 flex-none cursor-pointer accent-acento"
                        />
                        {grupoAbierto.tipo === "colores" && (
                          <span aria-hidden="true" className="size-3.5 flex-none border border-tinta" style={{ background: muestra(o.valor) }} />
                        )}
                        <span className="min-w-0 flex-auto group-hover/opcion:underline group-hover/opcion:underline-offset-3">{o.nombre}</span>
                        <span className="text-[12px] text-[#666666]">{o.cantidad}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="button"
              aria-label={`Cerrar ${grupoAbierto.nombre}`}
              onClick={() => setAbierto(null)}
              className={`flex size-9 flex-none items-center justify-center ${boton(false)}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="flex min-h-[52px] flex-wrap items-center gap-2 border-b border-tinta px-[clamp(16px,3vw,32px)] py-2.5">
        <span className="mr-1 text-[11px] font-semibold tracking-[0.12em] uppercase">Filtros aplicados</span>
        {chips.length === 0 ? (
          <span className="text-[14px] text-[#555555]">Ninguno</span>
        ) : (
          <>
            {chips.map((chip) => (
              <button
                key={chip.clave}
                type="button"
                aria-label={`Quitar filtro ${chip.nombre}`}
                onClick={() => {
                  chip.quitar();
                  setLimite(POR_PAGINA);
                }}
                className={`inline-flex min-h-[30px] cursor-pointer items-center gap-1.5 border border-tinta bg-white px-2.5 text-[13px] text-tinta ${hoverBlanca}`}
              >
                {chip.nombre}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            ))}
            <button type="button" onClick={limpiar} className="min-h-[30px] cursor-pointer px-1 text-[13px] underline underline-offset-3 transition-colors duration-150 hover:text-acento">
              Limpiar todo
            </button>
          </>
        )}
      </div>

      <section aria-label="Productos" className="flex flex-col">
        {visibles.length > 0 ? (
          <>
            <ul className="grid grid-cols-2 min-[900px]:grid-cols-3 min-[1200px]:grid-cols-4">
              {visibles.map((t) => (
                <TarjetaCatalogo key={t.producto.productId} tarjeta={t} onColor={(id, c) => setColorDe((actuales) => ({ ...actuales, [id]: c }))} />
              ))}
            </ul>
            <div className="flex flex-col items-center gap-3 border-b border-tinta px-4 py-8">
              <span aria-live="polite" className="text-[13px] text-[#555555]">
                Mostrando {visibles.length < tarjetas.length ? `${visibles.length} de ${productosTexto(tarjetas.length)}` : productosTexto(tarjetas.length)}
              </span>
              {visibles.length < tarjetas.length && (
                <button type="button" onClick={() => setLimite((l) => l + POR_PAGINA)} className={`min-h-[42px] w-[max(200px,25%)] text-[14px] font-medium ${boton(false)}`}>
                  Cargar más
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3.5 border-b border-tinta px-6 py-24 text-center">
            <h2 className="text-[22px] font-medium">{productos.length ? "No encontramos productos con estos filtros" : "Todavía no hay productos en esta categoría"}</h2>
            {productos.length > 0 && (
              <>
                <p className="text-[15px] text-[#555555]">Prueba quitando algún filtro o cambiando la modalidad.</p>
                <button type="button" onClick={limpiar} className={`${botonAzul} cursor-pointer`}>
                  Limpiar filtros
                </button>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
