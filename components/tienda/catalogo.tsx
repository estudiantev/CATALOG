"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import type { Foto, ProductoCatalogo } from "@/lib/catalogo";
import { type Clave, FAMILIAS_COLOR, type Filtros, NOMBRES_CLAVE, nombreOpcion, ordenarValores, precioCorto } from "@/lib/productos";
import { resolverTarjeta } from "@/lib/variantes";
import { botonAzul, hoverBlanca } from "./estilos-inicio";
import { Ruta, RutaNavegacion } from "./ruta-navegacion";
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
  { valor: "precio-asc", nombre: "Precio: menor a mayor" },
  { valor: "precio-desc", nombre: "Precio: mayor a menor" },
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

// Los que van a la vista en la barra, en este orden; los demás se abren todos juntos con "Más filtros"
const PRINCIPALES: IdGrupo[] = ["talla", "color", "ocasion", "material"];
const MAS = "mas";

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

const boton = (elegido: boolean) => (elegido ? "bg-tinta text-white" : `cursor-pointer bg-white text-tinta ${hoverBlanca}`);
// Las opciones de la barra: como el menú del encabezado, texto en mayúsculas. `relative`: el texto
// oculto de la cuenta (sr-only) queda dentro de la fila que se desliza en el celular y no la ensancha.
const botonBarra = (abierto: boolean) =>
  `relative inline-flex min-h-11 flex-none items-center gap-2 px-4 text-[13px] leading-none tracking-[0.04em] whitespace-nowrap uppercase ${boton(abierto)}`;
const enfoqueAdentro = "focus-visible:-outline-offset-2";

