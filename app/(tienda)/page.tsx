import Image from "next/image";
import Link from "next/link";
import { CarruselDestacados } from "@/components/tienda/carrusel-destacados";
import { enlaceWhatsApp } from "@/components/tienda/datos";
import { EnlaceContenido } from "@/components/tienda/enlace-contenido";
import { barraSeccion, botonVerde, letraContorno, tituloCaja } from "@/components/tienda/estilos-inicio";
import { IconoWhatsApp } from "@/components/tienda/iconos";
import { PortadaInicio } from "@/components/tienda/portada-inicio";
import { TarjetaColeccion, TarjetaOcasion } from "@/components/tienda/tarjeta-coleccion";
import { TarjetaDestacado } from "@/components/tienda/tarjeta-destacado";
import { Vestido } from "@/components/tienda/vestido";
import { VideoInspiracion } from "@/components/tienda/video-inspiracion";
import { leerContenidoInicio } from "@/lib/contenido-servidor";
import { resolverTarjeta } from "@/lib/variantes";

// Las fotos de la portada, las colecciones y los destacados usan URLs firmadas de S3 que vencen:
// se firman en cada visita. Los textos (tabla Content) y los productos sí van en caché
// (lib/contenido-servidor.ts).
export const dynamic = "force-dynamic";

// Según cuántas tarjetas de colecciones haya. Las filas siempre van completas: el fondo de la
// sección es oscuro y una celda vacía se vería como un hueco negro.
const COLUMNAS_COLECCIONES: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "min-[841px]:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
};

