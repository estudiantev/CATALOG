// Estilos del área de la clienta (/cuenta y /cuenta/perfil), con el lenguaje del resto de la
// tienda: fondo blanco, líneas negras, títulos en caja negra y botones negro y blanco.

// Mismo margen lateral que la ruta de navegación y el detalle del producto
export const margenCuenta = "px-[clamp(16px,3vw,32px)]";
// Los dos paneles (tus datos y tus medidas) van lado a lado desde 1024 px, separados por una
// línea. Ahí llenan el alto que queda: la página ocupa justo una pantalla (app/(tienda)/cuenta/layout.tsx).
export const panelesCuenta = "grid gap-px border-b border-tinta bg-tinta lg:flex-auto lg:grid-cols-2";
export const panelCuenta = "flex min-w-0 flex-col items-start p-[clamp(16px,2.2vw,28px)]";

// Títulos en caja, más chicos que los de la página de inicio
const tituloPanel =
  "border border-tinta px-3 py-0.5 font-archivo text-[16px] leading-[1.35] font-extrabold font-stretch-expanded tracking-[0.02em] text-white uppercase";
export const tituloPanelVerde = `${tituloPanel} bg-acento2`;
export const tituloPanelAzul = `${tituloPanel} bg-acento`;

// Como la ficha de información del detalle del producto, un poco más chica
export const etiquetaDato = "text-[13px] text-[#666666]";
export const valorDato = "text-[18px] leading-[1.3] [overflow-wrap:anywhere]";

export const etiquetaCampo = "text-[15px] font-medium";
export const textoAyuda = "text-[14px] leading-[20px] text-[#666666]";
export const textoError = "text-[14px] leading-[20px] font-medium text-[#b3261e]";

// aria-invalid gana al borde normal por especificidad
export const campo =
  "min-h-10 w-full rounded-none border border-tinta bg-white px-3 text-[15px] text-tinta placeholder:text-[#8a8a8a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento aria-invalid:border-2 aria-invalid:border-[#b3261e]";
