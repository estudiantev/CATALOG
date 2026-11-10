// Estilos del encabezado y de la página de inicio

// Al pasar el cursor se invierten: las cajas blancas se ponen negras y las negras, blancas
export const hoverBlanca = "transition-colors duration-150 hover:border-acento hover:bg-acento hover:text-white";
const hoverAzul = "transition-colors duration-150 hover:bg-white hover:text-tinta";

// Opciones del encabezado: texto en mayúsculas, sin caja, que se subraya al pasar el cursor. Miden
// 44 px de alto para el dedo aunque solo se vea el texto.
const opcionBase =
  "inline-flex items-center text-[14px] leading-[18px] tracking-[0.02em] text-tinta uppercase hover:underline hover:underline-offset-3";
export const opcionNav = `${opcionBase} min-h-11`;
// En el celular son íconos de 40 px; en escritorio, el texto (Buscar es solo el ícono)
export const opcionIcono = `${opcionBase} size-10 justify-center gap-1.5 menu:size-auto menu:min-h-11`;
// Las tallas de los menús del encabezado
export const cajaNav = `inline-flex min-h-[34px] items-center bg-white px-3.5 font-archivo text-[12px] font-semibold tracking-[0.08em] text-tinta uppercase ${hoverBlanca}`;

const botonCaja = "inline-flex min-h-10 items-center justify-center px-[22px] font-archivo text-[12px] font-bold tracking-[0.1em] uppercase";
export const botonBlanco = `${botonCaja} bg-white text-tinta ${hoverBlanca}`;
export const botonAzul = `${botonCaja} bg-acento text-white ${hoverAzul}`;
// Estos no se invierten: se levantan con una sombra
const levantar =
  "transition-[box-shadow,transform] duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_#111111] motion-reduce:transition-none";
export const botonVerde = `${botonCaja} bg-acento2 text-white ${levantar}`;

// Los botones de la página de inicio: con la letra del texto (sin mayúsculas) y una línea negra
// alrededor. Miden 49 px de alto.
const formaInicio =
  "inline-flex items-center justify-center border border-tinta px-[19px] text-center font-cuerpo text-[18px] leading-[23px]";
const botonInicio = `${formaInicio} py-3`;
// Al pasar el cursor el fondo se oscurece un poco: el gris claro pasa a un gris más fuerte y el
// blanco, a gris claro
const hoverGris = "transition-colors duration-150 hover:bg-[#d6d6d6]";
const hoverClaro = "transition-colors duration-150 hover:bg-[#e8e8e8]";
// Los de la portada: el principal gris claro y el otro blanco
export const botonInicioGris = `${botonInicio} bg-[#e8e8e8] text-tinta ${hoverGris}`;
export const botonInicioBlanco = `${botonInicio} bg-white text-tinta ${hoverClaro}`;
export const botonInicioVerde = `${botonInicio} bg-acento2 text-white ${levantar}`;

// Títulos de sección en una caja negra
const tituloCajaBase =
  "border border-tinta px-3.5 py-[3px] font-archivo text-[clamp(17px,5.4vw,22px)] leading-[1.25] font-extrabold font-stretch-expanded tracking-[0.02em] text-white uppercase";
export const tituloCaja = `${tituloCajaBase} bg-acento2`;
export const tituloCajaAzul = `${tituloCajaBase} bg-acento`;

export const barraSeccion = "flex flex-none flex-wrap items-center justify-between gap-2.5 px-3 py-2.5";

// Letras blancas con contorno y sombra negros
export const letraContorno =
  "font-archivo leading-none font-black font-stretch-expanded tracking-[0.01em] text-white uppercase [-webkit-text-stroke:1.5px_#111111] [paint-order:stroke_fill] [text-shadow:4px_4px_0_var(--color-acento2)]";
