import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
import { COLECCIONES, COLORES, enlaceWhatsApp } from "@/components/tienda/datos";
import { EnlaceContenido } from "@/components/tienda/enlace-contenido";
import { barraSeccion, botonAncho, botonCaja, chip, letraContorno, tituloCaja } from "@/components/tienda/estilos-inicio";
import { PortadaInicio } from "@/components/tienda/portada-inicio";
import { TarjetaDestacado } from "@/components/tienda/tarjeta-destacado";
import { Vestido } from "@/components/tienda/vestido";
import { type ClaveOcasion, PRODUCTOS_POR_FILA } from "@/lib/contenido";
import { leerContenidoInicio } from "@/lib/contenido-servidor";
import { resolverTarjeta } from "@/lib/variantes";

// Las fotos de la portada, las colecciones y los destacados usan URLs firmadas de S3 que vencen:
// se firman en cada visita. Los textos (tabla Content) y los productos sí van en caché
// (lib/contenido-servidor.ts).
export const dynamic = "force-dynamic";

type Ilustracion = ComponentProps<typeof Vestido>;

// Los nombres y enlaces salen de COLECCIONES (también arman el menú); la modalidad, la
// descripción y la foto de cada una se editan en /admin/contenido. Sin foto se ve la ilustración.
const OCASIONES: { coleccion: (typeof COLECCIONES)[number]; clave: ClaveOcasion; vestido: Ilustracion }[] = [
  { coleccion: COLECCIONES[0], clave: "gala", vestido: { forma: "sirena", color: "#1d1a1b", className: "h-[94%] w-auto" } },
  { coleccion: COLECCIONES[1], clave: "xv", vestido: { forma: "xv", color: "#e6b4b2", className: "mb-[2%] h-[90%] w-auto" } },
  { coleccion: COLECCIONES[2], clave: "cortos", vestido: { forma: "corto", color: "#a3243b", className: "h-[96%] w-auto" } },
  { coleccion: COLECCIONES[3], clave: "floreados", vestido: { forma: "floreado", color: "#bcd3e6", className: "h-[96%] w-auto" } },
];

