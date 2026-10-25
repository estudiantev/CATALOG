import Link from "next/link";
import { ALQUILER, COLECCIONES } from "./datos";

const titulo = "mb-1.5 text-[13px] leading-[18px] font-semibold tracking-[0.12em] text-dorado uppercase";
const enlace = "text-[15px] leading-[22px]";

const SECCIONES = [
  {
    nombre: "Acerca de",
    ancho: "flex-[1_1_150px]",
    enlaces: [
      { nombre: "Quiénes somos", href: "#" },
      { nombre: "Preguntas frecuentes", href: "#" },
    ],
  },
  {
    nombre: "Contactos",
    ancho: "flex-[1_1_120px]",
    enlaces: [
      { nombre: "WhatsApp", href: "#" },
      { nombre: "Instagram", href: "https://www.instagram.com/fara_collection_tacna" },
      { nombre: "TikTok", href: "https://www.tiktok.com/@faracollections.tacna" },
    ],
  },
  { nombre: "Catálogo", ancho: "flex-[1_1_120px]", enlaces: COLECCIONES },
  { nombre: "Alquiler", ancho: "flex-[1_1_120px]", enlaces: ALQUILER },
  {
    nombre: "Legal",
    ancho: "flex-[1_1_170px]",
    enlaces: [
      { nombre: "Términos y condiciones", href: "#" },
      { nombre: "Aviso de privacidad", href: "#" },
    ],
  },
];

export function Pie() {
  return (
    <footer id="contacto" className="bg-tinta text-white [&_a]:text-white [&_a:active]:text-lino [&_a:focus-visible]:outline-dorado [&_a:hover]:text-dorado">
      <div className="flex flex-col gap-12 px-[clamp(16px,3.6vw,54px)] pt-16 pb-7">
        <div className="flex flex-wrap gap-9">
          <div className="flex min-w-0 flex-[1.4_1_240px] flex-col items-start gap-3.5">
            <Link href="/" aria-label="Fara Collection, inicio" className="text-[28px] leading-none font-normal tracking-[-0.015em]">
              Fara Collection
            </Link>
            <p className="max-w-70 text-[15px] leading-[22px] text-piedra">
              Vestidos de alta costura en venta y alquiler, confeccionados en Tacna.
            </p>
          </div>
          {SECCIONES.map((seccion) => (
            <nav key={seccion.nombre} aria-label={seccion.nombre} className={`${seccion.ancho} flex flex-col gap-2`}>
              <span className={titulo}>{seccion.nombre}</span>
              {seccion.enlaces.map((e) => (
                <Link key={e.nombre} href={e.href} className={enlace}>
                  {e.nombre}
                </Link>
              ))}
            </nav>
          ))}
        </div>
        <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-[#3a3a3a] pt-5.5 text-[13px] leading-[20px] text-piedra">
          <span>© 2026 Fara Collection</span>
          <span>Tacna, Perú</span>
        </div>
      </div>
    </footer>
  );
}