export default async function InicioPage() {
  const { diapositivas, destacados, ocasiones, pasos, nosotros, inspiracion } = await leerContenidoInicio();
  // Sin filtros: la tarjeta muestra la primera variante con stock y el precio "desde"
  const tarjetas = (destacados?.productos ?? []).flatMap((producto) => {
    const datos = resolverTarjeta(producto, {});
    return datos ? [{ producto, ...datos }] : [];
  });

  return (
    <div className="bg-white font-cuerpo text-[15px] text-tinta">
      <PortadaInicio diapositivas={diapositivas} />

      {destacados && tarjetas.length > 0 && (
        <section
          id="catalogo"
          aria-labelledby={destacados.titulo ? "titulo-catalogo" : undefined}
          aria-label={destacados.titulo ? undefined : "Catálogo"}
          className="flex flex-col border-t border-tinta bg-white min-[1000px]:pantalla"
        >
          {/* Mide lo mismo que la barra de avance de abajo (56 px): las fotos se llevan el resto del alto */}
          <div className="flex min-h-14 flex-none flex-wrap items-center justify-between gap-x-6 gap-y-1 px-[clamp(16px,3vw,32px)] py-1.5">
            {/* El título es opcional: sin caja ni color, con la misma letra que "Ver todo el catálogo" */}
            {(destacados.titulo || destacados.subtitulo) && (
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1">
                {destacados.titulo && (
                  <h2 id="titulo-catalogo" className="text-[15px] font-medium tracking-[0.06em] text-tinta uppercase">
                    {destacados.titulo}
                  </h2>
                )}
                {destacados.subtitulo && <p className="text-[13px] text-[#444444]">{destacados.subtitulo}</p>}
              </div>
            )}
            <Link
              href="/catalogo"
              className="ml-auto inline-flex min-h-11 items-center text-[15px] font-medium tracking-[0.06em] text-tinta uppercase transition-colors duration-150 hover:text-acento hover:underline hover:underline-offset-4"
            >
              Ver todo el catálogo
            </Link>
          </div>
          <CarruselDestacados etiqueta="Productos destacados">
            {tarjetas.map(({ producto, variantId, precioVenta, precioAlquiler, desde, portada, hover }) => (
              <li key={producto.productId} className="flex flex-none basis-[80%] snap-start min-[700px]:basis-1/2 min-[1000px]:basis-1/4">
                <TarjetaDestacado
                  href={`/catalogo/${producto.productId}?v=${variantId}`}
                  nombre={producto.nombre}
                  precioVenta={precioVenta}
                  precioAlquiler={precioAlquiler}
                  desde={desde}
                  portada={portada}
                  hover={hover}
                  etiqueta={destacados.etiquetas[producto.productId]}
                  sizes="(min-width: 1000px) 25vw, (min-width: 700px) 50vw, 80vw"
                />
              </li>
            ))}
          </CarruselDestacados>
        </section>
      )}

      {ocasiones && (
        <section id="colecciones" aria-label="Colecciones" className={`grid grid-cols-1 gap-px border-t border-tinta bg-tinta min-[1000px]:pantalla ${COLUMNAS_COLECCIONES[ocasiones.length]}`}>
          {ocasiones.map((tarjeta) =>
            "clave" in tarjeta ? (
              <TarjetaOcasion key={tarjeta.clave} {...tarjeta} sizes="(min-width: 640px) 50vw, 100vw" grande />
            ) : (
              <TarjetaColeccion key={tarjeta.href} {...tarjeta} sizes="(min-width: 640px) 50vw, 100vw" grande />
            ),
          )}
        </section>
      )}

      {pasos && (
        <section id="pasos" aria-labelledby="titulo-pasos" className="flex flex-col border-t border-tinta bg-white min-[1000px]:pantalla">
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
              className={`${botonVerde} gap-2.5`}
            >
              <IconoWhatsApp />
              <span>{pasos.boton}</span>
            </a>
          </div>
          <ol className="grid flex-auto grid-cols-1 gap-px bg-tinta md:grid-cols-3">
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

      {nosotros && (
        <section id="nosotros" aria-label="Quiénes somos" className="relative flex items-center justify-center border-t border-tinta bg-tinte-verde px-6 py-12 min-[1000px]:pantalla min-[1000px]:pt-[72px]">
          {nosotros.foto && <Image src={nosotros.foto.url} alt="" fill unoptimized sizes="100vw" className="object-cover" />}
          <div className="relative flex w-[620px] max-w-full flex-col gap-[18px] border border-tinta bg-white p-6 sm:p-10">
            <h2 className={`${letraContorno} text-[clamp(32px,4.4vw,54px)]`}>{nosotros.titulo}</h2>
            {nosotros.lema && <p className="text-[17px] font-bold text-acento">{nosotros.lema}</p>}
            <p className="text-[15px] leading-[1.65] text-[#444444]">{nosotros.texto}</p>
          </div>
        </section>
      )}

      {inspiracion && (
        <section id="inspiracion" aria-label="Inspiración" className="flex flex-wrap border-t border-tinta bg-white min-[1000px]:pantalla">
          <div className="flex flex-[2_1_360px] flex-col items-start gap-5 border-tinta px-8 py-10 max-[840px]:border-b min-[841px]:border-r">
            {inspiracion.antetitulo && <span className="text-[11px] leading-[16px] font-semibold tracking-[0.16em] text-acento2-oscuro uppercase">{inspiracion.antetitulo}</span>}
            <p className="max-w-[30ch] text-[24px] leading-[1.3] font-medium text-tinta">{inspiracion.texto}</p>
            <EnlaceContenido boton={inspiracion.boton} className={botonVerde} />
          </div>
          <div className="flex flex-[3_1_480px] p-6">
            <div className="relative flex min-h-[360px] flex-auto items-end justify-center overflow-hidden border border-tinta bg-tinte-azul">
              {inspiracion.video ? (
                <VideoInspiracion url={inspiracion.video.url} />
              ) : inspiracion.foto ? (
                <Image src={inspiracion.foto.url} alt="" fill unoptimized sizes="(min-width: 841px) 60vw, 100vw" className="object-cover" />
              ) : (
                <>
                  <Vestido forma="floreado" color="#bcd3e6" className="-mr-[4%] h-[72%] w-auto" />
                  <Vestido forma="sirena" color="#111111"className="relative z-1 h-[92%] w-auto" />
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
