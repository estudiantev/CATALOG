import Image from "next/image";
import Link from "next/link";
import { CarruselDestacados } from "@/components/tienda/carrusel-destacados";
import { CuadroColeccion, CuadroOcasion } from "@/components/tienda/cuadro-coleccion";
import { enlaceWhatsApp } from "@/components/tienda/datos";
import { EnlaceContenido } from "@/components/tienda/enlace-contenido";
import {
  barraSeccion,
  botonEsquinaChico,
  botonEsquinaGrande,
  botonInicioVerde,
  columnasDivididas,
  letraContorno,
  textoDividido,
  tituloCaja,
  tituloSeccion,
} from "@/components/tienda/estilos-inicio";
import { IconoWhatsApp } from "@/components/tienda/iconos";
import { PortadaInicio } from "@/components/tienda/portada-inicio";
import { TarjetaDestacado } from "@/components/tienda/tarjeta-destacado";
import { Vestido } from "@/components/tienda/vestido";
import { VideoInspiracion } from "@/components/tienda/video-inspiracion";
import { leerContenidoInicio } from "@/lib/contenido-servidor";
import { resolverTarjeta } from "@/lib/variantes";

// Las fotos de la portada, las colecciones y los destacados usan URLs firmadas de S3 que vencen:
// se firman en cada visita. Los textos (tabla Content) y los productos sí van en caché
// (lib/contenido-servidor.ts).
export const dynamic = "force-dynamic";

// Los cuadros de colecciones van en una fila, uno al lado del otro (de 2 a 4). En el celular,
// uno debajo del otro.
const COLUMNAS_COLECCIONES: Record<number, string> = {
  2: "min-[901px]:grid-cols-2",
  3: "min-[901px]:grid-cols-3",
  4: "min-[901px]:grid-cols-4",
};

// Mapa de Google del local, sin clave de API: se arma con la dirección escrita en el panel
const urlMapa = (direccion: string) => `https://maps.google.com/maps?q=${encodeURIComponent(direccion)}&z=16&output=embed`;

