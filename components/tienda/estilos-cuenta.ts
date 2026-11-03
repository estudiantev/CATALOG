// Estilos del área de la clienta (/cuenta y /cuenta/perfil). No usa el marco del login:
// es más aireada, con títulos en minúsculas y los botones de la portada.

// Mismo margen lateral que el logo y los íconos del encabezado
export const margenCuenta = "px-[clamp(16px,3.6vw,54px)]";
// El contenido no se estira más allá de 1280px en pantallas anchas
export const contenedorCuenta = `w-full max-w-[1280px] ${margenCuenta}`;

// Relleno del panel de medidas; "Tus datos" lo copia arriba para que los títulos queden alineados
export const rellenoPanel = "p-[clamp(20px,3vw,40px)]";
export const alineadoConPanel = "lg:pt-[clamp(20px,3vw,40px)]";

const boton =
  "inline-flex min-h-12 cursor-pointer items-center justify-center border-2 border-tinta px-7 text-[15px] leading-[20px] font-semibold tracking-[0.06em] uppercase transition-colors disabled:cursor-wait disabled:opacity-70";

export const botonPrincipal = `${boton} bg-tinta text-white hover:bg-dorado hover:text-tinta active:bg-white active:text-tinta`;
export const botonSecundario = `${boton} bg-white text-tinta hover:bg-arena active:bg-dorado`;

export const tituloBloque = "text-[24px] leading-[30px] font-normal";
export const etiquetaDato = "text-[14px] leading-[20px] text-topo";
export const etiquetaCampo = "text-[15px] leading-[20px] font-medium";
export const textoAyuda = "text-[14px] leading-[20px] text-topo";
export const textoError = "text-[14px] leading-[20px] text-vino";

// aria-invalid gana al borde normal por especificidad
export const campo =
  "h-12 w-full border border-tinta bg-white px-3 text-[16px] text-tinta placeholder:text-topo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta aria-invalid:border-2 aria-invalid:border-vino";
