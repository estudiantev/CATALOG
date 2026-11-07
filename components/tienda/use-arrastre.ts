"use client";

import { type RefObject, useEffect } from "react";

// Una fila con scroll de lado que también se arrastra con el mouse (en el celular y con el
// trackpad ya se desliza sola). Al soltar encaja en el elemento más cercano y el clic de soltar
// no abre nada. Mientras se arrastra, la fila lleva data-arrastrando.
export function useArrastre(ref: RefObject<HTMLElement | null>, selectorElemento: string) {
  useEffect(() => {
    const c = ref.current;
    if (!c) return;

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
      const ancho = c.querySelector(selectorElemento)?.getBoundingClientRect().width ?? 0;
      const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (ancho) c.scrollTo({ left: Math.round(c.scrollLeft / ancho) * ancho, behavior: suave ? "smooth" : "auto" });
      clearTimeout(espera);
      espera = window.setTimeout(() => {
        c.style.scrollSnapType = "";
        c.style.scrollBehavior = "";
      }, 450);
      // El clic que llega al soltar no abre nada
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
      clearTimeout(espera);
      c.removeEventListener("pointerdown", alBajar);
      window.removeEventListener("pointermove", alMover);
      window.removeEventListener("pointerup", alSoltar);
      window.removeEventListener("pointercancel", alSoltar);
      c.removeEventListener("click", alHacerClic, true);
      c.removeEventListener("dragstart", sinArrastreNativo);
    };
  }, [ref, selectorElemento]);
}
