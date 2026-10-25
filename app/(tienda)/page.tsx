import Link from "next/link";
import type { ComponentProps } from "react";
import { COLECCIONES, COLORES } from "@/components/tienda/datos";
import { Vestido } from "@/components/tienda/vestido";

type Ilustracion = ComponentProps<typeof Vestido>;

const OCASIONES: {
  coleccion: (typeof COLECCIONES)[number];
  numero: string;
  modalidad: string;
  descripcion: string;
  vestido: Ilustracion;
}[] = [
  {
    coleccion: COLECCIONES[0],
    numero: "01",
    modalidad: "Venta y alquiler",
    descripcion: "Para matrimonios, graduaciones y noches de gala.",
    vestido: { forma: "sirena", color: "#1d1a1b", className: "h-[94%] w-auto" },
  },
  {
    coleccion: COLECCIONES[1],
    numero: "02",
    modalidad: "Venta y alquiler",
    descripcion: "Para tu fiesta de quince años.",
    vestido: { forma: "xv", color: "#e6b4b2", className: "mb-[2%] h-[90%] w-auto" },
  },
  {
    coleccion: COLECCIONES[2],
    numero: "03",
    modalidad: "Venta",
    descripcion: "Para cócteles, cumpleaños y celebraciones.",
    vestido: { forma: "corto", color: "#a3243b", className: "h-[96%] w-auto" },
  },
  {
    coleccion: COLECCIONES[3],
    numero: "04",
    modalidad: "Venta",
    descripcion: "Estampados en flor para eventos de día.",
    vestido: { forma: "floreado", color: "#bcd3e6", className: "h-[96%] w-auto" },
  },
];

// Vestidos de muestra del diseño; se reemplazarán por productos reales del catálogo
const DESTACADOS: { nombre: string; modalidad: string; vestido: Ilustracion }[] = [
  { nombre: "Vestido sirena negro", modalidad: "Venta y alquiler", vestido: { forma: "sirena", color: "#1d1a1b", brillo: 0.16, pliegues: false, className: "h-[90%] w-auto" } },
  { nombre: "Vestido de XV rosa", modalidad: "Venta y alquiler", vestido: { forma: "xv", color: "#e6b4b2", className: "mb-[2%] h-[86%] w-auto" } },
  { nombre: "Vestido corto rojo", modalidad: "Venta", vestido: { forma: "corto", color: "#a3243b", className: "h-[92%] w-auto" } },
  { nombre: "Vestido floreado celeste", modalidad: "Venta", vestido: { forma: "floreado", color: "#bcd3e6", className: "h-[92%] w-auto" } },
  { nombre: "Vestido sirena vino", modalidad: "Venta y alquiler", vestido: { forma: "sirena", color: "#6b1c2e", className: "h-[90%] w-auto" } },
  { nombre: "Vestido de XV lila", modalidad: "Venta y alquiler", vestido: { forma: "xv", color: "#c3b1d9", className: "mb-[2%] h-[86%] w-auto" } },
  { nombre: "Vestido corto azul", modalidad: "Venta", vestido: { forma: "corto", color: "#2b4c9b", className: "h-[92%] w-auto" } },
  { nombre: "Vestido sirena champán", modalidad: "Venta y alquiler", vestido: { forma: "sirena", color: "#d6bf94", tirantes: "#cdb48a", brillo: 0.45, pliegues: "#6b5530", className: "h-[90%] w-auto" } },
];

const PASOS = [
  { numero: "01", titulo: "Elige tu vestido", texto: "Explora los modelos de gala y de XV disponibles." },
  { numero: "02", titulo: "Reserva la fecha", texto: "Separa tu vestido para el día de tu evento." },
  { numero: "03", titulo: "Lúcelo y devuélvelo", texto: "Disfruta tu noche y devuelve el vestido después." },
];

const tarjeta = "group flex h-full flex-col bg-white text-tinta transition-colors hover:bg-arena active:bg-dorado";
const nombreTarjeta = "group-hover:underline group-hover:underline-offset-4";
const marcoIlustracion = "overflow-hidden [&_svg]:transition-transform [&_svg]:duration-[600ms] group-hover:[&_svg]:scale-[1.04]";
const etiqueta = "text-[12px] leading-[18px] font-semibold tracking-[0.1em] text-topo uppercase";
const tituloSeccion = "text-[clamp(24px,2vw,30px)] leading-[1.2] font-medium tracking-[0.08em] uppercase";
const botonOscuro = "inline-flex min-h-13 items-center justify-center border-2 border-tinta bg-tinta font-semibold tracking-[0.06em] text-white uppercase transition-colors hover:bg-dorado hover:text-tinta active:bg-white active:text-tinta";