function Chevron({ arriba }: { arriba: boolean }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={arriba ? "rotate-180" : undefined}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function Cuenta({ cantidad, invertida }: { cantidad: number; invertida: boolean }) {
  if (!cantidad) return null;
  return (
    <span className={`inline-flex h-[18px] min-w-[18px] items-center justify-center px-1 text-[11px] tracking-normal ${invertida ? "bg-white text-tinta" : "bg-tinta text-white"}`}>
      {cantidad}
      <span className="sr-only"> elegidos</span>
    </span>
  );
}

// Las opciones de un grupo: la talla en botones, lo demás con casillas (el color con su muestra)
function Opciones({ grupo, elegidos, alternar, columnas }: { grupo: Grupo; elegidos: string[]; alternar: (valor: string) => void; columnas: boolean }) {
  if (grupo.tipo === "botones") {
    return (
      <div className="flex flex-wrap gap-1.5">
        {grupo.opciones.map((o) => {
          const elegido = elegidos.includes(o.valor);
          return (
            <button
              key={o.valor}
              type="button"
              aria-pressed={elegido}
              onClick={() => alternar(o.valor)}
              className={`min-h-9 min-w-11 border border-tinta px-2.5 text-[13px] font-medium ${boton(elegido)}`}
            >
              {o.nombre}
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <ul className={columnas ? "grid grid-cols-[repeat(auto-fill,minmax(min(100%,180px),1fr))] gap-x-8 gap-y-2.5" : "flex flex-col gap-2.5"}>
      {grupo.opciones.map((o) => (
        <li key={o.valor}>
          <label className="group/opcion flex cursor-pointer items-center gap-2.5 text-[14px]">
            <input type="checkbox" checked={elegidos.includes(o.valor)} onChange={() => alternar(o.valor)} className="size-4 flex-none cursor-pointer accent-acento" />
            {grupo.tipo === "colores" && <span aria-hidden="true" className="size-3.5 flex-none border border-tinta" style={{ background: muestra(o.valor) }} />}
            <span className="min-w-0 flex-auto group-hover/opcion:underline group-hover/opcion:underline-offset-3">{o.nombre}</span>
            <span className="text-[12px] text-[#666666]">{o.cantidad}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

type Tarjeta = NonNullable<ReturnType<typeof resolverTarjeta<Foto>>> & {
  producto: ProductoCatalogo;
  colores: string[];
  color?: string;
};

// La foto y tres líneas debajo: el nombre, los precios y los colores.
// `limitarFoto`: desde 1000 px la foto baja de alto si la primera fila no entra en la pantalla. Lo
// que va arriba y debajo de la foto lo da --resto-catalogo, que pone el catálogo.
function TarjetaCatalogo({ tarjeta, limitarFoto, onColor }: { tarjeta: Tarjeta; limitarFoto: boolean; onColor: (productId: string, color: string) => void }) {
  const { producto, variantId, precioVenta, precioAlquiler, desde, portada, hover, colores, color } = tarjeta;
  // RF-10: abre el detalle con la combinación filtrada (y el color elegido) ya elegida
  const href = `/catalogo/${producto.productId}?v=${variantId}`;
  return (
    <li className="group/tarjeta flex min-w-0 flex-col">
      {/* La foto lleva al mismo lugar que el nombre: para el lector de pantalla basta con uno.
          w-full: al bajar de alto no se angosta. */}
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className={`group relative block aspect-[3/4] w-full overflow-hidden bg-[#f3f3f3] ${limitarFoto ? "min-[1000px]:max-h-[calc(100svh-var(--alto-marco)-var(--resto-catalogo))]" : ""}`}
      >
        <FotosProducto portada={portada} hover={hover} sizes="(min-width: 1200px) 25vw, (min-width: 900px) 33vw, 50vw" />
        {/* Decorativo: todavía no hay lista de favoritos, así que no es un botón */}
        <span className={`absolute top-2 right-2 flex size-[30px] items-center justify-center bg-white text-tinta ${hoverBlanca}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
          </svg>
        </span>
      </Link>
      <div className="flex flex-col gap-1 px-3 pt-2.5 pb-3.5">
        {/* Una sola línea: si el nombre es largo termina en "…" */}
        {/* En la computadora, un poco más grande; en el celular, como antes, para que el nombre entre */}
        <h3 className="truncate text-[14px] leading-5 font-medium min-[1000px]:text-[16px] min-[1000px]:leading-[22px]">
          <Link href={href} className="group-hover/tarjeta:underline group-hover/tarjeta:underline-offset-3">
            {producto.nombre}
          </Link>
        </h3>
        {/* RF-06: el menor precio entre las variantes que cumplen los filtros. Como en el inicio: la
            venta sola y el alquiler en gris, los dos en una línea (en el celular, si no entran, el
            alquiler pasa abajo; cada precio va siempre junto). */}
        <p className="flex flex-wrap gap-x-3 text-[13px] leading-[18px] min-[1000px]:text-[15px] min-[1000px]:leading-[21px]">
          {precioVenta > 0 && (
            <span className="font-semibold whitespace-nowrap">
              {desde && "Desde "}
              {precioCorto(precioVenta)}
            </span>
          )}
          {precioAlquiler > 0 && (
            <span className="whitespace-nowrap text-[#555555]">
              Alquiler {desde && "desde "}
              {precioCorto(precioAlquiler)}/día
            </span>
          )}
        </p>
        {colores.length > 0 && (
          <div role="group" aria-label={`Colores de ${producto.nombre}`} className="flex flex-wrap gap-1 pt-0.5">
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
                  className={`size-[22px] cursor-pointer p-[3px] focus-visible:outline-offset-1 ${elegido ? "shadow-[inset_0_0_0_1px_#111111]" : ""}`}
                >
                  <span className={`block size-full ${claro ? "shadow-[inset_0_0_0_1px_#bdbdbd]" : ""}`} style={{ background: muestra(c) }} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </li>
  );
}

// El catálogo de una categoría (/catalogo) o los productos de una colección (/coleccion/…).
// Buscar, los filtros, los aplicados y el orden van en una sola barra arriba de los productos. Con
// `categoria` (su nombre en plural) lleva su título; `encabezado` va entre la ruta y la barra (la
// portada de la colección).
export function Catalogo({
  productos,
  ruta,
  categoria,
  encabezado,
  filtrosIniciales = { variante: {}, texto: "", modo: "todo" },
}: {
  productos: ProductoCatalogo[];
  ruta: { nombre: string; href?: string }[];
  categoria?: string;
  encabezado?: ReactNode;
  filtrosIniciales?: FiltrosIniciales;
}) {
  const [modo, setModo] = useState<Modo>(filtrosIniciales.modo);
  const [texto, setTexto] = useState(filtrosIniciales.texto);
  const [elegidos, setElegidos] = useState<Elegidos>(() => ({ ...filtrosIniciales.variante, ...filtrosIniciales.generales }));
  const [orden, setOrden] = useState<Orden>("novedades");
  const [limite, setLimite] = useState(POR_PAGINA);
  const [colorDe, setColorDe] = useState<Record<string, string>>({}); // productId → color elegido en su tarjeta
  // Lo que se despliega debajo de la barra: un grupo o "Más filtros" (uno a la vez)
  const [abierto, setAbierto] = useState<IdGrupo | typeof MAS | null>(null);
  const barra = useRef<HTMLDivElement>(null);

  // Escape o un clic fuera de la barra cierran lo desplegado
  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(null);
    const alHacerClic = (e: MouseEvent) => {
      if (!barra.current?.contains(e.target as Node)) setAbierto(null);
    };
    document.addEventListener("keydown", alPresionar);
    document.addEventListener("mousedown", alHacerClic);
    return () => {
      document.removeEventListener("keydown", alPresionar);
      document.removeEventListener("mousedown", alHacerClic);
    };
  }, [abierto]);

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
  const principales = PRINCIPALES.flatMap((id) => grupos.filter((g) => g.id === id));
  const secundarios = grupos.filter((g) => !PRINCIPALES.includes(g.id));
  const elegidosEn = (lista: Grupo[]) => lista.reduce((total, g) => total + (elegidos[g.id]?.length ?? 0), 0);
  const grupoAbierto = grupos.find((g) => g.id === abierto);
  const nombrePanel = abierto === MAS ? "Más filtros" : grupoAbierto?.nombre;
  const alternarPanel = (id: IdGrupo | typeof MAS) => setAbierto((a) => (a === id ? null : id));
  const visibles = tarjetas.slice(0, limite);
  const productosTexto = (n: number) => (n === 1 ? "1 producto" : `${n} productos`);

  // En /catalogo, en pantallas anchas (variante `una-fila` de tienda.css), la ruta y la modalidad van
  // dentro de la barra: arriba de los productos queda un solo rectángulo, y los filtros aplicados
  // pasan a una línea debajo. Más angosto no entran: la ruta va en su propia línea, como en las
  // colecciones, donde la portada va entre la ruta y la barra.
  const enLinea = !encabezado;
  const fueraDeLaFila = enLinea ? "una-fila:hidden" : "";
  // En una sola fila los filtros van un poco más juntos, para que todo entre desde 1360 px; buscar
  // ocupa lo que sobre, así la barra no deja huecos
  const botonFila = enLinea ? "una-fila:px-3" : "";

  const modalidad = (clase: string, claseBoton = "px-3") => (
    <div role="group" aria-label="Modalidad" className={`flex ${clase}`}>
      {MODOS.map((m) => (
        <button
          key={m.valor}
          type="button"
          aria-pressed={modo === m.valor}
          onClick={() => {
            setModo(m.valor);
            setLimite(POR_PAGINA);
          }}
          className={`min-h-[30px] ${claseBoton} text-[13px] font-medium ${
            modo === m.valor ? "bg-acento text-white" : "cursor-pointer bg-white text-tinta transition-colors duration-150 hover:bg-acento hover:text-white"
          }`}
        >
          {m.nombre}
        </button>
      ))}
    </div>
  );

  // `clase` es la del grupo; `claseLista`, la de los botones de los filtros
  const aplicados = (clase: string, claseLista: string) =>
    chips.length > 0 && (
      <div role="group" aria-label="Filtros aplicados" className={clase}>
        <div className={claseLista}>
          {chips.map((chip) => (
            <button
              key={chip.clave}
              type="button"
              aria-label={`Quitar filtro ${chip.nombre}`}
              onClick={() => {
                chip.quitar();
                setLimite(POR_PAGINA);
              }}
              className="inline-flex min-h-[30px] flex-none cursor-pointer items-center gap-1.5 bg-[#f2f2f2] px-2.5 text-[13px] whitespace-nowrap text-tinta transition-colors duration-150 hover:bg-tinta hover:text-white focus-visible:-outline-offset-2"
            >
              {chip.nombre}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={limpiar}
          className="min-h-[30px] flex-none cursor-pointer px-1 text-[13px] whitespace-nowrap underline underline-offset-3 transition-colors duration-150 hover:text-[#555555]"
        >
          Limpiar todo
        </button>
      </div>
    );

  return (
    <div className="bg-white font-cuerpo text-[15px] text-tinta">
      {categoria && <h1 className="sr-only">Catálogo de {categoria.toLowerCase()}</h1>}
      <RutaNavegacion pasos={ruta} className={fueraDeLaFila}>
        {modalidad("")}
      </RutaNavegacion>
      {encabezado}

      {/* La barra: un rectángulo del alto del menú del encabezado con buscar, los filtros principales,
          "Más filtros", los aplicados y el orden (en una sola fila, también la ruta y la modalidad). En
          el celular se reparte en filas: buscar y el orden arriba, los filtros (que se deslizan de
          lado) y los aplicados debajo. */}
      <div ref={barra} className={`relative z-10 mx-[clamp(16px,3vw,32px)] mb-3 ${enLinea ? "una-fila:mt-3" : ""}`}>
        <div data-barra-catalogo className="flex flex-wrap border border-tinta bg-white min-[1000px]:h-[51px] min-[1000px]:flex-nowrap">
          {enLinea && (
            <div className="hidden min-w-0 flex-[0_1_auto] items-center border-r border-tinta px-4 text-[13px] text-[#555555] una-fila:flex">
              <Ruta pasos={ruta} unaLinea />
            </div>
          )}
          <label className={`flex min-h-11 min-w-0 flex-1 cursor-text items-center gap-2.5 px-4 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-tinta min-[1000px]:w-[clamp(170px,16vw,260px)] min-[1000px]:flex-none ${enLinea ? "una-fila:w-auto una-fila:min-w-[150px] una-fila:flex-[1_1_0%]" : ""}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="flex-none">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              type="search"
              aria-label="Buscar en el catálogo"
              placeholder="Buscar…"
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value);
                setLimite(POR_PAGINA);
              }}
              className="min-w-0 flex-1 self-stretch bg-transparent text-[14px] text-tinta outline-none placeholder:text-[#8a8a8a]"
            />
          </label>

          <div
            role="group"
            aria-label="Filtros"
            className="relative order-3 flex min-w-0 basis-full divide-x divide-tinta overflow-x-auto border-t border-tinta [scrollbar-width:none] min-[1000px]:order-none min-[1000px]:basis-auto min-[1000px]:flex-none min-[1000px]:overflow-visible min-[1000px]:border-t-0 min-[1000px]:border-l [&::-webkit-scrollbar]:hidden"
          >
            {principales.map((g) => (
              <button
                key={g.id}
                type="button"
                aria-expanded={abierto === g.id}
                aria-controls="panel-filtro"
                onClick={() => alternarPanel(g.id)}
                className={`${botonBarra(abierto === g.id)} ${botonFila} ${enfoqueAdentro}`}
              >
                {g.nombre}
                <Cuenta cantidad={elegidos[g.id]?.length ?? 0} invertida={abierto === g.id} />
                <Chevron arriba={abierto === g.id} />
              </button>
            ))}
            {secundarios.length > 0 && (
              <button
                type="button"
                aria-expanded={abierto === MAS}
                aria-controls="panel-filtro"
                onClick={() => alternarPanel(MAS)}
                className={`${botonBarra(abierto === MAS)} ${botonFila} ${enfoqueAdentro}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
                  <circle cx="16" cy="7" r="2" />
                  <circle cx="10" cy="17" r="2" />
                </svg>
                Más filtros
                <Cuenta cantidad={elegidosEn(secundarios)} invertida={abierto === MAS} />
              </button>
            )}
          </div>

          {/* Los aplicados: en la barra, entre los filtros y el orden. Si no entran, se deslizan de lado
              y "Limpiar todo" queda siempre a la vista. En una sola fila van debajo de la barra. */}
          {aplicados(
            `order-4 flex min-w-0 basis-full items-center gap-1.5 border-t border-tinta px-3 py-2 min-[1000px]:order-none min-[1000px]:flex-1 min-[1000px]:basis-auto min-[1000px]:border-t-0 min-[1000px]:border-l min-[1000px]:py-0 ${fueraDeLaFila}`,
            // El borde derecho se desvanece: si no entran todos, el último no queda cortado en seco
            "flex min-w-0 flex-wrap gap-1.5 min-[1000px]:flex-nowrap min-[1000px]:overflow-x-auto min-[1000px]:pr-4 min-[1000px]:[mask-image:linear-gradient(to_right,#000_calc(100%-16px),transparent)] min-[1000px]:[scrollbar-width:none] min-[1000px]:[&::-webkit-scrollbar]:hidden",
          )}

          {/* Todo / Comprar / Alquilar, a la izquierda del orden */}
          {enLinea && modalidad("hidden flex-none items-center border-l border-tinta px-2 una-fila:ml-auto una-fila:flex", "px-2.5")}

          <label className={`relative order-2 ml-auto flex min-h-11 flex-none items-center gap-2 border-l border-tinta pl-4 text-[13px] tracking-[0.04em] uppercase focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-tinta min-[1000px]:order-none ${enLinea ? "una-fila:ml-0" : ""}`}>
            <span className={`max-[1199px]:sr-only ${enLinea ? "una-fila:max-[1499px]:sr-only" : ""}`}>Ordenar</span>
            <select
              value={orden}
              onChange={(e) => {
                setOrden(e.target.value as Orden);
                setLimite(POR_PAGINA);
              }}
              className="field-sizing-content cursor-pointer appearance-none self-stretch bg-transparent pr-9 text-[14px] tracking-normal text-tinta normal-case outline-none"
            >
              {ORDENES.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.nombre}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4">
              <Chevron arriba={false} />
            </span>
          </label>
        </div>

        {/* Lo que se despliega debajo de la barra, encima de los productos */}
        <div
          id="panel-filtro"
          role="region"
          aria-label={nombrePanel ? `Filtro: ${nombrePanel}` : "Filtro"}
          hidden={!abierto}
          className="absolute inset-x-0 top-full max-h-[min(70svh,520px)] overflow-y-auto border border-t-0 border-tinta bg-white px-5 py-5 shadow-[0_12px_24px_-12px_rgba(0,0,0,0.25)]"
        >
          {abierto && (
            <div className="flex items-start gap-6">
              <div className="min-w-0 flex-auto">
                {abierto === MAS ? (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,190px),1fr))] gap-x-8 gap-y-6">
                    {secundarios.map((g) => (
                      <fieldset key={g.id} className="min-w-0">
                        <legend className="mb-3 text-[12px] font-semibold tracking-[0.12em] uppercase">{g.nombre}</legend>
                        <Opciones grupo={g} elegidos={elegidos[g.id] ?? []} alternar={(valor) => alternar(g.id, valor)} columnas={false} />
                      </fieldset>
                    ))}
                  </div>
                ) : (
                  grupoAbierto && <Opciones grupo={grupoAbierto} elegidos={elegidos[grupoAbierto.id] ?? []} alternar={(valor) => alternar(grupoAbierto.id, valor)} columnas />
                )}
              </div>
              <button
                type="button"
                aria-label={`Cerrar ${nombrePanel ?? "filtro"}`}
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
      </div>

      {enLinea && aplicados("mx-[clamp(16px,3vw,32px)] mb-3 hidden items-center gap-1.5 una-fila:flex", "flex min-w-0 flex-wrap gap-1.5")}

      {/* --resto-catalogo: lo que va arriba y debajo de la foto en la primera fila (la ruta, la barra,
          los aplicados y las tres líneas de la tarjeta), para que entre entera en la pantalla */}
      <section
        aria-label="Productos"
        className={`flex flex-col [--resto-catalogo:230px] ${enLinea ? (chips.length ? "una-fila:[--resto-catalogo:234px]" : "una-fila:[--resto-catalogo:192px]") : ""}`}
      >
        {visibles.length > 0 ? (
          <>
            <ul className="grid grid-cols-2 min-[900px]:grid-cols-3 min-[1200px]:grid-cols-4">
              {visibles.map((t) => (
                <TarjetaCatalogo
                  key={t.producto.productId}
                  tarjeta={t}
                  limitarFoto={!encabezado}
                  onColor={(id, c) => setColorDe((actuales) => ({ ...actuales, [id]: c }))}
                />
              ))}
            </ul>
            <div className="flex flex-col items-center gap-3 px-4 py-8">
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
          <div className="flex flex-col items-center gap-3.5 px-6 py-24 text-center">
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
