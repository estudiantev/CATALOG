"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Boton } from "@/lib/contenido";
import type { DiapositivaLista } from "@/lib/contenido-servidor";
import { Vestido } from "./vestido";

const boton =
  "inline-flex min-h-13 min-w-37.5 items-center justify-center border-2 border-tinta px-7 text-[15px] leading-[20px] font-semibold tracking-[0.06em] uppercase transition-colors";
const botonOscuro = `${boton} bg-tinta text-white hover:bg-dorado hover:text-tinta active:bg-white active:text-tinta`;
const botonClaro = `${boton} bg-white hover:bg-arena active:bg-dorado`;

// Las páginas de la tienda navegan sin recargar; las secciones (#pasos) y los sitios externos
// son enlaces comunes
function Enlace({ boton, className }: { boton: Boton; className: string }) {
  return boton.enlace.startsWith("/") ? (
    <Link href={boton.enlace} className={className}>
      {boton.texto}
    </Link>
  ) : (
    <a href={boton.enlace} className={className}>
      {boton.texto}
    </a>
  );
}

// Portada de la página de inicio. Sus textos, botones y fotos se editan en /admin/contenido;
// con más de una portada aparecen los guiones para pasar de una a otra.
export function PortadaInicio({ diapositivas }: { diapositivas: DiapositivaLista[] }) {
  const [actual, setActual] = useState(0);
  const d = diapositivas[Math.min(actual, diapositivas.length - 1)];
  const varias = diapositivas.length > 1;

  return (
    <section
      aria-label="Portada"
      aria-roledescription={varias ? "carrusel" : undefined}
      className="relative flex flex-wrap items-end overflow-hidden border-b-2 border-tinta bg-[#e8cdc3]"
    >
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[11%] bg-[#d9b4a8]" />
      <div aria-hidden="true" className="absolute top-[9%] right-[6%] h-[64%] w-[clamp(120px,15vw,230px)] rounded-t-full border-10 border-b-0 border-[#f6eae6] bg-[#f1e0da]" />
      <div className="relative flex min-w-0 flex-[1_1_380px] flex-col gap-4.5 self-center px-[clamp(20px,3.6vw,54px)] py-[clamp(44px,5vw,80px)]">
        {/* Al cambiar de portada, el lector de pantalla lee la nueva */}
        <div aria-live={varias ? "polite" : undefined} className="flex flex-col gap-4.5">
          {d.antetitulo && (
            <span className="text-[13px] leading-[18px] font-semibold tracking-[0.16em] uppercase">{d.antetitulo}</span>
          )}
          <h1 className="text-[clamp(50px,5.8vw,92px)] leading-[0.98] font-light tracking-[-0.02em] break-words">{d.titulo}</h1>
          {d.texto && <p className="max-w-100 text-[18px] leading-[28px] text-grafito">{d.texto}</p>}
          <div className="flex flex-wrap gap-3 pt-1.5">
            <Enlace boton={d.botonPrincipal} className={botonOscuro} />
            {d.botonSecundario.texto && <Enlace boton={d.botonSecundario} className={botonClaro} />}
          </div>
        </div>
        {varias && (
          <div className="mt-[clamp(8px,3vw,40px)] flex items-center">
            {diapositivas.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ver portada ${i + 1}`}
                aria-current={i === actual ? "true" : undefined}
                onClick={() => setActual(i)}
                className="flex size-11 cursor-pointer items-center justify-center"
              >
                <span className={`block h-[3px] w-7.5 transition-colors ${i === actual ? "bg-tinta" : "bg-[#8c8176]"}`} />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="relative flex h-[clamp(420px,48vw,700px)] min-w-0 flex-[1.35_1_500px] items-end justify-center">
        {d.foto ? (
          <Image
            key={d.foto.url}
            src={d.foto.url}
            alt={d.foto.alt}
            fill
            unoptimized
            priority
            sizes="(min-width: 900px) 58vw, 100vw"
            className="object-cover"
          />
        ) : (
          <>
            <Vestido forma="xv" color="#c3b1d9" etiqueta="Vestido de XV lila" className="-mr-[11%] h-[66%] w-auto" />
            <Vestido forma="sirena" color="#1f4d3d" etiqueta="Vestido de gala esmeralda corte sirena" className="relative z-2 h-[94%] w-auto" />
            <Vestido forma="sirena" color="#6b1c2e" etiqueta="Vestido de gala vino corte sirena" className="-ml-[13%] h-[78%] w-auto" />
          </>
        )}
      </div>
    </section>
  );
}
