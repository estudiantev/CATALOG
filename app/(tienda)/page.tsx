import Link from "next/link";
import type { ComponentProps } from "react";
import { COLECCIONES, COLORES, enlaceWhatsApp } from "@/components/tienda/datos";
import { PortadaInicio } from "@/components/tienda/portada-inicio";
import { TarjetaProducto } from "@/components/tienda/tarjeta-producto";
import { Vestido } from "@/components/tienda/vestido";
import type { ClaveOcasion } from "@/lib/contenido";
import { leerContenidoInicio } from "@/lib/contenido-servidor";
import { resolverTarjeta } from "@/lib/variantes";

// Las fotos de la portada y de los destacados usan URLs firmadas de S3 que vencen: se firman
// en cada visita. Los textos (tabla Content) y los productos sí van en caché (lib/contenido-servidor.ts).
export const dynamic = "force-dynamic";

type Ilustracion = ComponentProps<typeof Vestido>;

// Los nombres y enlaces salen de COLECCIONES (también arman el menú); la modalidad y la
// descripción de cada una se editan en /admin/contenido
const OCASIONES: { coleccion: (typeof COLECCIONES)[number]; clave: ClaveOcasion; numero: string; vestido: Ilustracion }[] = [
  { coleccion: COLECCIONES[0], clave: "gala", numero: "01", vestido: { forma: "sirena", color: "#1d1a1b", className: "h-[94%] w-auto" } },
  { coleccion: COLECCIONES[1], clave: "xv", numero: "02", vestido: { forma: "xv", color: "#e6b4b2", className: "mb-[2%] h-[90%] w-auto" } },
  { coleccion: COLECCIONES[2], clave: "cortos", numero: "03", vestido: { forma: "corto", color: "#a3243b", className: "h-[96%] w-auto" } },
  { coleccion: COLECCIONES[3], clave: "floreados", numero: "04", vestido: { forma: "floreado", color: "#bcd3e6", className: "h-[96%] w-auto" } },
];

const tarjeta = "group flex h-full flex-col bg-white text-tinta transition-colors hover:bg-arena active:bg-dorado";
const nombreTarjeta = "group-hover:underline group-hover:underline-offset-4";
const marcoIlustracion = "overflow-hidden [&_svg]:transition-transform [&_svg]:duration-[600ms] group-hover:[&_svg]:scale-[1.04]";
const etiqueta = "text-[12px] leading-[18px] font-semibold tracking-[0.1em] text-topo uppercase";
const tituloSeccion = "text-[clamp(24px,2vw,30px)] leading-[1.2] font-medium tracking-[0.08em] uppercase";
const botonOscuro = "inline-flex min-h-13 items-center justify-center border-2 border-tinta bg-tinta font-semibold tracking-[0.06em] text-white uppercase transition-colors hover:bg-dorado hover:text-tinta active:bg-white active:text-tinta";

