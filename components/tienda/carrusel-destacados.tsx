"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { useArrastre } from "./use-arrastre";

// Fila de productos que se desliza de lado: cuatro a la vista en computadora; en el celular, una
// y parte de la siguiente. En el celular y con el trackpad se desliza sola; con el mouse se
// arrastra y, al soltar, encaja en la tarjeta más cercana. Si no entran todas, la flecha de la
// derecha avanza y, al final, vuelve al comienzo.
export function CarruselDestacados({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  const lista = useRef<HTMLUListElement>(null);
  const [desborda, setDesborda] = useState(false);
  useArrastre(lista, "li");

  useEffect(() => {
    const c = lista.current;
    if (!c) return;
    const medir = () => setDesborda(c.scrollWidth - c.clientWidth > 1);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(c);
    return () => observador.disconnect();
  }, []);

  const avanzar = () => {
    const c = lista.current;
    if (!c) return;
    const comportamiento: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    if (c.scrollLeft >= c.scrollWidth - c.clientWidth - 2) c.scrollTo({ left: 0, behavior: comportamiento });
    else c.scrollBy({ left: c.clientWidth * 0.8, behavior: comportamiento });
  };

  return (
    <div role="region" aria-roledescription="carrusel" aria-label={etiqueta} className="relative">
      <ul
        ref={lista}
        className="grid cursor-grab auto-cols-[72%] grid-flow-col gap-5 snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth select-none [scrollbar-width:none] motion-reduce:scroll-auto data-arrastrando:cursor-grabbing min-[901px]:auto-cols-[calc((100%-60px)/4)] [&_a]:cursor-grab [&_h3]:cursor-pointer [&[data-arrastrando]_*]:cursor-grabbing [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      {/* Mide lo que la foto de una tarjeta: la flecha queda a la derecha, a media altura de la foto */}
      {desborda && (
        <div className="pointer-events-none absolute top-0 right-0 flex aspect-[447/541] w-[72%] items-center justify-end min-[901px]:w-[calc((100%-60px)/4)]">
          <button
            type="button"
            aria-label="Ver más productos"
            onClick={avanzar}
            className="pointer-events-auto flex size-11 cursor-pointer items-center justify-center text-tinta"
          >
            <span className="flex size-[22px] items-center justify-center bg-white">
              <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1.5 1 6.5 6l-5 5" />
              </svg>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
