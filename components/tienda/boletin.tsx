"use client";

import { enlaceWhatsApp } from "./datos";

// Todavía no hay una lista de correos: la suscripción se pide por WhatsApp, como las reservas
export function Boletin({ titulo, nota }: { titulo: string; nota: string }) {
  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const correo = new FormData(e.currentTarget).get("correo");
    window.open(enlaceWhatsApp(`Hola, quiero recibir las novedades de Fara Collection. Mi correo es ${correo}.`), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={enviar} className="flex max-w-[600px] min-w-0 flex-[1_1_420px] flex-col gap-2.5">
      <label htmlFor="boletin-correo" className="text-[12px] font-semibold tracking-[0.12em] text-tinta uppercase">
        {titulo}
      </label>
      <div className="flex items-stretch gap-1.5 border-2 border-acento bg-[#f7f8fc] p-[5px] focus-within:shadow-[0_0_0_3px_rgba(1,0,129,.22)]">
        <input
          id="boletin-correo"
          name="correo"
          type="email"
          required
          autoComplete="email"
          placeholder="Tu correo electrónico"
          className="min-h-[46px] min-w-0 flex-auto bg-transparent px-3.5 text-[16px] text-tinta outline-none"
        />
        <button type="submit" className="flex-none cursor-pointer bg-acento px-[22px] text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-acento2">
          Suscribirme
        </button>
      </div>
      {nota && <p className="text-[13px] leading-normal text-[#444444]">{nota}</p>}
    </form>
  );
}
