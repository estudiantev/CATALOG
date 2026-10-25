const SITIO = "https://www.dominiodeprueba.click/";

const REDES = [
  { nombre: "Facebook", url: "https://www.facebook.com/p/FARA-collections-61573407368221" },
  { nombre: "Instagram", url: "https://www.instagram.com/fara_collection_tacna" },
  { nombre: "TikTok", url: "https://www.tiktok.com/@faracollections.tacna" },
];

export const tema = {
  negro: "#1c1a1b",
  bronce: "#cb9e4a",
  texto: "#4e453d",
  gris: "#786c60",
  blanco: "#ffffff",
  fondo: "#FBF6F1",
  fondoPie: "#cb9e4a",
  fuenteTitulo: "Georgia, 'Times New Roman', serif",
  fuenteTexto: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const linea = `1px solid ${tema.negro}`;

export const anuncioTexto = (texto: string, color=tema.bronce) =>
  `<div style="background:${color}; padding:8px 12px; text-align:center; margin:0; font-family:${tema.fuenteTexto}; font-size:15px; line-height:20px; font-weight:bold; color:${tema.negro};">${texto}</div>`;

export const logo = () =>
  `<div style="text-align:center; margin:40px 0 28px;"><img src="${SITIO}logo.png" alt="Fara Collections" width="160" style="display:block; width:160px; max-width:100%; height:auto; margin:0 auto; border:0;"/></div>`;

export const titulo = (texto: string) =>
  `<h1 style="margin:0 0 26px; text-align:center; font-family:${tema.fuenteTitulo}; font-size:36px; line-height:42px; font-weight:700; letter-spacing:1px; color:${tema.negro};">${texto}</h1>`;

export const parrafo = (texto: string) =>
  `<p style="margin:0 auto; max-width:400px; text-align:center; font-family:${tema.fuenteTexto}; font-size:16px; line-height:26px; color:${tema.texto};">${texto}</p>`;

export const bloqueCodigo = (codigo: string) =>
  `<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:28px auto 0;"><tr><td align="center" bgcolor="${tema.blanco}"style="background:${tema.blanco}; border:${linea}; padding:14px 24px; font-family:${tema.fuenteTexto}; font-size:38px; line-height:44px; font-weight:700; letter-spacing:4px; color:${tema.negro};">${codigo}</td></tr></table>`;

export const textoCodigo = (...lineas: string[]) =>
  `<p style="margin:26px 0 0; text-align:center; font-size:14px; line-height:22px; color:${tema.texto};">${lineas.join("<br>")}</p>`;

export const notaPie = (texto: string) =>
  `<p style="margin:28px auto 0; max-width:400px; text-align:center; font-size:14px; line-height:22px; color:${tema.gris};">${texto}</p>`;

const enlace = (texto: string, url: string, color: string) =>`<a href="${url}" style="color:${color}; text-decoration:underline; font-weight: 600;">${texto}</a>`;

const enlacesRedes = REDES.map((red) => enlace(red.nombre, red.url, tema.negro)).join("&nbsp;&nbsp;");

const separador = ` &nbsp;·&nbsp; `;

export const plantilla = (contenido: string, vistaPrevia = "", colorPrincipal = tema.bronce) => `
  <div style="margin:0 auto; max-width:600px; background:${tema.fondo}; font-family:${tema.fuenteTexto};">
    <!-- Encabezado -->
    <div style="display:none; font-size:1px; max-height:0; overflow:hidden;">${vistaPrevia}</div>
    ${anuncioTexto("DEDICADA AL ALQUILER Y VENTA DE VESTIDOS · TACNA", colorPrincipal)}
    ${logo()}
    <!-- Contenido -->
    <div style="padding:0px 24px 44px; text-align:center;">${contenido}</div>
    <!-- Pie de página -->
    <div style="background:${colorPrincipal}; padding:16px 12px; text-align:center; font-family:${tema.fuenteTexto}; color:${tema.negro};">
      <div style="margin-bottom:24px;">${enlace("Términos", `${SITIO}terminos`, tema.negro)} ${separador} ${enlace("Aviso de privacidad", `${SITIO}privacidad`, tema.negro)}</div>
      <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
        <span style="font-size:14px; font-weight:700; color:${tema.texto};">© 2026 Fara Collections</span>
        <span style="font-size:13px;">${enlacesRedes}</span>
      </div>
    </div>
  </div>
`;