"use client";

import { useEffect, useRef } from "react";

// Corre en silencio y en bucle solo mientras se ve: la sección está al final de la página y así
// no se descarga antes de tiempo. Con "reducir movimiento" no arranca solo. Los controles del
// navegador permiten pausarlo y activar el sonido.
export function VideoInspiracion({ url }: { url: string }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const elemento = video.current;
    if (!elemento || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observador = new IntersectionObserver(
      ([{ isIntersecting }]) => {
        // El navegador puede impedirlo (modo de ahorro de batería): quedan los controles
        if (isIntersecting) elemento.play().catch(() => {});
        else elemento.pause();
      },
      { threshold: 0.25 },
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return <video ref={video} src={url} muted loop playsInline preload="metadata" controls className="absolute inset-0 size-full object-cover" />;
}
