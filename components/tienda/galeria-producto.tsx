"use client";

import Image from "next/image";
import { useState } from "react";

const marco = "relative aspect-[9/11] overflow-hidden border border-arena bg-lino";

// Foto grande y, si hay varias, miniaturas para cambiarla
export function GaleriaProducto({ imagenes }: { imagenes: { url: string; alt: string }[] }) {
  const [actual, setActual] = useState(0);

  if (imagenes.length === 0) {
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
          src={imagenes[actual].url}
          alt={imagenes[actual].alt}
          fill
          unoptimized
          priority
          sizes="(min-width: 768px) 450px, 100vw"
          className="object-cover"
        />
      </div>
      {imagenes.length > 1 && (
        <ul className="grid grid-cols-5 gap-2">
          {imagenes.map((imagen, i) => (
            <li key={imagen.url}>
              <button
                type="button"
                aria-label={`Ver foto ${i + 1} de ${imagenes.length}`}
                aria-current={i === actual}
                onClick={() => setActual(i)}
                className={`relative block aspect-[9/11] w-full cursor-pointer overflow-hidden border-2 bg-lino ${i === actual ? "border-tinta" : "border-transparent hover:border-arena"}`}
              >
                <Image src={imagen.url} alt="" fill unoptimized sizes="90px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
