"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import type { ProductoDetalle, VarianteDetalle } from "@/lib/catalogo";
import type { Paso } from "@/lib/contenido";
import { CATEGORIAS, type Clave, FAMILIAS_COLOR, formatoSoles, nombreOpcion, NOMBRES_CLAVE } from "@/lib/productos";
import { clavesDelProducto, elegirOpcion, estadoOpcion, varianteInicial } from "@/lib/variantes";
import { enlaceWhatsApp } from "./datos";
import { hoverBlanca } from "./estilos-inicio";
import { GaleriaProducto } from "./galeria-producto";
import { IconoWhatsApp } from "./iconos";

type Modo = "compra" | "alquiler";
type Estado = ReturnType<typeof estadoOpcion>;

// Como en el diseño: el color primero y la talla al final, junto a la guía de tallas
const ORDEN: Clave[] = ["color", "largo", "escote", "manga", "silueta", "talla"];
// Lo que describe el modelo (sin el color ni la talla), debajo de la descripción
const DEL_MODELO: Clave[] = ["largo", "escote", "manga", "silueta"];
const PERIODOS = [
  { valor: "4", nombre: "4 días" },
  { valor: "8", nombre: "8 días" },
];

const anchoControles = "max-w-[460px]";
const etiquetaGrupo = "text-[15px] font-medium";
const valorGrupo = "font-normal text-[#555555]";
const enlaceTexto = "text-tinta underline underline-offset-3 transition-colors duration-150 hover:text-acento";

// Los segmentos (Comprar / Alquilar, el periodo): el elegido en negro; los demás, azules al pasar
const segmento = (elegido: boolean) =>
  `min-h-11 flex-[1_1_0] text-[15px] font-medium ${
    elegido ? "bg-tinta text-white" : "cursor-pointer bg-white text-tinta transition-colors duration-150 hover:bg-acento hover:text-white"
  }`;

const PILDORA: Record<Estado, string> = {
  elegida: "border-tinta bg-tinta text-white",
  compatible: `cursor-pointer border-tinta bg-white text-tinta ${hoverBlanca}`,
  cambia: `cursor-pointer border-dashed border-tinta bg-white text-tinta ${hoverBlanca}`,
  agotada: "cursor-not-allowed border-[#bdbdbd] bg-[#f5f5f5] text-[#8a8a8a] line-through",
};

const MUESTRA: Record<Estado, string> = {
  elegida: "outline-2 outline-offset-2 outline-tinta",
  compatible: "cursor-pointer hover:outline-1 hover:outline-offset-2 hover:outline-tinta",
  cambia: "cursor-pointer border-dashed hover:outline-1 hover:outline-offset-2 hover:outline-tinta",
  agotada: "cursor-not-allowed opacity-35",
};

// El nombre que se muestra de una opción; el color usa el nombre propio de la variante ("Vino")
const nombreEnVariante = (variante: VarianteDetalle, clave: Clave, valor: string) =>
  clave === "color" && variante.colorNombre ? variante.colorNombre : nombreOpcion(clave, valor);

// "En V" → "en V", para ir dentro de una frase
const minuscula = (texto: string) => texto.charAt(0).toLowerCase() + texto.slice(1);

const fechaLarga = (fecha: string) =>
  new Date(`${fecha}T12:00:00`).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });

function hoyLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Acordeon({ id, titulo, abierto, onCambiar, children }: { id: string; titulo: string; abierto: boolean; onCambiar: () => void; children: ReactNode }) {
  return (
    <div id={id} className="scroll-mt-4">
      <h2>
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls={`${id}-panel`}
          onClick={onCambiar}
          className="group flex min-h-[52px] w-full cursor-pointer items-center justify-between gap-4 text-left text-[16px] font-medium text-tinta"
        >
          <span className="group-hover:underline group-hover:underline-offset-3">{titulo}</span>
          <span aria-hidden="true" className="text-[20px] font-normal">
            {abierto ? "−" : "+"}
          </span>
        </button>
      </h2>
      <div id={`${id}-panel`} hidden={!abierto} className="pb-[18px] text-[15px] leading-[1.6] text-[#333333]">
        {children}
      </div>
    </div>
  );
}

