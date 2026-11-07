"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

// Fila de productos que se desliza de lado. En el celular y con el trackpad se desliza sola; con
// el mouse se arrastra y, al soltar, encaja en la tarjeta más cercana. La barra de abajo muestra
// qué parte de la fila se está viendo.
export function CarruselDestacados({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  const lista = useRef<HTMLUListElement>(null);
  const [barra, setBarra] = useState({ izquierda: 0, ancho: 100 }); // en %

  useEffect(() => {
    const c = lista.current;
    if (!c) return;

    let cuadro = 0;
    const medir = () => {
      cuadro = 0;
      const maximo = c.scrollWidth - c.clientWidth;
      const visible = c.scrollWidth > 0 ? Math.min(1, c.clientWidth / c.scrollWidth) : 1;
      const avance = maximo > 0 ? Math.min(1, Math.max(0, c.scrollLeft / maximo)) : 0;
      setBarra({ izquierda: avance * (1 - visible) * 100, ancho: visible * 100 });
    };
    const alCambiar = () => {
      if (!cuadro) cuadro = requestAnimationFrame(medir);
    };
    medir();
    c.addEventListener("scroll", alCambiar, { passive: true });
    const observador = new ResizeObserver(alCambiar);
    observador.observe(c);

    // Arrastrar con el mouse
    let arrastre: { x: number; izquierda: number; movido: boolean } | null = null;
    let recienArrastrado = false;
    let espera = 0;
    const alBajar = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      arrastre = { x: e.clientX, izquierda: c.scrollLeft, movido: false };
    };
    const alMover = (e: PointerEvent) => {
      if (!arrastre) return;
      const dx = e.clientX - arrastre.x;
      if (!arrastre.movido && Math.abs(dx) > 5) {
        arrastre.movido = true;
        c.style.scrollSnapType = "none";
        c.style.scrollBehavior = "auto";
        c.dataset.arrastrando = "";
      }
      if (arrastre.movido) {
        c.scrollLeft = arrastre.izquierda - dx;
        e.preventDefault();
      }
    };
    const alSoltar = () => {
      const fin = arrastre;
      arrastre = null;
      if (!fin?.movido) return;
      delete c.dataset.arrastrando;
      const ancho = c.querySelector("li")?.getBoundingClientRect().width ?? 0;
      const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (ancho) c.scrollTo({ left: Math.round(c.scrollLeft / ancho) * ancho, behavior: suave ? "smooth" : "auto" });
      clearTimeout(espera);
      espera = window.setTimeout(() => {
        c.style.scrollSnapType = "";
        c.style.scrollBehavior = "";
      }, 450);
      // El clic que llega al soltar no abre el producto
      recienArrastrado = true;
      setTimeout(() => {
        recienArrastrado = false;
      }, 0);
    };
    const alHacerClic = (e: MouseEvent) => {
      if (recienArrastrado) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const sinArrastreNativo = (e: DragEvent) => e.preventDefault();

    c.addEventListener("pointerdown", alBajar);
    window.addEventListener("pointermove", alMover);
    window.addEventListener("pointerup", alSoltar);
    window.addEventListener("pointercancel", alSoltar);
    c.addEventListener("click", alHacerClic, true);
    c.addEventListener("dragstart", sinArrastreNativo);
    return () => {
      if (cuadro) cancelAnimationFrame(cuadro);
      clearTimeout(espera);
      observador.disconnect();
      c.removeEventListener("scroll", alCambiar);
      c.removeEventListener("pointerdown", alBajar);
      window.removeEventListener("pointermove", alMover);
      window.removeEventListener("pointerup", alSoltar);
      window.removeEventListener("pointercancel", alSoltar);
      c.removeEventListener("click", alHacerClic, true);
      c.removeEventListener("dragstart", sinArrastreNativo);
    };
  }, []);

  return (
    <>
      <div role="region" aria-roledescription="carrusel" aria-label={etiqueta} className="flex min-h-0 flex-auto border-y border-tinta">
        <ul
          ref={lista}
          className="flex min-w-0 flex-auto cursor-grab snap-x snap-mandatory overflow-x-auto overscroll-x-contain select-none [scrollbar-width:none] data-arrastrando:cursor-grabbing [&_a]:cursor-grab [&_h3]:cursor-pointer [&[data-arrastrando]_*]:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </ul>
      </div>
      <div aria-hidden="true" className="flex h-[72px] flex-none items-center px-[clamp(16px,3vw,32px)]">
        <div className="relative h-0.5 w-[min(220px,40%)] bg-[#e0e0e0]">
          <span className="absolute inset-y-0 bg-acento2 transition-[left] duration-150 ease-linear" style={{ left: `${barra.izquierda}%`, width: `${barra.ancho}%` }} />
        </div>
      </div>
    </>
  );
}
