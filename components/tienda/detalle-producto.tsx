"use client";

import { useState } from "react";
import { enlaceWhatsApp } from "@/components/tienda/datos";
import { GaleriaProducto } from "@/components/tienda/galeria-producto";
import type { ProductoDetalle, VarianteDetalle } from "@/lib/catalogo";
import { CATEGORIAS, CLAVES, type Clave, FAMILIAS_COLOR, NOMBRES_CLAVE, formatoSoles, nombreOpcion } from "@/lib/productos";
import { clavesDelProducto, elegirOpcion, estadoOpcion, varianteInicial } from "@/lib/variantes";

const etiqueta = "text-[12px] leading-[18px] font-semibold tracking-[0.1em] text-topo uppercase";

const ESTILO_OPCION = {
  elegida: "border-tinta bg-tinta text-white",
  compatible: "cursor-pointer border-tinta bg-white hover:bg-arena",
  cambia: "cursor-pointer border-dashed border-topo bg-white text-grafito hover:border-tinta hover:bg-arena",
  agotada: "cursor-not-allowed border-arena bg-lino text-topo line-through",
} as const;

// El nombre que se muestra de una opción; el color usa el nombre propio de la variante ("Vino")
const nombreEnVariante = (variante: VarianteDetalle, clave: Clave, valor: string) =>
  clave === "color" && variante.colorNombre ? variante.colorNombre : nombreOpcion(clave, valor);

// Abre WhatsApp con un mensaje que ya menciona el producto y la combinación elegida
function enlaceWhatsapp(nombre: string, variante?: VarianteDetalle) {
  const opciones = variante
    ? CLAVES.flatMap((clave) => {
        const valor = variante.opciones[clave];
        return valor ? [`${NOMBRES_CLAVE[clave]}: ${nombreEnVariante(variante, clave, valor)}`] : [];
      })
    : [];
  if (variante?.sku) opciones.push(`SKU: ${variante.sku}`);
  return enlaceWhatsApp(`Hola, quisiera consultar sobre ${nombre}${opciones.length ? ` (${opciones.join(", ")})` : ""} en Fara Collection.`);
}

