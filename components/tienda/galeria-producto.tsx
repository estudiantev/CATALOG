"use client";

import Image from "next/image";
import { useState } from "react";

const marco = "relative aspect-[9/11] overflow-hidden border border-arena bg-lino";

export type FotoGaleria = { url: string; miniatura: string; alt: string };

// Foto grande y, si hay varias, miniaturas (versión liviana) para cambiarla
export function GaleriaProducto({ fotos }: { fotos: FotoGaleria[] }) {
  const [elegida, setElegida] = useState(0);
  // Al cambiar de variante puede haber menos fotos que antes
  const actual = Math.min(elegida, fotos.length - 1);

  if (fotos.length === 0) {
    return (
      <div className={`${marco} flex items-center justify-center`}>
        <span className="text-[13px] tracking-[0.1em] text-topo uppercase">Sin foto</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className={marco}>
        <Image
          src={fotos[actual].url}
          alt={fotos[actual].alt}
          fill
          unoptimized
          priority
          sizes="(min-width: 768px) 450px, 100vw"
          className="object-cover"
        />
      </div>
      {fotos.length > 1 && (
        <ul className="grid grid-cols-6 gap-2">
          {fotos.map((foto, i) => (
            <li key={foto.url}>
              <button
                type="button"
                aria-label={`Ver foto ${i + 1} de ${fotos.length}`}
                aria-current={i === actual}
                onClick={() => setElegida(i)}
                className={`relative block aspect-[9/11] w-full cursor-pointer overflow-hidden border-2 bg-lino ${i === actual ? "border-tinta" : "border-transparent hover:border-arena"}`}
              >
                <Image src={foto.miniatura} alt="" fill unoptimized sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
