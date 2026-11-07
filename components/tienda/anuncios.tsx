"use client";

import { useEffect, useState } from "react";
import type { DatosSeccion } from "@/lib/contenido";
import { EnlaceContenido } from "./enlace-contenido";

const control =
  "flex size-[26px] cursor-pointer items-center justify-center text-white transition-colors hover:bg-white/16 focus-visible:outline-white focus-visible:-outline-offset-2";

// Barra de anuncios de todas las páginas. Sus textos y la velocidad se editan en /admin/contenido;
// con un solo anuncio no hay flechas.
export function Anuncios({ mensajes, segundos }: DatosSeccion["anuncios"]) {
  const [actual, setActual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const total = mensajes.length;
  const varios = total > 1;
  const pasar = (paso: -1 | 1) => setActual((i) => (i + paso + total) % total);

  // Se reinicia en cada cambio, también al usar las flechas
  useEffect(() => {
    if (!varios || pausado) return;
    const temporizador = setTimeout(() => setActual((i) => (i + 1) % total), segundos * 1000);
    return () => clearTimeout(temporizador);
  }, [actual, varios, pausado, total, segundos]);

  return (
    <div
      id="anuncios"
      role="region"
      aria-label="Anuncios"
      aria-roledescription={varios ? "carrusel" : undefined}
      className="flex min-h-[30px] flex-none items-center gap-2 bg-acento px-2 text-[12.5px] leading-[1.3] tracking-[0.01em] text-white"
    >
      {/* Mismo ancho que los controles, para que el anuncio quede centrado */}
      {varios && <div aria-hidden="true" className="hidden w-[84px] flex-none min-[701px]:block" />}
      {/* Mientras rota no se anuncia cada cambio al lector de pantalla. Los anuncios comparten una
          celda: si no entran en una línea, la barra mide lo que el más largo y no salta al rotar. */}
      <div aria-live={varios && !pausado ? "off" : "polite"} className="grid min-w-0 flex-auto overflow-hidden py-1">
        {mensajes.map((mensaje, i) => {
          const activo = i === actual;
          const saliendo = i === (actual - 1 + total) % total;
          return (
            <p
              key={i}
              aria-hidden={!activo}
              className={`[grid-area:1/1] self-center text-center text-balance motion-reduce:transition-none ${
                activo
                  ? "visible translate-x-0 opacity-100 [transition:transform_.55s_cubic-bezier(.2,.7,.2,1),opacity_.45s_ease]"
                  : `invisible opacity-0 [transition:transform_.55s_cubic-bezier(.2,.7,.2,1),opacity_.45s_ease,visibility_0s_linear_.55s] ${saliendo ? "translate-x-[45%]" : "-translate-x-[45%]"}`
              }`}
            >
              {mensaje.texto}{" "}
              {mensaje.boton.texto && (
                <EnlaceContenido boton={mensaje.boton} className="whitespace-nowrap text-white underline underline-offset-3 focus-visible:outline-white focus-visible:-outline-offset-2" />
              )}
            </p>
          );
        })}
      </div>
      {varios && (
        <div className="flex flex-none items-center gap-0.5">
          <button type="button" aria-label="Anuncio anterior" onClick={() => pasar(-1)} className={control}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button type="button" aria-label="Anuncio siguiente" onClick={() => pasar(1)} className={control}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <button type="button" aria-label={pausado ? "Reanudar anuncios" : "Pausar anuncios"} onClick={() => setPausado((p) => !p)} className={control}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              {pausado ? (
                <path d="M7 4l13 8-13 8z" />
              ) : (
                <>
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </>
              )}
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
