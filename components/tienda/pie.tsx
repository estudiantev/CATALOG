import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { type ClaveRed, type DatosSeccion, REDES } from "@/lib/contenido";
import { Boletin } from "./boletin";
import { ALQUILER, COLECCIONES, enlaceWhatsApp } from "./datos";

const titulo = "mb-1.5 text-[12px] font-semibold tracking-[0.08em] text-tinta uppercase";
const enlace = "text-[15px] text-[#222222] hover:underline hover:underline-offset-3";

const SECCIONES = [
  {
    nombre: "¿Cómo te ayudamos?",
    enlaces: [
      { nombre: "WhatsApp", href: enlaceWhatsApp("Hola, quisiera información sobre Fara Collection.") },
      { nombre: "Preguntas frecuentes", href: "#" },
      { nombre: "Términos y condiciones", href: "#" },
      { nombre: "Aviso de privacidad", href: "#" },
    ],
  },
  {
    nombre: "Sobre nosotros",
    enlaces: [
      { nombre: "Quiénes somos", href: "/#nosotros" },
      { nombre: "Colecciones", href: "/#colecciones" },
      { nombre: "Inspiración", href: "/#inspiracion" },
    ],
  },
  { nombre: "Catálogo", enlaces: COLECCIONES },
  { nombre: "Alquiler", enlaces: ALQUILER },
];

const ICONOS: Record<ClaveRed, ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </>
  ),
  tiktok: (
    <>
      <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 3c.6 2.6 2.4 4.4 5 4.6" />
    </>
  ),
  pinterest: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M10.6 20.5l1.6-7.5" />
      <path d="M9.6 14.2c-.7-2.9 1-5.7 3.4-5.7 2 0 3.2 1.4 3.2 3.2 0 2.3-1.3 4.2-3.2 4.2-1 0-1.6-.7-1.4-1.7" />
    </>
  ),
  facebook: <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15.5l.5-3.5h-3.5V7a1 1 0 0 1 1-1H15z" />,
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.5l4 2.5-4 2.5z" fill="currentColor" />
    </>
  ),
};

// La descripción, el boletín y las redes se editan en /admin/contenido
export function Pie({ contenido }: { contenido: DatosSeccion["pie"] }) {
  const redes = REDES.filter(({ clave }) => contenido.redes[clave]);

  return (
    <footer id="contacto" className="flex flex-col gap-14 overflow-hidden bg-[#d2d2d2] px-[clamp(20px,4vw,48px)] pt-12 pb-7 font-cuerpo text-tinta">
      <div className="flex flex-wrap items-start justify-between gap-x-12 gap-y-8">
        <div className="flex max-w-[600px] min-w-0 flex-[1_1_360px] flex-col items-start gap-5">
          <Link href="/" aria-label="Fara Collection, inicio" className="inline-flex min-h-11 items-center bg-[#f2f2f2] px-5 py-1.5">
            <Image src="/logo-fara.svg" alt="" width={722} height={341} className="h-8 w-auto" />
          </Link>
          <p className="text-[17px] leading-normal text-tinta">{contenido.descripcion}</p>
        </div>
        {contenido.boletinTitulo && <Boletin titulo={contenido.boletinTitulo} nota={contenido.boletinNota} />}
      </div>

      <div className="grid grid-cols-2 gap-8 min-[1001px]:grid-cols-6">
        {SECCIONES.map((seccion) => (
          <nav key={seccion.nombre} aria-label={seccion.nombre} className="flex flex-col gap-3.5">
            <h3 className={titulo}>{seccion.nombre}</h3>
            {seccion.enlaces.map((e) => (
              <Link key={e.nombre} href={e.href} className={enlace}>
                {e.nombre}
              </Link>
            ))}
          </nav>
        ))}
        {redes.length > 0 && (
          <nav aria-label="Redes sociales" className="flex flex-col gap-2.5 min-[1001px]:col-start-6">
            <h3 className={`${titulo} mb-2.5`}>Redes</h3>
            {redes.map(({ clave, nombre }) => (
              <a key={clave} href={contenido.redes[clave]} className="group inline-flex items-center gap-2.5 text-[15px] text-[#222222] hover:underline hover:underline-offset-3">
                <span className="flex size-[30px] flex-none items-center justify-center bg-acento text-white transition-colors duration-150 group-hover:bg-white group-hover:text-acento">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {ICONOS[clave]}
                  </svg>
                </span>
                {nombre}
              </a>
            ))}
          </nav>
        )}
      </div>

      <div className="mt-auto flex flex-wrap justify-between gap-x-6 gap-y-2 pt-[18px] text-[13px] text-[#444444]">
        <span>© 2026 Fara Collection. Todos los derechos reservados.</span>
        <span>Tacna, Perú</span>
      </div>
    </footer>
  );
}
