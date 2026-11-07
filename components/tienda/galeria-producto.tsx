"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { hoverBlanca } from "./estilos-inicio";
import { useArrastre } from "./use-arrastre";

export type FotoGaleria = { url: string; miniatura: string };

const flecha = `flex size-11 cursor-pointer items-center justify-center border border-tinta bg-white text-tinta ${hoverBlanca}`;

function Chevron({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

// Foto grande con el número de foto y flechas y, debajo, las miniaturas (versión liviana) en una
// tira que se desliza de lado. La foto grande no se recorta, para que siempre se vea el vestido
// completo.
export function GaleriaProducto({ nombre, fotos }: { nombre: string; fotos: FotoGaleria[] }) {
  const [elegida, setElegida] = useState(0);
  const tira = useRef<HTMLDivElement>(null);
  useArrastre(tira, "button");
  // Al cambiar de variante puede haber menos fotos que antes
  const actual = Math.min(elegida, Math.max(0, fotos.length - 1));
  const varias = fotos.length > 1;
  const pasar = (paso: -1 | 1) => setElegida((actual + paso + fotos.length) % fotos.length);

  return (
    <section aria-label="Galería de fotos" className="min-w-0 flex-[999_1_600px] border-r border-tinta">
      <div className="relative flex aspect-[4/5] items-center justify-center bg-[#f3f3f3]">
        {fotos.length ? (
          <Image src={fotos[actual].url} alt={nombre} fill unoptimized priority sizes="(min-width: 1081px) 67vw, 100vw" className="object-contain" />
        ) : (
          <span className="text-[12px] font-semibold tracking-[0.14em] text-[#555555] uppercase">Sin foto</span>
        )}
        {varias && (
          <>
            <span aria-live="polite" className="absolute bottom-4 left-4 inline-flex min-h-9 items-center border border-tinta bg-white px-3 text-[12px] font-semibold tracking-[0.08em] text-tinta">
              <span className="sr-only">Foto </span>
              {actual + 1} / {fotos.length}
            </span>
            <div className="absolute right-4 bottom-4 flex">
              <button type="button" aria-label="Foto anterior" onClick={() => pasar(-1)} className={flecha}>
                <Chevron d="M15 18l-6-6 6-6" />
              </button>
              <button type="button" aria-label="Foto siguiente" onClick={() => pasar(1)} className={`${flecha} border-l-0`}>
                <Chevron d="M9 18l6-6-6-6" />
              </button>
            </div>
          </>
        )}
      </div>
      {varias && (
        <div
          ref={tira}
          role="group"
          aria-label="Miniaturas (desliza para ver más)"
          className="flex cursor-grab snap-x snap-mandatory overflow-x-auto overscroll-x-contain border-t border-tinta select-none [scrollbar-width:none] data-arrastrando:cursor-grabbing [&_button]:cursor-grab [&[data-arrastrando]_*]:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        >
          {fotos.map((foto, i) => (
            <button
              key={foto.url}
              type="button"
              aria-label={`Ver foto ${i + 1} de ${fotos.length}`}
              aria-current={i === actual}
              onClick={() => setElegida(i)}
              className="relative aspect-[4/5] flex-none basis-[40%] snap-start border-l border-tinta bg-[#f3f3f3] transition-opacity duration-150 first:border-l-0 hover:opacity-85 focus-visible:-outline-offset-4 aria-[current=true]:hover:opacity-100 min-[701px]:basis-[max(180px,22%)]"
            >
              <Image src={foto.miniatura} alt="" fill unoptimized sizes="220px" draggable={false} className="object-cover" />
              {i === actual && <span aria-hidden="true" className="absolute inset-0.5 border-2 border-acento" />}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