export function DetalleProducto({ producto, variantIdInicial }: { producto: ProductoDetalle; variantIdInicial?: string }) {
  const { variantes } = producto;
  const [actual, setActual] = useState<VarianteDetalle | undefined>(() => varianteInicial(variantes, variantIdInicial));

  const claves = clavesDelProducto(variantes);
  const categoria = CATEGORIAS.find((c) => c.valor === producto.categoria)?.nombre;

  // Tocar una opción cambia de variante; la URL guarda la combinación para compartirla
  function elegir(clave: Clave, valor: string) {
    if (!actual) return;
    const nueva = elegirOpcion(variantes, actual, clave, valor);
    setActual(nueva);
    window.history.replaceState(null, "", `?v=${encodeURIComponent(nueva.variantId)}`);
  }

  const estados = actual
    ? claves.flatMap(({ clave, valores }) => valores.map((valor) => estadoOpcion(variantes, actual, clave, valor)))
    : [];

  const atributos = [
    { nombre: "Marca", valor: producto.marca },
    { nombre: "Diseñador", valor: producto.disenador },
    { nombre: "Ocasión", valor: producto.ocasion },
    { nombre: "Material", valor: producto.material },
    { nombre: "Características", valor: producto.caracteristicas.join(", ") },
    { nombre: "SKU", valor: actual?.sku },
  ].filter((a) => a.valor);

  return (
    <article className="mx-auto grid max-w-[1300px] gap-x-[75px] gap-y-10 px-4 pt-[clamp(40px,5vw,94px)] pb-[clamp(56px,6vw,96px)] md:grid-cols-[minmax(0,450px)_minmax(0,1fr)]">
      {/* Las fotos son las de la variante elegida: cambian con el color, el largo, etc. */}
      <GaleriaProducto key={actual?.fotos[0]?.url ?? "sin-foto"} fotos={actual?.fotos ?? []} />

      <div className="flex flex-col items-start">
        {categoria && <span className={etiqueta}>{categoria}</span>}
        <h1 className="mt-2 font-titulo text-[clamp(44px,5vw,72px)] leading-[1.05] text-tinta">{producto.nombre}</h1>
        {producto.descripcion && (
          <p className="mt-6 max-w-[620px] text-[20px] leading-[30px] text-grafito">{producto.descripcion}</p>
        )}

        {actual ? (
          <div aria-live="polite" className="mt-8 flex flex-col gap-1 text-[24px] leading-[32px]">
            <p>Precio de venta: {formatoSoles.format(actual.precioVenta)}</p>
            <p>Precio de alquiler: {formatoSoles.format(actual.precioAlquiler)} por día</p>
            {!actual.enStock && (
              <p className="mt-2 text-[16px] leading-[24px] font-semibold tracking-[0.1em] text-[#a3243b] uppercase">
                Agotada en esta combinación
              </p>
            )}
          </div>
        ) : (
          <p className="mt-8 text-[18px] text-grafito">Este producto todavía no está disponible.</p>
        )}

        {actual && claves.length > 0 && (
          <div className="mt-8 flex w-full max-w-[620px] flex-col gap-6">
            {claves.map(({ clave, valores }) => (
              <fieldset key={clave}>
                <legend className={`${etiqueta} mb-2.5`}>
                  {NOMBRES_CLAVE[clave]}
                  {actual.opciones[clave] && (
                    <span className="font-normal tracking-normal text-tinta normal-case">
                      : {nombreEnVariante(actual, clave, actual.opciones[clave])}
                    </span>
                  )}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {valores.map((valor) => {
                    const estado = estadoOpcion(variantes, actual, clave, valor);
                    // Para el color se muestra el tono real de la variante a la que se pasaría
                    const destino =
                      estado === "agotada"
                        ? variantes.find((v) => v.opciones[clave] === valor)
                        : elegirOpcion(variantes, actual, clave, valor);
                    const nombre = destino ? nombreEnVariante(destino, clave, valor) : nombreOpcion(clave, valor);
                    return (
                      <button
                        key={valor}
                        type="button"
                        aria-pressed={estado === "elegida"}
                        disabled={estado === "agotada"}
                        title={estado === "cambia" ? "Cambia otras opciones" : estado === "agotada" ? "Agotada" : undefined}
                        onClick={() => elegir(clave, valor)}
                        className={`inline-flex min-h-10 items-center gap-2 border-2 px-3.5 py-1.5 text-[15px] transition-colors ${ESTILO_OPCION[estado]}`}
                      >
                        {clave === "color" && (
                          <span
                            aria-hidden="true"
                            className={`size-4 flex-none rounded-full border ${estado === "elegida" ? "border-white" : "border-tinta"}`}
                            style={{
                              background: destino?.colorHex ?? FAMILIAS_COLOR.find((f) => f.valor === valor)?.muestra ?? "transparent",
                            }}
                          />
                        )}
                        {nombre}
                        {estado === "cambia" && <span className="sr-only"> (cambia otras opciones)</span>}
                        {estado === "agotada" && <span className="sr-only"> (agotada)</span>}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
            {estados.includes("cambia") && (
              <p className="text-[14px] text-topo">Las opciones con borde punteado cambian también otras elecciones.</p>
            )}
          </div>
        )}

        <a
          href={enlaceWhatsapp(producto.nombre, actual)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex h-[60px] items-center justify-center rounded-lg bg-tinta px-11 text-[18px] font-semibold tracking-[0.04em] text-white uppercase transition-colors hover:bg-grafito"
        >
          Contactar
        </a>

        {atributos.length > 0 && (
          <dl className="mt-12 grid w-full max-w-[620px] grid-cols-[minmax(0,130px)_minmax(0,1fr)] gap-x-6 gap-y-4 border-t border-arena pt-8 text-[17px]">
            {atributos.map((atributo) => (
              <div key={atributo.nombre} className="contents">
                <dt className={`${etiqueta} pt-0.5`}>{atributo.nombre}</dt>
                <dd>{atributo.valor}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
}
