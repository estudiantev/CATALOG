"use client";

import { useEffect, useRef, useState } from "react";

const control = "flex size-11 cursor-pointer items-center justify-center bg-black/45 text-white transition-colors hover:bg-black/65";

// Corre en silencio y en bucle solo mientras se ve: la sección está al final de la página y así
// no se descarga antes de tiempo. Con "reducir movimiento" no arranca solo. Abajo a la derecha,
// los botones para activar el sonido y para pausarlo (como el mockup).
export function VideoInspiracion({ url }: { url: string }) {
  const video = useRef<HTMLVideoElement>(null);
  // Si la clienta lo pausó, no vuelve a arrancar solo al verse de nuevo
  const pausadoAMano = useRef(false);
  const [silenciado, setSilenciado] = useState(true);
  const [enPausa, setEnPausa] = useState(true);

  useEffect(() => {
    const elemento = video.current;
    if (!elemento) return;
    // Los botones siguen al video: el navegador también puede pausarlo (ahorro de batería)
    const sincronizar = () => {
      setEnPausa(elemento.paused);
      setSilenciado(elemento.muted);
    };
    elemento.addEventListener("play", sincronizar);
    elemento.addEventListener("pause", sincronizar);
    elemento.addEventListener("volumechange", sincronizar);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) pausadoAMano.current = true;
    const observador = new IntersectionObserver(
      ([{ isIntersecting }]) => {
        if (!isIntersecting) elemento.pause();
        else if (!pausadoAMano.current) elemento.play().catch(() => {});
      },
      { threshold: 0.25 },
    );
    observador.observe(elemento);
    return () => {
      observador.disconnect();
      elemento.removeEventListener("play", sincronizar);
      elemento.removeEventListener("pause", sincronizar);
      elemento.removeEventListener("volumechange", sincronizar);
    };
  }, []);

  const cambiarSonido = () => {
    const elemento = video.current;
    if (elemento) elemento.muted = !elemento.muted;
  };

  const cambiarPausa = () => {
    const elemento = video.current;
    if (!elemento) return;
    if (elemento.paused) {
      pausadoAMano.current = false;
      elemento.play().catch(() => {});
    } else {
      pausadoAMano.current = true;
      elemento.pause();
    }
  };

  return (
    <>
      <video ref={video} src={url} muted loop playsInline preload="metadata" className="absolute inset-0 size-full object-cover" />
      <div className="absolute right-5 bottom-5 flex gap-2">
        <button type="button" aria-label={silenciado ? "Activar sonido" : "Silenciar"} onClick={cambiarSonido} className={control}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" />
            <path d={silenciado ? "m16 9.5 5 5M21 9.5l-5 5" : "M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10"} />
          </svg>
        </button>
        <button type="button" aria-label={enPausa ? "Reproducir video" : "Pausar video"} onClick={cambiarPausa} className={control}>
          {enPausa ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 5v14l12-7z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 5v14M16 5v14" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