export default function InicioPage() {
  return (
    <>
      <section aria-label="Portada" className="relative flex flex-wrap items-end overflow-hidden border-b-2 border-tinta bg-[#e8cdc3]">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[11%] bg-[#d9b4a8]" />
        <div aria-hidden="true" className="absolute top-[9%] right-[6%] h-[64%] w-[clamp(120px,15vw,230px)] rounded-t-full border-10 border-b-0 border-[#f6eae6] bg-[#f1e0da]" />
        <div className="relative flex min-w-0 flex-[1_1_380px] flex-col gap-4.5 self-center px-[clamp(20px,3.6vw,54px)] py-[clamp(44px,5vw,80px)]">
          <span className="text-[13px] leading-[18px] font-semibold tracking-[0.16em] uppercase">
            Vestidos de gala y de XV
          </span>
          <h1 className="text-[clamp(50px,5.8vw,92px)] leading-[0.98] font-light tracking-[-0.02em]">
            Tu vestido, tu noche
          </h1>
          <p className="max-w-100 text-[18px] leading-[28px] text-grafito">
            Compra o alquila vestidos de gala, de XV, cortos y floreados.
          </p>
          <div className="flex flex-wrap gap-3 pt-1.5">
            <Link href="/catalogo" className={`${botonOscuro} min-w-37.5 px-7 text-[15px] leading-[20px]`}>
              Comprar
            </Link>
            <a href="#pasos" className="inline-flex min-h-13 min-w-37.5 items-center justify-center border-2 border-tinta bg-white px-7 text-[15px] leading-[20px] font-semibold tracking-[0.06em] uppercase transition-colors hover:bg-arena active:bg-dorado">
              Alquilar
            </a>
          </div>
          <div className="mt-[clamp(8px,3vw,40px)] flex items-center">
            {[1, 2, 3].map((n) => (
              <button key={n} type="button" aria-label={`Ver portada ${n}`} aria-current={n === 1 ? "true" : undefined} className="flex size-11 cursor-pointer items-center justify-center">
                <span className={`block h-[3px] w-7.5 ${n === 1 ? "bg-tinta" : "bg-[#8c8176]"}`} />
              </button>
            ))}
          </div>
        </div>
        <div className="relative flex h-[clamp(420px,48vw,700px)] min-w-0 flex-[1.35_1_500px] items-end justify-center">
          <Vestido forma="xv" color="#c3b1d9" etiqueta="Vestido de XV lila" className="-mr-[11%] h-[66%] w-auto" />
          <Vestido forma="sirena" color="#1f4d3d" etiqueta="Vestido de gala esmeralda corte sirena" className="relative z-2 h-[94%] w-auto" />
          <Vestido forma="sirena" color="#6b1c2e" etiqueta="Vestido de gala vino corte sirena" className="-ml-[13%] h-[78%] w-auto" />
        </div>
      </section>

      <section id="colores" aria-labelledby="titulo-colores" className="bg-crema pt-[clamp(36px,4vw,56px)]">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 px-[clamp(16px,3.6vw,54px)] pb-6 h-[45px]">
          <h2 id="titulo-colores" className="text-[28px] leading-[1.2] font-normal tracking-[0.08em] uppercase">
            Compra por color
          </h2>
        </div>
        <ul aria-label="Colores" className="flex flex-wrap border-t-2 border-tinta lg:h-[177px]">
          {COLORES.map((color) => (
            <li key={color.nombre} className="min-w-0 flex-[1_1_clamp(110px,10vw,160px)] border-r-2 border-b-2 border-tinta">
              <Link href={color.href} className={tarjeta}>
                <span aria-hidden="true" className="block aspect-[4/3]" style={{ background: color.hex }} />
                <span className={`${nombreTarjeta} block border-t-2 border-tinta px-3.5 py-3 text-[16px] leading-[22px]`}>
                  {color.nombre}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="colecciones" aria-label="Ocasiones" className="bg-crema pt-[clamp(36px,4vw,56px)]">
        <ul className="border-t-2 border-tinta">
          {OCASIONES.map((ocasion) => (
            <li key={ocasion.numero} className="border-b-2 border-tinta">
              <Link href={ocasion.coleccion.href} className="group flex items-center gap-[clamp(12px,2.4vw,36px)] px-[clamp(16px,3.6vw,54px)] py-[clamp(14px,1.6vw,22px)] transition-colors hover:bg-arena active:bg-dorado">
                <span className="w-[clamp(28px,4.4vw,72px)] flex-none text-[15px] leading-[20px] font-medium tracking-[0.08em]">
                  {ocasion.numero}
                </span>
                <span className="flex min-w-0 flex-auto flex-wrap items-center gap-x-10 gap-y-1.5">
                  <span className={`${nombreTarjeta} min-w-0 flex-[1_1_300px] text-[clamp(36px,4.6vw,72px)] leading-[1.05] font-light tracking-[-0.02em]`}>
                    {ocasion.coleccion.nombre}
                  </span>
                  <span className="flex min-w-0 flex-[1_1_280px] flex-col gap-0.5">
                    <span className={etiqueta}>{ocasion.modalidad}</span>
                    <span className="text-[16px] leading-[24px] text-grafito">{ocasion.descripcion}</span>
                  </span>
                </span>
                <span className={`${marcoIlustracion} flex aspect-square w-[clamp(64px,7.4vw,112px)] flex-none items-end justify-center border-2 border-tinta bg-lino`}>
                  <Vestido {...ocasion.vestido} />
                </span>
                <span className="flex size-11 flex-none items-center justify-center rounded-full border-2 border-tinta">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="catalogo" className="bg-crema pt-[clamp(56px,6vw,88px)]">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 px-[clamp(16px,3.6vw,54px)] pb-6">
          <div className="flex flex-col gap-1">
            <h2 className={tituloSeccion}>Nuestro catálogo</h2>
            <p className="text-topo">Gala, XV, cortos y floreados</p>
          </div>
          <Link href="/catalogo" className="text-[15px] leading-[22px] font-semibold tracking-[0.08em] uppercase underline underline-offset-[5px] transition-colors hover:bg-arena active:bg-dorado">
            Ver todo
          </Link>
        </div>
        <ul aria-label="Vestidos del catálogo" className="flex flex-wrap border-t-2 border-tinta">
          {DESTACADOS.map((destacado) => (
            <li key={destacado.nombre} className="relative min-w-0 flex-[1_1_clamp(170px,22vw,340px)] border-r-2 border-b-2 border-tinta">
              <Link href="/catalogo" className={tarjeta}>
                <span className={`${marcoIlustracion} flex aspect-square items-end justify-center bg-lino`}>
                  <Vestido {...destacado.vestido} etiqueta={destacado.nombre} />
                </span>
                <span className="flex flex-col gap-0.5 border-t-2 border-tinta px-4.5 pt-4 pb-5">
                  <span className={etiqueta}>{destacado.modalidad}</span>
                  <span className={`${nombreTarjeta} text-[18px] leading-[24px]`}>{destacado.nombre}</span>
                  <span className="text-[18px] leading-[24px] text-grafito">S/ [precio]</span>
                </span>
              </Link>
              <button type="button" aria-label={`Agregar ${destacado.nombre} a favoritos`} className="absolute top-3 right-3 flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-tinta bg-white transition-colors hover:bg-arena active:bg-dorado">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section id="pasos" className="mt-[clamp(56px,6vw,88px)] border-t-2 border-tinta bg-piedra">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 px-[clamp(16px,3.6vw,54px)] pt-[clamp(40px,4.4vw,64px)] pb-7">
          <h2 className={tituloSeccion}>Alquiler en 3 pasos</h2>
          <p className="text-grafito">Vestidos de gala y de XV</p>
        </div>
        <ol className="flex flex-wrap border-t-2 border-tinta">
          {PASOS.map((paso, i) => {
            const ultimo = i === PASOS.length - 1;
            return (
              <li key={paso.numero} className={`flex min-w-0 flex-[1_1_260px] flex-col gap-2.5 border-b-2 border-tinta px-[clamp(16px,2.4vw,36px)] py-[clamp(24px,2.6vw,40px)] ${ultimo ? "items-start" : "border-r-2"}`}>
                <span className="text-[clamp(48px,4.4vw,68px)] leading-none font-light">{paso.numero}</span>
                <span className="text-[22px] leading-[28px] font-medium">{paso.titulo}</span>
                <span className="text-grafito">{paso.texto}</span>
                {ultimo && (
                  <a href="#" className={`${botonOscuro} mt-2 gap-2.5 px-6 text-[14px] leading-[20px]`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.2A8 8 0 1 1 20 11.5z" />
                    </svg>
                    <span>Reservar por WhatsApp</span>
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}