export default async function InicioPage() {
  const { diapositivas, ocasiones, destacados, pasos } = await leerContenidoInicio();
  // Sin filtros: la tarjeta muestra la primera variante con stock y el precio "desde"
  const tarjetas = (destacados?.productos ?? []).flatMap((producto) => {
    const datos = resolverTarjeta(producto, {});
    return datos ? [{ producto, ...datos }] : [];
  });

  return (
    <>
      <PortadaInicio diapositivas={diapositivas} />

      <section id="colores" aria-labelledby="titulo-colores" className="bg-crema pt-[clamp(36px,4vw,56px)]">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 px-[clamp(16px,3.6vw,54px)] pb-6 h-[45px]">
          <h2 id="titulo-colores" className="text-[28px] leading-[1.2] font-normal tracking-[0.08em] uppercase">
            Compra por color
          </h2>
        </div>
        <ul aria-label="Colores" className="flex flex-wrap border-t-2 border-tinta lg:h-[177px]">
          {COLORES.map((color) => (
            <li key={color.nombre} className="min-w-0 flex-[1_1_clamp(110px,10vw,160px)] border-r-2 border-b-2 border-tinta">
              <Link href={color.href} className={tarjeta}>
                <span aria-hidden="true" className="block aspect-[4/3]" style={{ background: color.hex }} />
                <span className={`${nombreTarjeta} block border-t-2 border-tinta px-3.5 py-3 text-[16px] leading-[22px]`}>
                  {color.nombre}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {ocasiones && (
        <section id="colecciones" aria-label="Ocasiones" className="bg-crema pt-[clamp(36px,4vw,56px)]">
          <ul className="border-t-2 border-tinta">
            {OCASIONES.map((ocasion) => (
              <li key={ocasion.numero} className="border-b-2 border-tinta">
                <Link href={ocasion.coleccion.href} className="group flex items-center gap-[clamp(12px,2.4vw,36px)] px-[clamp(16px,3.6vw,54px)] py-[clamp(14px,1.6vw,22px)] transition-colors hover:bg-arena active:bg-dorado">
                  <span className="w-[clamp(28px,4.4vw,72px)] flex-none text-[15px] leading-[20px] font-medium tracking-[0.08em]">
                    {ocasion.numero}
                  </span>
                  <span className="flex min-w-0 flex-auto flex-wrap items-center gap-x-10 gap-y-1.5">
                    <span className={`${nombreTarjeta} min-w-0 flex-[1_1_300px] text-[clamp(36px,4.6vw,72px)] leading-[1.05] font-light tracking-[-0.02em]`}>
                      {ocasion.coleccion.nombre}
                    </span>
                    <span className="flex min-w-0 flex-[1_1_280px] flex-col gap-0.5">
                      <span className={etiqueta}>{ocasiones[ocasion.clave].modalidad}</span>
                      <span className="text-[16px] leading-[24px] text-grafito">{ocasiones[ocasion.clave].descripcion}</span>
                    </span>
                  </span>
                  <span className={`${marcoIlustracion} flex aspect-square w-[clamp(64px,7.4vw,112px)] flex-none items-end justify-center border-2 border-tinta bg-lino`}>
                    <Vestido {...ocasion.vestido} />
                  </span>
                  <span className="flex size-11 flex-none items-center justify-center rounded-full border-2 border-tinta">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {destacados && tarjetas.length > 0 && (
        <section id="catalogo" aria-labelledby="titulo-catalogo" className="bg-crema pt-[clamp(56px,6vw,88px)]">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 px-[clamp(16px,3.6vw,54px)] pb-6">
            <div className="flex flex-col gap-1">
              <h2 id="titulo-catalogo" className={tituloSeccion}>
                {destacados.titulo}
              </h2>
              {destacados.subtitulo && <p className="text-topo">{destacados.subtitulo}</p>}
            </div>
            <Link href="/catalogo" className="text-[15px] leading-[22px] font-semibold tracking-[0.08em] uppercase underline underline-offset-[5px] transition-colors hover:bg-arena active:bg-dorado">
              Ver todo
            </Link>
          </div>
          <ul aria-label="Productos destacados" className="grid grid-cols-2 border-t-2 border-tinta lg:grid-cols-4">
            {tarjetas.map(({ producto, variantId, precioVenta, precioAlquiler, desde, portada, hover }) => (
              <li key={producto.productId} className="border-r-2 border-b-2 border-tinta bg-white">
                <TarjetaProducto
                  href={`/catalogo/${producto.productId}?v=${variantId}`}
                  nombre={producto.nombre}
                  marca={producto.marca}
                  precioVenta={precioVenta}
                  precioAlquiler={precioAlquiler}
                  desde={desde}
                  portada={portada}
                  hover={hover}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {pasos && (
        <section id="pasos" className="mt-[clamp(56px,6vw,88px)] border-t-2 border-tinta bg-piedra">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 px-[clamp(16px,3.6vw,54px)] pt-[clamp(40px,4.4vw,64px)] pb-7">
            <h2 className={tituloSeccion}>{pasos.titulo}</h2>
            {pasos.subtitulo && <p className="text-grafito">{pasos.subtitulo}</p>}
          </div>
          <ol className="flex flex-wrap border-t-2 border-tinta">
            {pasos.pasos.map((paso, i) => {
              const ultimo = i === pasos.pasos.length - 1;
              return (
                <li key={i} className={`flex min-w-0 flex-[1_1_260px] flex-col gap-2.5 border-b-2 border-tinta px-[clamp(16px,2.4vw,36px)] py-[clamp(24px,2.6vw,40px)] ${ultimo ? "items-start" : "border-r-2"}`}>
                  <span aria-hidden="true" className="text-[clamp(48px,4.4vw,68px)] leading-none font-light">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[22px] leading-[28px] font-medium">{paso.titulo}</span>
                  <span className="text-grafito">{paso.texto}</span>
                  {ultimo && (
                    <a
                      href={enlaceWhatsApp("Hola, quisiera reservar un vestido en Fara Collection.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${botonOscuro} mt-2 gap-2.5 px-6 text-[14px] leading-[20px]`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.2A8 8 0 1 1 20 11.5z" />
                      </svg>
                      <span>{pasos.boton}</span>
                    </a>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </>
  );
}