export function DetalleProducto({ producto, variantIdInicial, pasos }: { producto: ProductoDetalle; variantIdInicial?: string; pasos: Paso[] }) {
  const { variantes } = producto;
  const [actual, setActual] = useState<VarianteDetalle | undefined>(() => varianteInicial(variantes, variantIdInicial));

  const seVende = variantes.some((v) => v.precioVenta > 0);
  const seAlquila = variantes.some((v) => v.precioAlquiler > 0);
  const [modo, setModo] = useState<Modo>(seVende || !seAlquila ? "compra" : "alquiler");
  const [fecha, setFecha] = useState("");
  const [periodo, setPeriodo] = useState(PERIODOS[0].valor);
  const [aviso, setAviso] = useState(false);
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({});
  // La fecha mínima es la de hoy en el celular de quien compra (en el servidor puede ser otra)
  const [hoy, setHoy] = useState<string>();
  const campoFecha = useRef<HTMLInputElement>(null);
  useEffect(() => setHoy(hoyLocal()), []);

  const claves = clavesDelProducto(variantes).sort((a, b) => ORDEN.indexOf(a.clave) - ORDEN.indexOf(b.clave));
  const categoria = CATEGORIAS.find((c) => c.valor === producto.categoria)?.nombre;
  const nombreDe = (clave: Clave) => {
    const valor = actual?.opciones[clave];
    return actual && valor ? nombreEnVariante(actual, clave, valor) : null;
  };
  const resumen = ORDEN.flatMap((clave) => nombreDe(clave) ?? []).join(" · ");
  // "Largo midi · Escote en V · Manga larga"
  const delModelo = DEL_MODELO.flatMap((clave) => {
    const nombre = nombreDe(clave);
    if (!nombre) return [];
    return [clave === "manga" ? nombre : `${NOMBRES_CLAVE[clave]} ${minuscula(nombre)}`];
  }).join(" · ");
  // "Vestido midi · Marca"
  const largo = nombreDe("largo");
  const subtitulo = [categoria && (largo ? `${categoria} ${minuscula(largo)}` : categoria), producto.marca].filter(Boolean).join(" · ");
  const tallas = claves.find((c) => c.clave === "talla")?.valores ?? [];

  const alquilando = modo === "alquiler" && seAlquila;
  const disponible = Boolean(actual?.enStock);
  // El navegador deja escribir fechas pasadas o incompletas: se revisan antes de abrir WhatsApp
  const fechaValida = /^\d{4}-\d{2}-\d{2}$/.test(fecha) && !Number.isNaN(Date.parse(fecha));
  const falta =
    !disponible || !alquilando ? "" : !fechaValida ? "Elige la fecha de tu evento para continuar." : hoy && fecha < hoy ? "Elige una fecha desde hoy." : "";
  const nombrePeriodo = PERIODOS.find((p) => p.valor === periodo)?.nombre ?? PERIODOS[0].nombre;

  // Tocar una opción cambia de variante; la URL guarda la combinación para compartirla
  function elegir(clave: Clave, valor: string) {
    if (!actual) return;
    const nueva = elegirOpcion(variantes, actual, clave, valor);
    setActual(nueva);
    window.history.replaceState(null, "", `?v=${encodeURIComponent(nueva.variantId)}`);
  }
  const alternar = (id: string, valor?: boolean) => setAbiertos((a) => ({ ...a, [id]: valor ?? !a[id] }));

  // WhatsApp con el producto, la combinación y, si es alquiler, la fecha y el periodo
  function mensaje() {
    const detalles = [resumen, actual?.sku && `SKU: ${actual.sku}`].filter(Boolean).join(", ");
    const que = `${producto.nombre}${detalles ? ` (${detalles})` : ""}`;
    if (!disponible) return `Hola, quisiera consultar sobre ${que} en Fara Collection.`;
    if (alquilando) return `Hola, quisiera alquilar ${que}${fechaValida ? ` para el ${fechaLarga(fecha)}` : ""}, por ${nombrePeriodo}, en Fara Collection.`;
    return `Hola, quisiera comprar ${que} en Fara Collection.`;
  }

  const textoBoton = !disponible ? "Consultar" : alquilando ? "Reservar" : "Comprar";
  const precioBoton = !actual || !disponible ? "" : alquilando ? `${formatoSoles.format(actual.precioAlquiler)} por día` : formatoSoles.format(actual.precioVenta);

  const info = [
    { nombre: "Marca", valor: producto.marca },
    { nombre: "Diseñador", valor: producto.disenador },
    { nombre: "Material", valor: producto.material },
    { nombre: "Ocasión", valor: producto.ocasion },
  ].filter((i) => i.valor);
  const cuidados = [
    { nombre: "Material", valor: producto.material },
    { nombre: "Código", valor: actual?.sku },
  ].filter((i) => i.valor);
  const modalidades = [seVende && "compra", seAlquila && "alquiler"].filter(Boolean);

  return (
    <div className="flex flex-wrap items-stretch">
      {/* Las fotos son las de la variante elegida: cambian con el color, el largo, etc. */}
      <GaleriaProducto key={actual?.fotos[0]?.url ?? "sin-foto"} nombre={producto.nombre} fotos={actual?.fotos ?? []} />

      <div className="flex min-w-0 flex-[1_1_480px] flex-col self-start px-[clamp(20px,3vw,44px)] pt-10 pb-12 min-[901px]:sticky min-[901px]:top-0">
        <h1 className="text-[clamp(32px,2.8vw,42px)] leading-[1.1] font-medium tracking-[-0.01em] text-tinta [overflow-wrap:anywhere]">{producto.nombre}</h1>
        {subtitulo && <p className="mt-3 text-[16px]">{subtitulo}</p>}

        {!actual && <p className="mt-9 text-[#444444]">Este producto todavía no está disponible.</p>}

        {actual && seVende && seAlquila && (
          <div role="group" aria-label="Modalidad" className={`mt-9 flex ${anchoControles}`}>
            {(["compra", "alquiler"] as const).map((m) => (
              <button key={m} type="button" aria-pressed={modo === m} onClick={() => setModo(m)} className={segmento(modo === m)}>
                {m === "compra" ? "Comprar" : "Alquilar"}
              </button>
            ))}
          </div>
        )}

        {actual &&
          claves.map(({ clave, valores }, indice) => {
            const idEtiqueta = `opcion-${clave}`;
            const esColor = clave === "color";
            return (
              <div key={clave} className={`${indice === 0 ? "mt-[26px]" : "mt-[22px]"} flex flex-col gap-2.5`}>
                <div className={`flex items-baseline justify-between gap-3 ${anchoControles}`}>
                  <span id={idEtiqueta} className={etiquetaGrupo}>
                    {NOMBRES_CLAVE[clave]}: <span className={valorGrupo}>{nombreDe(clave)}</span>
                  </span>
                  {clave === "talla" && (
                    <a href="#talla-ajuste" onClick={() => alternar("talla", true)} className={`text-[14px] ${enlaceTexto}`}>
                      Guía de tallas
                    </a>
                  )}
                </div>
                <div role="group" aria-labelledby={idEtiqueta} className={`flex flex-wrap ${esColor ? "gap-2.5" : "gap-1.5"}`}>
                  {valores.map((valor) => {
                    const estado = estadoOpcion(variantes, actual, clave, valor);
                    // El nombre (y el tono, en el color) de la variante a la que se pasaría
                    const destino = estado === "agotada" ? variantes.find((v) => v.opciones[clave] === valor) : elegirOpcion(variantes, actual, clave, valor);
                    const nombre = destino ? nombreEnVariante(destino, clave, valor) : nombreOpcion(clave, valor);
                    const aviso = estado === "cambia" ? " (cambia otras opciones)" : estado === "agotada" ? " (agotada)" : "";
                    return esColor ? (
                      <button
                        key={valor}
                        type="button"
                        aria-label={`Color ${nombre}${aviso}`}
                        aria-pressed={estado === "elegida"}
                        disabled={estado === "agotada"}
                        title={`${nombre}${aviso}`}
                        onClick={() => elegir(clave, valor)}
                        className={`size-10 border border-tinta bg-white p-1 ${MUESTRA[estado]}`}
                      >
                        <span
                          aria-hidden="true"
                          className="block size-full"
                          style={{ background: destino?.colorHex ?? FAMILIAS_COLOR.find((f) => f.valor === valor)?.muestra ?? "transparent" }}
                        />
                      </button>
                    ) : (
                      <button
                        key={valor}
                        type="button"
                        aria-pressed={estado === "elegida"}
                        disabled={estado === "agotada"}
                        title={aviso ? aviso.slice(2, -1) : undefined}
                        onClick={() => elegir(clave, valor)}
                        className={`min-h-[42px] min-w-[52px] border px-3.5 text-[14px] font-medium ${PILDORA[estado]}`}
                      >
                        {nombre}
                        {aviso && <span className="sr-only">{aviso}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        {actual && claves.some(({ clave, valores }) => valores.some((v) => estadoOpcion(variantes, actual, clave, v) === "cambia")) && (
          <p className="mt-3 text-[13px] text-[#555555]">Las opciones con borde punteado cambian también otras elecciones.</p>
        )}

        {disponible && alquilando && (
          <div className={`mt-[22px] grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-3.5 ${anchoControles}`}>
            <div className="flex flex-col gap-2">
              <label htmlFor="fecha-evento" className={etiquetaGrupo}>
                Fecha de tu evento
              </label>
              <input
                ref={campoFecha}
                id="fecha-evento"
                type="date"
                min={hoy}
                value={fecha}
                aria-invalid={aviso && falta ? true : undefined}
                aria-describedby={aviso && falta ? "aviso-detalle" : undefined}
                onChange={(e) => {
                  setFecha(e.target.value);
                  setAviso(false);
                }}
                className="min-h-11 rounded-none border border-tinta bg-white px-3 text-[15px] text-tinta"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span id="periodo-etiqueta" className={etiquetaGrupo}>
                Periodo
              </span>
              <div role="group" aria-labelledby="periodo-etiqueta" className="flex">
                {PERIODOS.map((p) => (
                  <button key={p.valor} type="button" aria-pressed={periodo === p.valor} onClick={() => setPeriodo(p.valor)} className={`${segmento(periodo === p.valor)} min-h-[42px] text-[14px]`}>
                    {p.nombre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={`mt-[30px] flex items-stretch gap-2 ${anchoControles}`}>
          <a
            href={enlaceWhatsApp(mensaje())}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!falta) return;
              e.preventDefault();
              setAviso(true);
              campoFecha.current?.focus();
            }}
            className={`inline-flex min-h-[52px] min-w-0 flex-auto items-center justify-between gap-x-7 gap-y-1 bg-[#ededed] px-[22px] py-2 text-[17px] text-tinta ${hoverBlanca}`}
          >
            <span className="inline-flex items-center gap-2.5">
              <IconoWhatsApp />
              {textoBoton}
              <span className="sr-only"> por WhatsApp</span>
            </span>
            {precioBoton && <span className="whitespace-nowrap">{precioBoton}</span>}
          </a>
          {/* Decorativo: todavía no hay lista de favoritos, así que no es un botón */}
          <span aria-hidden="true" className={`flex min-h-[52px] w-[52px] flex-none items-center justify-center bg-white text-tinta ${hoverBlanca}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
            </svg>
          </span>
        </div>
        {actual && resumen && <p className="mt-2.5 text-[14px] text-[#666666]">Precio para: {resumen}</p>}
        <div id="aviso-detalle" role="status" className="mt-2 min-h-[22px] text-[14px] font-medium">
          {aviso && falta ? (
            <span className="text-[#b3261e]">{falta}</span>
          ) : (
            actual && !disponible && <span className="text-acento">Esta combinación está agotada. Escríbenos para consultar por ella.</span>
          )}
        </div>

        {(producto.descripcion || delModelo) && (
          <div className="mt-[26px] flex max-w-[520px] flex-col gap-3">
            {producto.descripcion && <p className="text-[17px] leading-[1.5] whitespace-pre-line text-[#222222] [overflow-wrap:anywhere]">{producto.descripcion}</p>}
            {delModelo && <p className="text-[16px] text-[#666666]">{delModelo}</p>}
          </div>
        )}

        {(info.length > 0 || producto.caracteristicas.length > 0) && (
          <dl className="mt-9 grid max-w-[520px] grid-cols-2 gap-x-6 gap-y-[18px] py-[18px]">
            {info.map((i) => (
              <div key={i.nombre} className="flex min-w-0 flex-col gap-0.5">
                <dt className="text-[13px] text-[#666666]">{i.nombre}</dt>
                <dd className="text-[22px] leading-[1.3] [overflow-wrap:anywhere]">{i.valor}</dd>
              </div>
            ))}
            {producto.caracteristicas.length > 0 && (
              <div className="col-span-full flex flex-col gap-2">
                <dt className="text-[13px] text-[#666666]">Etiquetas</dt>
                <dd className="flex flex-wrap gap-x-5 gap-y-1">
                  {producto.caracteristicas.map((c) => (
                    <span key={c} className="inline-flex min-h-8 items-center text-[16px]">
                      {c}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        )}
        {modalidades.length > 0 && (
          <p className="mt-3.5 text-[15px] text-[#666666]">
            Disponible para {modalidades.length === 2 ? "compra y alquiler" : modalidades[0]}.
          </p>
        )}

        <div className="mt-9 max-w-[520px]">
          {cuidados.length > 0 && (
            <Acordeon id="detalles-cuidados" titulo="Detalles y cuidados" abierto={!!abiertos.cuidados} onCambiar={() => alternar("cuidados")}>
              <dl className="grid grid-cols-[max-content_1fr] gap-x-5 gap-y-2 leading-normal">
                {cuidados.map((c) => (
                  <div key={c.nombre} className="contents">
                    <dt className="font-semibold text-tinta">{c.nombre}</dt>
                    <dd className="[overflow-wrap:anywhere]">{c.valor}</dd>
                  </div>
                ))}
              </dl>
            </Acordeon>
          )}
          {tallas.length > 0 && (
            <Acordeon id="talla-ajuste" titulo="Talla y ajuste" abierto={!!abiertos.talla} onCambiar={() => alternar("talla")}>
              <div className="flex flex-col gap-2">
                <p>Tallas de este modelo: {tallas.map((t) => nombreOpcion("talla", t)).join(", ")}.</p>
                <p>
                  ¿No sabes cuál es tu talla?{" "}
                  <a href={enlaceWhatsApp(`Hola, quisiera ayuda para elegir mi talla de ${producto.nombre} en Fara Collection.`)} target="_blank" rel="noopener noreferrer" className={enlaceTexto}>
                    Escríbenos por WhatsApp
                  </a>{" "}
                  con tus medidas y te ayudamos a elegirla.
                </p>
              </div>
            </Acordeon>
          )}
          {seAlquila && pasos.length > 0 && (
            <Acordeon id="como-alquilar" titulo="Cómo funciona el alquiler" abierto={!!abiertos.alquiler} onCambiar={() => alternar("alquiler")}>
              <ol className="flex list-decimal flex-col gap-2 pl-5 leading-[1.55]">
                {pasos.map((paso, i) => (
                  <li key={i}>
                    <span className="font-semibold text-tinta">{paso.titulo}.</span> {paso.texto}
                  </li>
                ))}
              </ol>
            </Acordeon>
          )}
        </div>
      </div>
    </div>
  );
}
