// Estilos del área de la clienta (/cuenta y /cuenta/perfil), con el lenguaje del resto de la
// tienda: fondo blanco, líneas negras, títulos en caja de color y botones azul y blanco.

// Mismo margen lateral que la ruta de navegación y el detalle del producto
export const margenCuenta = "px-[clamp(16px,3vw,32px)]";
// Los dos paneles (tus datos y tus medidas) van lado a lado desde 1024 px, separados por una línea
export const panelesCuenta = "grid gap-px border-b border-tinta bg-tinta lg:grid-cols-2";
export const panelCuenta = "flex min-w-0 flex-col items-start p-[clamp(20px,3vw,44px)]";

// Como la ficha de información del detalle del producto
export const etiquetaDato = "text-[13px] text-[#666666]";
export const valorDato = "text-[22px] leading-[1.3] [overflow-wrap:anywhere]";

export const etiquetaCampo = "text-[15px] font-medium";
export const textoAyuda = "text-[14px] leading-[20px] text-[#666666]";
export const textoError = "text-[14px] leading-[20px] font-medium text-[#b3261e]";

// aria-invalid gana al borde normal por especificidad
export const campo =
  "min-h-11 w-full rounded-none border border-tinta bg-white px-3 text-[15px] text-tinta placeholder:text-[#8a8a8a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento aria-invalid:border-2 aria-invalid:border-[#b3261e]";
