// Las cajas con borde negro del encabezado y de la página de inicio

const hoverCaja = "transition-colors duration-150 hover:border-acento2 hover:bg-acento2 hover:text-white";

// Opciones del encabezado. Sin colores, para que no compitan con los de cada una
const cajaBase = `inline-flex min-h-[34px] items-center border border-tinta font-archivo text-[12px] font-semibold tracking-[0.08em] uppercase ${hoverCaja}`;
export const cajaNav = `${cajaBase} bg-white px-3.5 text-tinta`;
// En el celular son cuadrados con su ícono; en escritorio llevan también el texto
export const cajaIcono = `${cajaBase} size-10 justify-center gap-1.5 menu:size-auto menu:px-3`;

// Se le suma el color de fondo y el de la letra
export const botonCaja =
  "inline-flex min-h-10 items-center justify-center border border-tinta px-[22px] font-archivo text-[12px] font-bold tracking-[0.1em] uppercase transition-[box-shadow,transform] duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_#111111] motion-reduce:transition-none";

// Enlace ancho con flecha ("Ver todo")
export const botonAncho = `inline-flex min-h-[42px] w-[max(200px,20%)] items-center justify-center gap-2.5 border border-tinta bg-white text-[14px] font-medium text-tinta ${hoverCaja}`;

export const chip = `flex min-h-9 flex-none items-center gap-1.5 bg-white px-3 text-[11px] font-semibold tracking-[0.12em] text-tinta uppercase focus-visible:-outline-offset-2 ${hoverCaja}`;

export const tituloCaja =
  "border border-tinta bg-acento2 px-3.5 py-[3px] font-archivo text-[22px] leading-[1.25] font-extrabold font-stretch-expanded tracking-[0.02em] text-white uppercase";

export const barraSeccion = "flex flex-none flex-wrap items-center justify-between gap-2.5 border-b border-tinta px-3 py-2.5";

// Letras blancas con contorno negro y sombra verde
export const letraContorno =
  "font-archivo leading-none font-black font-stretch-expanded tracking-[0.01em] text-white uppercase [-webkit-text-stroke:1.5px_#111111] [paint-order:stroke_fill] [text-shadow:4px_4px_0_var(--color-acento2)]";
