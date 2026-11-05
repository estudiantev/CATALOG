"use client";

import Link from "next/link";
import { useState } from "react";
import { enlaceWhatsApp } from "@/components/tienda/datos";
import { barraSeccion, botonCaja, cajaNav, letraContorno, tituloCaja } from "@/components/tienda/estilos-inicio";
import { GaleriaProducto } from "@/components/tienda/galeria-producto";
import { Flecha, IconoWhatsApp } from "@/components/tienda/iconos";
import type { ProductoDetalle, VarianteDetalle } from "@/lib/catalogo";
import { CATEGORIAS, CLAVES, type Clave, FAMILIAS_COLOR, NOMBRES_CLAVE, formatoSoles, nombreOpcion } from "@/lib/productos";
import { clavesDelProducto, elegirOpcion, estadoOpcion, varianteInicial } from "@/lib/variantes";

const etiqueta = "text-[11px] leading-[16px] font-semibold tracking-[0.16em] text-acento2-oscuro uppercase";
const bloque = "bg-white px-[clamp(16px,2.4vw,32px)] py-6";

const hoverOpcion = "cursor-pointer hover:border-acento2 hover:bg-acento2 hover:text-white";
const ESTILO_OPCION = {
  elegida: "border-acento bg-acento text-white",
  compatible: `border-tinta bg-white text-tinta ${hoverOpcion}`,
  cambia: `border-dashed border-tinta bg-white text-tinta ${hoverOpcion}`,
  agotada: "cursor-not-allowed border-[#bbbbbb] bg-[#f3f3f3] text-[#666666] line-through",
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

function Precio({ nombre, valor }: { nombre: string; valor: number }) {
  return (
    <p className={`${bloque} flex flex-col gap-1.5`}>
      <span className={etiqueta}>{nombre}</span>
      <span className="font-archivo text-[clamp(20px,2.3vw,30px)] leading-[1.1] font-black font-stretch-expanded tracking-[0.01em]">{formatoSoles.format(valor)}</span>
    </p>
  );
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
    <article className="bg-white font-cuerpo text-[15px] text-tinta">
      <div className={barraSeccion}>
        {categoria && <p className={tituloCaja}>{categoria}</p>}
        <Link href="/catalogo" className={`${cajaNav} gap-2`}>
          <Flecha tamano={14} className="rotate-180" />
          Volver al catálogo
        </Link>
      </div>

      {/* gap-px sobre fondo negro: las líneas de la cuadrícula, como en la página de inicio */}
      <div className="grid gap-px bg-tinta menu:grid-cols-2">
        {/* Las fotos son las de la variante elegida: cambian con el color, el largo, etc. */}
        <GaleriaProducto key={actual?.fotos[0]?.url ?? "sin-foto"} nombre={producto.nombre} fotos={actual?.fotos ?? []} />

        <div className="flex min-w-0 flex-col gap-px [&>:last-child]:flex-auto">
          <div className={bloque}>
            <h1 className={`${letraContorno} text-[clamp(30px,3.4vw,46px)] leading-[1.14]! break-words`}>{producto.nombre}</h1>
          </div>

          {actual ? (
            <div aria-live="polite" className="flex flex-col gap-px">
              {/* Se apilan si no caben: el precio no se parte en dos líneas */}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-px">
                <Precio nombre="Venta" valor={actual.precioVenta} />
                <Precio nombre="Alquiler por día" valor={actual.precioAlquiler} />
              </div>
              {!actual.enStock && (
                <p className="bg-tinte-azul px-[clamp(16px,2.4vw,32px)] py-2.5 text-[11px] leading-[16px] font-semibold tracking-[0.16em] text-acento uppercase">
                  Agotada en esta combinación
                </p>
              )}
            </div>
          ) : (
            <p className={`${bloque} text-[#444444]`}>Este producto todavía no está disponible.</p>
          )}

          {actual && claves.length > 0 && (
            <div className={`${bloque} flex flex-col gap-5`}>
              {claves.map(({ clave, valores }) => (
                <fieldset key={clave}>
                  <legend className={`${etiqueta} mb-2`}>
                    {NOMBRES_CLAVE[clave]}
                    {actual.opciones[clave] && (
                      <span className="text-[13px] font-normal tracking-normal text-tinta normal-case">
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
                          className={`inline-flex min-h-10 items-center gap-2 border px-3.5 py-1.5 font-archivo text-[12px] font-semibold tracking-[0.08em] uppercase transition-colors duration-150 ${ESTILO_OPCION[estado]}`}
                        >
                          {clave === "color" && (
                            <span
                              aria-hidden="true"
                              className={`size-3 flex-none border ${estado === "elegida" ? "border-white" : "border-tinta"}`}
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
                <p className="text-[13px] text-[#555555]">Las opciones con borde punteado cambian también otras elecciones.</p>
              )}
            </div>
          )}

          <div className={bloque}>
            <a
              href={enlaceWhatsapp(producto.nombre, actual)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${botonCaja} w-full gap-2.5 bg-acento2 py-3.5 text-white`}
            >
              <IconoWhatsApp />
              Contactar por WhatsApp
            </a>
          </div>

          {producto.descripcion && <p className={`${bloque} text-[15px] leading-[1.65] text-[#444444]`}>{producto.descripcion}</p>}

          {atributos.length > 0 && (
            <dl className="divide-y divide-tinta bg-white">
              {atributos.map((atributo) => (
                <div key={atributo.nombre} className="grid grid-cols-[minmax(0,130px)_minmax(0,1fr)] items-baseline gap-x-4 px-[clamp(16px,2.4vw,32px)] py-3">
                  <dt className={etiqueta}>{atributo.nombre}</dt>
                  <dd>{atributo.valor}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </article>
  );
}
