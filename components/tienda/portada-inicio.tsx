"use client";

import Image from "next/image";
import { useState } from "react";
import type { DiapositivaLista } from "@/lib/contenido-servidor";
import { EnlaceContenido } from "./enlace-contenido";
import { botonAzul, botonBlanco } from "./estilos-inicio";
import { Vestido } from "./vestido";

// La misma condición de la variante `movil` de tienda.css
const MEDIA_MOVIL = "(max-width: 999px) and (orientation: portrait)";

const botonPortada = "movil:min-h-11 movil:flex-1 movil:px-3 movil:text-center";

// Con <picture> cada pantalla baja solo su foto. Por eso no lleva `priority`: precargaría la de
// computadora también en el celular. Si solo hay foto para celular, en computadora siguen las
// ilustraciones y la foto no se baja (lazy, porque está oculta).
function FotoPortada({ foto, fotoMovil }: Pick<DiapositivaLista, "foto" | "fotoMovil">) {
  const principal = foto ?? fotoMovil;
  if (!principal) return null;
  return (
    <picture className={`absolute inset-0 ${foto ? "" : "hidden movil:block"}`}>
      {fotoMovil && <source media={MEDIA_MOVIL} srcSet={fotoMovil.url} />}
      <Image src={principal.url} alt="" fill unoptimized loading={foto ? "eager" : "lazy"} fetchPriority="high" sizes="100vw" className="object-cover" />
    </picture>
  );
}

// Portada de la página de inicio. Sus textos, botones y fotos se editan en /admin/contenido;
// con más de una portada aparecen los guiones para pasar de una a otra. En computadora la caja de
// textos va sobre la foto; en celular, debajo, para que no la tape.
export function PortadaInicio({ diapositivas }: { diapositivas: DiapositivaLista[] }) {
  const [actual, setActual] = useState(0);
  const d = diapositivas[Math.min(actual, diapositivas.length - 1)];
  const varias = diapositivas.length > 1;

  return (
    <section
      id="inicio"
      aria-label="Portada"
      aria-roledescription={varias ? "carrusel" : undefined}
      className="pantalla relative flex items-center justify-center overflow-hidden bg-[#e5e5e5] p-6 [--alto-minimo:520px] movil:flex-col movil:items-stretch movil:justify-start movil:p-0 movil:[--alto-minimo:0px] bajo:py-3 bajo:[--alto-minimo:0px]"
    >
      <div className="absolute inset-0 movil:relative movil:min-h-[200px] movil:flex-auto">
        <FotoPortada key={actual} foto={d.foto} fotoMovil={d.fotoMovil} />
        {!d.foto && (
          // A los lados de la caja de textos; si no hay espacio, solo uno detrás de ella
          <div className={`contents ${d.fotoMovil ? "movil:hidden" : ""}`}>
            <Vestido forma="xv" color="#c3b1d9" etiqueta="Vestido de XV lila" className="absolute bottom-0 left-[4%] hidden h-[66%] w-auto lg:block" />
            <Vestido
              forma="sirena"
              color="#1f4d3d"
              etiqueta="Vestido de gala esmeralda corte sirena"
              className="absolute bottom-0 left-1/2 z-1 h-[86%] w-auto -translate-x-1/2 lg:right-[9%] lg:left-auto lg:translate-x-0"
            />
            <Vestido forma="sirena" color="#6b1c2e" etiqueta="Vestido de gala vino corte sirena" className="absolute right-[-2%] bottom-0 hidden h-[68%] w-auto lg:block" />
          </div>
        )}
      </div>
      <div className="relative z-2 mt-[14vh] flex w-[420px] max-w-full flex-col items-center bg-white px-7 py-6 text-center bajo:mt-0 bajo:py-4 movil:mt-0 movil:w-full movil:items-stretch movil:px-5 movil:pt-4 movil:pb-4 movil:text-left">
        {/* Al cambiar de portada, el lector de pantalla lee la nueva */}
        <div aria-live={varias ? "polite" : undefined} className="flex w-full flex-col items-center gap-3 movil:items-start movil:gap-2 bajo:gap-2">
          {d.antetitulo && <span className="text-[11px] leading-[16px] font-semibold tracking-[0.16em] text-[#555555] uppercase">{d.antetitulo}</span>}
          <h1 className="text-[26px] leading-[1.2] font-medium break-words text-tinta movil:text-[clamp(22px,6.4vw,28px)] movil:leading-[1.15]">{d.titulo}</h1>
          {d.texto && <p className="max-w-[36ch] text-[15px] leading-[1.55] text-[#444444] movil:text-[14px] movil:leading-[1.45]">{d.texto}</p>}
          <div className="mt-1 flex flex-wrap justify-center gap-2 movil:w-full movil:max-w-[420px]">
            <EnlaceContenido boton={d.botonPrincipal} className={`${botonAzul} ${botonPortada}`} />
            {d.botonSecundario.texto && <EnlaceContenido boton={d.botonSecundario} className={`${botonBlanco} ${botonPortada}`} />}
          </div>
        </div>
        {varias && (
          <div className="-mb-3 flex items-center movil:justify-center">
            {diapositivas.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ver portada ${i + 1}`}
                aria-current={i === actual ? "true" : undefined}
                onClick={() => setActual(i)}
                className="flex size-11 cursor-pointer items-center justify-center movil:h-8"
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