function Flecha({ tamano }: { tamano: number }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default async function InicioPage() {
  const { diapositivas, destacados, ocasiones, pasos, nosotros, inspiracion } = await leerContenidoInicio();
  // Sin filtros: la tarjeta muestra la primera variante con stock y el precio "desde"
  const tarjetas = (destacados?.productos ?? []).flatMap((producto) => {
    const datos = resolverTarjeta(producto, {});
    return datos ? [{ producto, ...datos }] : [];
  });
  const filas = [tarjetas.slice(0, PRODUCTOS_POR_FILA), tarjetas.slice(PRODUCTOS_POR_FILA)].filter((fila) => fila.length > 0);

  const filaDeProductos = (fila: typeof tarjetas, conBorde: boolean) => (
    <ul
      aria-label="Productos destacados"
      className={`grid min-h-[250px] flex-[1_1_0] grid-cols-[repeat(5,minmax(180px,1fr))] overflow-x-auto [scrollbar-width:thin] ${conBorde ? "border-b border-tinta" : ""}`}
    >
      {fila.map(({ producto, variantId, precioVenta, precioAlquiler, desde, portada, hover }) => (
        <li key={producto.productId} className="min-w-0">
          <TarjetaDestacado
            href={`/catalogo/${producto.productId}?v=${variantId}`}
            nombre={producto.nombre}
            precioVenta={precioVenta}
            precioAlquiler={precioAlquiler}
            desde={desde}
            portada={portada}
            hover={hover}
            etiqueta={destacados?.etiquetas[producto.productId]}
            sizes="(min-width: 1024px) 20vw, 180px"
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="bg-white font-cuerpo text-[15px] text-tinta">
      <PortadaInicio diapositivas={diapositivas} />

      {destacados && filas.length > 0 && (
        <section id="catalogo" aria-labelledby="titulo-catalogo" className="pantalla flex flex-col border-t border-tinta bg-white">
          <div className={barraSeccion}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <h2 id="titulo-catalogo" className={tituloCaja}>
                {destacados.titulo}
              </h2>
              {destacados.subtitulo && <p className="text-[13px] text-[#444444]">{destacados.subtitulo}</p>}
            </div>
            <nav aria-label="Comprar por color" className="flex max-w-full items-stretch overflow-x-auto border border-tinta [scrollbar-width:none]">
              {COLORES.map((color, i) => (
                <Link key={color.nombre} href={color.href} className={`${chip} ${i > 0 ? "border-l border-tinta" : ""}`}>
                  <span aria-hidden="true" className="size-2.5 flex-none border border-tinta" style={{ background: color.hex }} />
                  {color.nombre}
                </Link>
              ))}
            </nav>
          </div>
          {filaDeProductos(filas[0], true)}
          <div className={`flex flex-none justify-center py-2.5 ${filas[1] ? "border-b border-tinta" : ""}`}>
            <Link href="/catalogo" className={botonAncho}>
              Ver todo <Flecha tamano={14} />
            </Link>
          </div>
          {filas[1] && filaDeProductos(filas[1], false)}
        </section>
      )}

      {ocasiones && (
        <section id="colecciones" aria-label="Colecciones" className="pantalla grid grid-cols-1 gap-px border-t border-tinta bg-tinta sm:grid-cols-2 xl:grid-cols-4">
          {OCASIONES.map(({ coleccion, clave, vestido }) => {
            const { modalidad, descripcion, foto } = ocasiones[clave];
            return (
              <Link
                key={clave}
                href={coleccion.href}
                className="group relative flex min-h-[420px] flex-col items-start justify-end overflow-hidden bg-acento2 p-7 text-white transition-[filter] duration-200 hover:brightness-90"
              >
                {foto ? (
                  <>
                    <Image src={foto.url} alt={foto.alt} fill unoptimized sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                    <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                  </>
                ) : (
                  <span aria-hidden="true" className="absolute inset-x-0 top-6 bottom-[170px] flex items-end justify-center">
                    <Vestido {...vestido} />
                  </span>
                )}
                <span className="relative text-[10px] leading-[15px] font-semibold tracking-[0.16em] uppercase">{modalidad}</span>
                <span className="relative mt-2 font-archivo text-[26px] leading-[1.02] font-black font-stretch-expanded tracking-[0.01em] uppercase">{coleccion.nombre}</span>
                <span className="relative mt-2 text-[14px] leading-[1.4]">{descripcion}</span>
                <span className="relative mt-3.5 inline-flex items-center gap-2 border border-white bg-white px-3 py-2 font-archivo text-[10px] font-bold tracking-[0.14em] text-tinta uppercase transition-[background-color,color,gap] duration-200 group-hover:gap-3 group-hover:bg-transparent group-hover:text-white">
                  Ver colección <Flecha tamano={12} />
                </span>
              </Link>
            );
          })}
        </section>
      )}

      {pasos && (
        <section id="pasos" aria-labelledby="titulo-pasos" className="pantalla flex flex-col border-t border-tinta bg-white">
          <div className={barraSeccion}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <h2 id="titulo-pasos" className={tituloCaja}>
                {pasos.titulo}
              </h2>
              {pasos.subtitulo && <p className="text-[13px] text-[#444444]">{pasos.subtitulo}</p>}
            </div>
            <a
              href={enlaceWhatsApp("Hola, quisiera reservar un vestido en Fara Collection.")}
              target="_blank"
              rel="noopener noreferrer"
              className={`${botonCaja} gap-2.5 bg-acento2 text-white`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.2A8 8 0 1 1 20 11.5z" />
              </svg>
              <span>{pasos.boton}</span>
            </a>
          </div>
          <ol className="grid flex-auto grid-cols-1 gap-px bg-tinta md:grid-cols-3">
            {pasos.pasos.map((paso, i) => (
              <li key={i} className="flex flex-col justify-between gap-8 bg-white p-8">
                <span aria-hidden="true" className={`${letraContorno} text-[clamp(88px,12vw,176px)]`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex flex-col gap-2">
                  <span className="text-[24px] leading-[1.3] font-medium">{paso.titulo}</span>
                  <span className="text-[15px] leading-[1.55] text-[#444444]">{paso.texto}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {nosotros && (
        <section id="nosotros" aria-label="Quiénes somos" className="pantalla relative flex items-center justify-center border-t border-tinta bg-tinte-verde px-6 pt-[72px] pb-12">
          {nosotros.foto && <Image src={nosotros.foto.url} alt={nosotros.foto.alt} fill unoptimized sizes="100vw" className="object-cover" />}
          <div className="relative flex w-[620px] max-w-full flex-col gap-[18px] border border-tinta bg-white p-6 sm:p-10">
            <h2 className={`${letraContorno} text-[clamp(32px,4.4vw,54px)]`}>{nosotros.titulo}</h2>
            {nosotros.lema && <p className="text-[17px] font-bold text-acento">{nosotros.lema}</p>}
            <p className="text-[15px] leading-[1.65] text-[#444444]">{nosotros.texto}</p>
          </div>
        </section>
      )}

      {inspiracion && (
        <section id="inspiracion" aria-label="Inspiración" className="pantalla flex flex-wrap border-t border-tinta bg-white">
          <div className="flex flex-[2_1_360px] flex-col items-start gap-5 border-tinta px-8 py-10 max-[840px]:border-b min-[841px]:border-r">
            {inspiracion.antetitulo && <span className="text-[11px] leading-[16px] font-semibold tracking-[0.16em] text-acento2-oscuro uppercase">{inspiracion.antetitulo}</span>}
            <p className="max-w-[30ch] text-[24px] leading-[1.3] font-medium text-tinta">{inspiracion.texto}</p>
            <EnlaceContenido boton={inspiracion.boton} className={`${botonCaja} bg-acento2 text-white`} />
          </div>
          <div className="flex flex-[3_1_480px] p-6">
            <div className="relative flex min-h-[360px] flex-auto items-end justify-center overflow-hidden border border-tinta bg-tinte-azul">
              {inspiracion.foto ? (
                <Image src={inspiracion.foto.url} alt={inspiracion.foto.alt} fill unoptimized sizes="(min-width: 841px) 60vw, 100vw" className="object-cover" />
              ) : (
                <>
                  <Vestido forma="floreado" color="#bcd3e6" className="-mr-[4%] h-[72%] w-auto" />
                  <Vestido forma="sirena" color="#010081" className="relative z-1 h-[92%] w-auto" />
                  <Vestido forma="corto" color="#e6b4b2" className="-ml-[4%] h-[62%] w-auto" />
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