export default async function InicioPage() {
  const { diapositivas, destacados, ocasiones, pasos, nosotros, inspiracion } = await leerContenidoInicio();
  // Sin filtros: la tarjeta muestra la primera variante con stock y el precio "desde"
  const tarjetas = (destacados?.productos ?? []).flatMap((producto) => {
    const datos = resolverTarjeta(producto, {});
    return datos ? [{ producto, ...datos }] : [];
  });
  // El título y el subtítulo van en una sola línea: "LOS MEJORES VESTIDOS · EDICIÓN ESPECIAL"
  const tituloCatalogo = [destacados?.titulo, destacados?.subtitulo].filter(Boolean).join(" · ");

  return (
    <div className="bg-white font-cuerpo text-[15px] text-tinta">
      <PortadaInicio diapositivas={diapositivas} />

      {destacados && tarjetas.length > 0 && (
        // Desde 1000 px la sección llena la pantalla y la fila de productos va al centro
        <section
          id="catalogo"
          aria-labelledby={tituloCatalogo ? "titulo-catalogo" : undefined}
          aria-label={tituloCatalogo ? undefined : "Catálogo"}
          className="flex flex-col justify-center bg-white px-[18px] pt-5 pb-14 min-[1000px]:pantalla min-[1000px]:py-3"
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            {/* El título y el subtítulo son opcionales */}
            {tituloCatalogo && (
              <h2 id="titulo-catalogo" className={`min-w-0 ${tituloSeccion}`}>
                {tituloCatalogo}
              </h2>
            )}
            <Link href="/vestidos" className={`ml-auto flex-none ${botonEsquinaChico}`}>
              Ver todo el catálogo
            </Link>
          </div>
          <CarruselDestacados etiqueta="Productos destacados">
            {tarjetas.map(({ producto, variantId, precioVenta, precioAlquiler, desde, portada, hover }) => (
              <li key={producto.productId} className="row-span-2 grid min-w-0 snap-start grid-rows-subgrid">
                <TarjetaDestacado
                  href={`/vestidos/${producto.productId}?v=${variantId}`}
                  nombre={producto.nombre}
                  precioVenta={precioVenta}
                  precioAlquiler={precioAlquiler}
                  desde={desde}
                  portada={portada}
                  hover={hover}
                  etiqueta={destacados.etiquetas[producto.productId]}
                  sizes="(min-width: 901px) 25vw, 72vw"
                />
              </li>
            ))}
          </CarruselDestacados>
        </section>
      )}

      {ocasiones && (
        <section id="colecciones" aria-label="Colecciones" className="flex flex-col justify-center bg-white px-[18px] py-10 min-[1000px]:pantalla">
          <div className={`grid grid-cols-1 gap-5 ${COLUMNAS_COLECCIONES[ocasiones.length]}`}>
            {ocasiones.map((tarjeta) => {
              const sizes = `(min-width: 901px) ${Math.ceil(100 / ocasiones.length)}vw, 100vw`;
              return "clave" in tarjeta ? (
                <CuadroOcasion key={tarjeta.clave} {...tarjeta} sizes={sizes} />
              ) : (
                <CuadroColeccion key={tarjeta.href} {...tarjeta} sizes={sizes} />
              );
            })}
          </div>
        </section>
      )}

      {pasos && (
        <section id="pasos" aria-labelledby="titulo-pasos" className="flex flex-col bg-white min-[1000px]:pantalla">
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
              className={`${botonInicioVerde} gap-2.5`}
            >
              <IconoWhatsApp />
              <span>{pasos.boton}</span>
            </a>
          </div>
          <ol className="grid flex-auto grid-cols-1 md:grid-cols-3">
            {pasos.pasos.map((paso, i) => (
              <li key={i} className="flex flex-col justify-between gap-4 bg-white p-6 md:gap-8 md:p-8">
                <span aria-hidden="true" className={`${letraContorno} text-[clamp(64px,12vw,176px)]`}>
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

      {/* Las dos últimas: un tercio de texto y dos tercios de video (o foto, o mapa) */}
      {inspiracion && (
        <section
          id="inspiracion"
          aria-labelledby={inspiracion.antetitulo ? "titulo-inspiracion" : undefined}
          aria-label={inspiracion.antetitulo ? undefined : "Inspiración"}
          className="flex bg-white p-[18px] min-[1000px]:pantalla"
        >
          <div className={columnasDivididas}>
            <div className="flex flex-col items-start pt-1">
              {inspiracion.antetitulo && (
                <h2 id="titulo-inspiracion" className={`mb-[34px] ${tituloSeccion}`}>
                  {inspiracion.antetitulo}
                </h2>
              )}
              <p className={textoDividido}>{inspiracion.texto}</p>
              <EnlaceContenido boton={inspiracion.boton} className={botonEsquinaGrande} />
            </div>
            {/* Desde 1000 px llena el alto de la sección; más abajo tiene el suyo */}
            <div className="relative flex min-h-[420px] items-end justify-center overflow-hidden bg-[#ebe4df] min-[1000px]:min-h-0">
              {inspiracion.video ? (
                <VideoInspiracion url={inspiracion.video.url} />
              ) : inspiracion.foto ? (
                <Image src={inspiracion.foto.url} alt="" fill unoptimized sizes="(min-width: 901px) 66vw, 100vw" className="object-cover" />
              ) : (
                <>
                  <Vestido forma="floreado" color="#bcd3e6" className="-mr-[4%] h-[72%] w-auto" />
                  <Vestido forma="sirena" color="#111111" className="relative z-1 h-[92%] w-auto" />
                  <Vestido forma="corto" color="#e6b4b2" className="-ml-[4%] h-[62%] w-auto" />
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {nosotros && (
        <section id="nosotros" aria-labelledby="titulo-nosotros" className="flex bg-white p-[18px] min-[1000px]:pantalla">
          <div className={columnasDivididas}>
            <div className="flex flex-col items-start pt-1">
              <h2 id="titulo-nosotros" className={`mb-[34px] ${tituloSeccion}`}>
                {nosotros.titulo}
              </h2>
              <p className={textoDividido}>{nosotros.texto}</p>
              {nosotros.boton.texto && <EnlaceContenido boton={nosotros.boton} className={botonEsquinaGrande} />}
            </div>
            {/* El mapa del local; sin dirección, la foto; sin foto, el recuadro vacío */}
            <div className="relative min-h-[360px] overflow-hidden bg-[#eeece8] min-[1000px]:min-h-0">
              {nosotros.direccion ? (
                <iframe
                  title={`Mapa: ${nosotros.direccion}`}
                  src={urlMapa(nosotros.direccion)}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 size-full border-0"
                />
              ) : (
                nosotros.foto && <Image src={nosotros.foto.url} alt="" fill unoptimized sizes="(min-width: 901px) 66vw, 100vw" className="object-cover" />
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
