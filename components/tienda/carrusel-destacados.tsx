"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { useArrastre } from "./use-arrastre";

// Fila de productos que se desliza de lado: cuatro a la vista en computadora; en el celular, una
// y parte de la siguiente. En el celular y con el trackpad se desliza sola; con el mouse se
// arrastra y, al soltar, encaja en la tarjeta más cercana. Si no entran todas, la flecha de la
// derecha avanza y, al final, vuelve al comienzo.
//
// La cuadrícula tiene dos filas: las fotos y los textos (cada tarjeta ocupa las dos con subgrid,
// así todas las fotos miden lo mismo aunque un nombre ocupe dos líneas). Desde 1000 px las fotos
// se llevan el alto que sobra en la pantalla; más abajo tienen su propia proporción.
export function CarruselDestacados({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  const lista = useRef<HTMLUListElement>(null);
  const [desborda, setDesborda] = useState(false);
  const [altoFotos, setAltoFotos] = useState(0);
  useArrastre(lista, "li");

  useEffect(() => {
    const c = lista.current;
    if (!c) return;
    let activo = true;
    const medir = () => {
      if (!activo) return;
      setDesborda(c.scrollWidth - c.clientWidth > 1);
      // La primera fila de la cuadrícula, en px: la flecha va a media altura de las fotos
      setAltoFotos(parseFloat(getComputedStyle(c).gridTemplateRows) || 0);
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(c);
    // Las letras cambian el alto de los textos (y con él, el de las fotos) cuando terminan de cargar
    document.fonts?.ready.then(medir);
    return () => {
      activo = false;
      observador.disconnect();
    };
  }, []);

  const avanzar = () => {
    const c = lista.current;
    if (!c) return;
    const comportamiento: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    if (c.scrollLeft >= c.scrollWidth - c.clientWidth - 2) c.scrollTo({ left: 0, behavior: comportamiento });
    else c.scrollBy({ left: c.clientWidth * 0.8, behavior: comportamiento });
  };

  return (
    <div role="region" aria-roledescription="carrusel" aria-label={etiqueta} className="relative flex min-h-0 flex-auto flex-col">
      <ul
        ref={lista}
        className="grid flex-auto cursor-grab auto-cols-[72%] grid-flow-col grid-rows-[auto_auto] gap-x-5 snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth select-none [scrollbar-width:none] motion-reduce:scroll-auto data-arrastrando:cursor-grabbing min-[901px]:auto-cols-[calc((100%-60px)/4)] min-[1000px]:min-h-[360px] min-[1000px]:grid-rows-[minmax(240px,1fr)_auto] [&_a]:cursor-grab [&_h3]:cursor-pointer [&[data-arrastrando]_*]:cursor-grabbing [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      {desborda && altoFotos > 0 && (
        <div
          style={{ height: altoFotos }}
          className="pointer-events-none absolute top-0 right-0 flex w-[72%] items-center justify-end min-[901px]:w-[calc((100%-60px)/4)]"
        >
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
