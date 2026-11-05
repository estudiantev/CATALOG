"use client";

import Image from "next/image";
import { useState } from "react";

const fondo = "min-w-0 bg-[#f3f3f3]";
// En escritorio llena la pantalla debajo del encabezado y de la barra de la categoría (58px) y
// se queda fija mientras se baja por la información del producto
const marco = "relative aspect-[9/11] menu:sticky menu:top-0 menu:aspect-auto menu:h-[max(560px,calc(100dvh-var(--alto-marco)-58px))]";

export type FotoGaleria = { url: string; miniatura: string };

// Foto grande y, si hay varias, miniaturas (versión liviana) para cambiarla. La foto grande no
// se recorta, para que siempre se vea el vestido completo.
export function GaleriaProducto({ nombre, fotos }: { nombre: string; fotos: FotoGaleria[] }) {
  const [elegida, setElegida] = useState(0);
  // Al cambiar de variante puede haber menos fotos que antes
  const actual = Math.min(elegida, fotos.length - 1);

  if (fotos.length === 0) {
    return (
      <div className={fondo}>
        <div className={`${marco} flex items-center justify-center`}>
          <span className="text-[11px] font-semibold tracking-[0.16em] text-[#555555] uppercase">Sin foto</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-px menu:flex-row-reverse">
      <div className={`${fondo} flex-auto`}>
        <div className={marco}>
          <Image src={fotos[actual].url} alt={nombre} fill unoptimized priority sizes="(min-width: 861px) 50vw, 100vw" className="object-contain" />
        </div>
      </div>
      {fotos.length > 1 && (
        <div className="flex-none bg-white menu:w-[clamp(64px,5.5vw,88px)]">
          <ul className="grid grid-cols-6 menu:sticky menu:top-0 menu:flex menu:flex-col">
            {fotos.map((foto, i) => (
              <li key={foto.url} className="border-r border-tinta menu:border-r-0 menu:border-b">
                <button
                  type="button"
                  aria-label={`Ver foto ${i + 1} de ${fotos.length}`}
                  aria-current={i === actual}
                  onClick={() => setElegida(i)}
                  className="relative block aspect-[9/11] w-full cursor-pointer bg-[#f3f3f3] transition-opacity duration-150 hover:opacity-80 focus-visible:-outline-offset-2"
                >
                  <Image src={foto.miniatura} alt="" fill unoptimized sizes="88px" className="object-cover" />
                  {i === actual && <span aria-hidden="true" className="absolute inset-0 border-[3px] border-acento" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
