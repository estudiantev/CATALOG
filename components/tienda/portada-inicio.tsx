"use client";

import Image from "next/image";
import { useState } from "react";
import type { DiapositivaLista } from "@/lib/contenido-servidor";
import { EnlaceContenido } from "./enlace-contenido";
import { botonCaja } from "./estilos-inicio";
import { Vestido } from "./vestido";

// Portada de la página de inicio. Sus textos, botones y fotos se editan en /admin/contenido;
// con más de una portada aparecen los guiones para pasar de una a otra.
export function PortadaInicio({ diapositivas }: { diapositivas: DiapositivaLista[] }) {
  const [actual, setActual] = useState(0);
  const d = diapositivas[Math.min(actual, diapositivas.length - 1)];
  const varias = diapositivas.length > 1;

  return (
    <section
      id="inicio"
      aria-label="Portada"
      aria-roledescription={varias ? "carrusel" : undefined}
      className="pantalla relative flex items-center justify-center overflow-hidden bg-[#e5e5e5] p-6 [--alto-minimo:520px]"
    >
      {d.foto ? (
        <Image key={d.foto.url} src={d.foto.url} alt="" fill unoptimized priority sizes="100vw" className="object-cover" />
      ) : (
        // A los lados de la caja de textos; si no hay espacio, solo uno detrás de ella
        <>
          <Vestido forma="xv" color="#c3b1d9" etiqueta="Vestido de XV lila" className="absolute bottom-0 left-[4%] hidden h-[66%] w-auto lg:block" />
          <Vestido
            forma="sirena"
            color="#1f4d3d"
            etiqueta="Vestido de gala esmeralda corte sirena"
            className="absolute bottom-0 left-1/2 z-1 h-[86%] w-auto -translate-x-1/2 lg:right-[9%] lg:left-auto lg:translate-x-0"
          />
          <Vestido forma="sirena" color="#6b1c2e" etiqueta="Vestido de gala vino corte sirena" className="absolute right-[-2%] bottom-0 hidden h-[68%] w-auto lg:block" />
        </>
      )}
      <div className="relative z-2 mt-[14vh] flex w-[420px] max-w-full flex-col items-center border border-tinta bg-white px-7 py-6 text-center">
        {/* Al cambiar de portada, el lector de pantalla lee la nueva */}
        <div aria-live={varias ? "polite" : undefined} className="flex w-full flex-col items-center gap-3">
          {d.antetitulo && <span className="text-[11px] leading-[16px] font-semibold tracking-[0.16em] text-[#555555] uppercase">{d.antetitulo}</span>}
          <h1 className="text-[26px] leading-[1.2] font-medium break-words text-tinta">{d.titulo}</h1>
          {d.texto && <p className="max-w-[36ch] text-[15px] leading-[1.55] text-[#444444]">{d.texto}</p>}
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            <EnlaceContenido boton={d.botonPrincipal} className={`${botonCaja} bg-acento text-white`} />
            {d.botonSecundario.texto && <EnlaceContenido boton={d.botonSecundario} className={`${botonCaja} bg-white text-tinta`} />}
          </div>
        </div>
        {varias && (
          <div className="-mb-3 flex items-center">
            {diapositivas.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ver portada ${i + 1}`}
                aria-current={i === actual ? "true" : undefined}
                onClick={() => setActual(i)}
                className="flex size-11 cursor-pointer items-center justify-center"
              >
                <span className={`block h-[3px] w-7.5 transition-colors ${i === actual ? "bg-acento" : "bg-[#bbbbbb]"}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
