import { slugValido } from "@/lib/colecciones";
import { leerJson } from "@/lib/productos";

// Contenido editable de la tienda, como un CMS. La tabla Content guarda una fila por sección
// (page "inicio" + section) con sus datos en JSON. Lo comparten la tienda, que lo lee, y el panel
// de contenido, que lo edita. "anuncios" y "pie" son parte del marco: se ven en todas las páginas
// de la tienda; las demás, solo en la de inicio. AppSync guarda el JSON sin revisarlo, así que:
// - al guardar, el panel lo valida (validarSeccion) y lo limpia (normalizarSeccion);
// - al leer, se normaliza: lo que falte o no sirva se reemplaza por el contenido por defecto.

export const PAGINA_INICIO = "inicio";

// Carpeta de S3 de las fotos (debe estar dentro de "content-images/*", la ruta que autoriza
// amplify/storage/resource.ts)
export const CARPETA_IMAGENES = "content-images/inicio/";

// En el orden en que se ven en la tienda
export const SECCIONES = [
  { id: "anuncios", nombre: "Anuncios" },
  { id: "portada", nombre: "Portada" },
  { id: "destacados", nombre: "Catálogo" },
  { id: "ocasiones", nombre: "Colecciones" },
  { id: "pasos", nombre: "Alquiler en 3 pasos" },
  { id: "nosotros", nombre: "Quiénes somos" },
  { id: "inspiracion", nombre: "Inspiración" },
  { id: "pie", nombre: "Pie de página" },
] as const;
export type Seccion = (typeof SECCIONES)[number]["id"];

// En el orden de COLECCIONES (components/tienda/datos.ts). Sus nombres y enlaces arman también
// el menú y los filtros del catálogo, por eso aquí solo se editan sus textos.
export const OCASIONES = [
  { clave: "gala", nombre: "De Gala" },
  { clave: "xv", nombre: "De XV" },
  { clave: "cortos", nombre: "Cortos" },
  { clave: "floreados", nombre: "Floreados" },
] as const;
export type ClaveOcasion = (typeof OCASIONES)[number]["clave"];

// La página de inicio muestra de 2 a 4 colecciones, en el orden elegido en el panel. Cada elección
// es la clave de una de OCASIONES ("gala") o el enlace de una de /admin/colecciones con este
// prefijo ("coleccion:novias-2027"), que no choca con las claves aunque el enlace sea "gala".
export const MINIMO_EN_INICIO = 2;
export const MAXIMO_EN_INICIO = 4;
const PREFIJO_COLECCION = "coleccion:";
const OCASIONES_BASE: readonly ClaveOcasion[] = ["gala", "xv"];

export const eleccionDeColeccion = (slug: string) => `${PREFIJO_COLECCION}${slug}`;
export const slugDeEleccion = (eleccion: string) => (eleccion.startsWith(PREFIJO_COLECCION) ? eleccion.slice(PREFIJO_COLECCION.length) : null);
export const esOcasion = (eleccion: string): eleccion is ClaveOcasion => OCASIONES.some(({ clave }) => clave === eleccion);

// Lo que se ve de verdad: se saltan las colecciones despublicadas o borradas y, si quedan menos
// de dos, entran De Gala y De XV
export function eleccionesVigentes(enInicio: string[], estaVisible: (slug: string) => boolean) {
  const vigentes = enInicio.filter((eleccion) => {
    const slug = slugDeEleccion(eleccion);
    return slug === null || estaVisible(slug);
  });
  const relleno = OCASIONES_BASE.filter((clave) => !vigentes.includes(clave));
  return [...vigentes, ...relleno.slice(0, Math.max(0, MINIMO_EN_INICIO - vigentes.length))];
}

// Una red sin enlace no se muestra en el pie
export const REDES = [
  { clave: "instagram", nombre: "Instagram" },
  { clave: "tiktok", nombre: "TikTok" },
  { clave: "pinterest", nombre: "Pinterest" },
  { clave: "facebook", nombre: "Facebook" },
  { clave: "youtube", nombre: "YouTube" },
] as const;
export type ClaveRed = (typeof REDES)[number]["clave"];

export const MAXIMO_ANUNCIOS = 4;
export const MAXIMO_DIAPOSITIVAS = 3;
// Dos filas de 5 en la página de inicio
export const PRODUCTOS_POR_FILA = 5;
export const MAXIMO_DESTACADOS = PRODUCTOS_POR_FILA * 2;

// Cada cuántos segundos cambia el anuncio
export const SEGUNDOS_ANUNCIO = [3, 4, 5, 6, 8, 10] as const;

// Largo máximo de cada texto, para que ninguno descuadre el diseño
export const LARGO = {
  antetitulo: 40,
  titulo: 60,
  texto: 180,
  boton: 24,
  enlace: 300,
  tituloSeccion: 40,
  subtitulo: 80,
  modalidad: 30,
  descripcion: 120,
  tituloPaso: 40,
  textoPaso: 140,
  anuncio: 90,
  etiqueta: 16,
  lema: 60,
  textoNosotros: 400,
  textoInspiracion: 140,
  descripcionPie: 240,
  notaBoletin: 160,
} as const;

export type Boton = { texto: string; enlace: string };
export type Imagen = { key: string };
export type Diapositiva = {
  antetitulo: string;
  titulo: string;
  texto: string;
  botonPrincipal: Boton;
  botonSecundario: Boton; // sin texto, no se muestra
  imagen: Imagen | null; // sin foto se ven las ilustraciones de vestidos
  imagenMovil: Imagen | null; // la del celular; sin ella, ahí se usa `imagen`
};
export type Anuncio = { texto: string; boton: Boton }; // sin texto en el botón, va sin enlace
export type Ocasion = { modalidad: string; descripcion: string; imagen: Imagen | null }; // sin foto, la ilustración
export type Paso = { titulo: string; texto: string };

export type DatosSeccion = {
  anuncios: { mensajes: Anuncio[]; segundos: number };
  portada: { diapositivas: Diapositiva[] };
  destacados: {
    titulo: string;
    subtitulo: string;
    productos: string[]; // productIds, en orden
    etiquetas: Record<string, string>; // productId → "Nuevo"; sin etiqueta, no se muestra
  };
  ocasiones: Record<ClaveOcasion, Ocasion> & { enInicio: string[] };
  pasos: { titulo: string; subtitulo: string; pasos: Paso[]; boton: string };
  nosotros: { titulo: string; lema: string; texto: string; imagen: Imagen | null };
  // Una foto o un video: el panel guarda uno de los dos. Sin ninguno, las ilustraciones
  inspiracion: { antetitulo: string; texto: string; boton: Boton; imagen: Imagen | null; video: Imagen | null };
  pie: {
    descripcion: string;
    boletinTitulo: string; // sin título no se muestra el formulario
    boletinNota: string;
    redes: Record<ClaveRed, string>;
  };
};

// existe: si ya hay una fila guardada (el panel decide entre crearla o actualizarla)
export type SeccionContenido<S extends Seccion> = { datos: DatosSeccion[S]; visible: boolean; existe: boolean };
export type ContenidoInicio = { [S in Seccion]: SeccionContenido<S> };

const INSTAGRAM_FARA = "https://www.instagram.com/fara_collection_tacna";

// Lo que muestra la tienda mientras una sección no se haya guardado desde el panel
export const POR_DEFECTO: DatosSeccion = {
  anuncios: {
    mensajes: [
      { texto: "Alquila tu vestido de gala o de XV en Tacna —", boton: { texto: "ver catálogo", enlace: "/catalogo" } },
      { texto: "Encuentra el vestido perfecto para tu próximo evento —", boton: { texto: "ver colecciones", enlace: "/#colecciones" } },
      { texto: "Reserva tu vestido en 3 pasos —", boton: { texto: "ver cómo", enlace: "/#pasos" } },
    ],
    segundos: 4,
  },
  portada: {
    diapositivas: [
      {
        antetitulo: "Vestidos de gala y de XV",
        titulo: "Tu vestido, tu noche",
        texto: "Compra o alquila vestidos de gala, de XV, cortos y floreados.",
        botonPrincipal: { texto: "Comprar", enlace: "/catalogo" },
        botonSecundario: { texto: "Alquilar", enlace: "#pasos" },
        imagen: null,
        imagenMovil: null,
      },
    ],
  },
  destacados: { titulo: "Catálogo", subtitulo: "", productos: [], etiquetas: {} },
  ocasiones: {
    gala: { modalidad: "Venta y alquiler", descripcion: "Para matrimonios, graduaciones y noches de gala.", imagen: null },
    xv: { modalidad: "Venta y alquiler", descripcion: "Para tu fiesta de quince años.", imagen: null },
    cortos: { modalidad: "Venta", descripcion: "Para cócteles, cumpleaños y celebraciones.", imagen: null },
    floreados: { modalidad: "Venta", descripcion: "Estampados en flor para eventos de día.", imagen: null },
    enInicio: [...OCASIONES_BASE],
  },
  pasos: {
    titulo: "Alquiler en 3 pasos",
    subtitulo: "Vestidos de gala y de XV",
    pasos: [
      { titulo: "Elige tu vestido", texto: "Explora los modelos de gala y de XV disponibles." },
      { titulo: "Reserva la fecha", texto: "Separa tu vestido para el día de tu evento." },
      { titulo: "Lúcelo y devuélvelo", texto: "Disfruta tu noche y devuelve el vestido después." },
    ],
    boton: "Reservar por WhatsApp",
  },
  nosotros: {
    titulo: "¿Quiénes somos?",
    lema: "Un vestido para cada momento.",
    texto:
      "Somos una tienda de Tacna que vende y alquila vestidos de gala, de XV, cortos y floreados. Creemos que lucir increíble en cada evento no debería significar comprar un vestido nuevo cada vez.",
    imagen: null,
  },
  inspiracion: {
    antetitulo: "Inspiración",
    texto: "Ideas, tendencias y consejos para encontrar tu look perfecto en cada ocasión.",
    boton: { texto: "Ver en Instagram", enlace: INSTAGRAM_FARA },
    imagen: null,
    video: null,
  },
  pie: {
    descripcion: "Vestidos de alta costura en venta y alquiler, confeccionados en Tacna.",
    boletinTitulo: "Suscríbete a nuestras novedades",
    boletinNota: "Al suscribirte nos escribes por WhatsApp. Puedes darte de baja cuando quieras.",
    redes: {
      instagram: INSTAGRAM_FARA,
      tiktok: "https://www.tiktok.com/@faracollections.tacna",
      pinterest: "",
      facebook: "",
      youtube: "",
    },
  },
};

// Una página de la tienda (/catalogo), una sección de la portada (#pasos) o una dirección https://.
// Nada de "javascript:" ni de "//otro-sitio" (un enlace que parece interno y no lo es).
export function enlaceValido(enlace: string) {
  return /^\/(?![/\\])[^\s\\]*$/.test(enlace) || /^#[A-Za-z][\w-]*$/.test(enlace) || /^https:\/\/[^\s/\\]+[^\s\\]*$/.test(enlace);
}

export const rutaImagenValida = (key: string) => key.startsWith(CARPETA_IMAGENES) && !key.includes("..") && !/\s/.test(key);

// ── Normalizar: de lo guardado (o lo escrito en el panel) a datos que la portada puede mostrar ──

type Objeto = Record<string, unknown>;
const objeto = (v: unknown): Objeto => (v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Objeto) : {});
const lista = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

// Sin espacios de más y dentro del largo. Si no es texto, o si queda vacío y es obligatorio,
// vale el texto por defecto.
function texto(v: unknown, porDefecto: string, largo: number, opcional = false) {
  if (typeof v !== "string") return porDefecto;
  const limpio = v.trim().slice(0, largo);
  return limpio || opcional ? limpio : porDefecto;
}

function boton(v: unknown, porDefecto: Boton, opcional: boolean): Boton {
  const o = objeto(v);
  const enlace = typeof o.enlace === "string" ? o.enlace.trim().slice(0, LARGO.enlace) : "";
  if (opcional) {
    const textoBoton = texto(o.texto, "", LARGO.boton, true);
    return textoBoton && enlaceValido(enlace) ? { texto: textoBoton, enlace } : { texto: "", enlace: "" };
  }
  return { texto: texto(o.texto, porDefecto.texto, LARGO.boton), enlace: enlaceValido(enlace) ? enlace : porDefecto.enlace };
}

function imagen(v: unknown): Imagen | null {
  const o = objeto(v);
  if (typeof o.key !== "string" || !rutaImagenValida(o.key)) return null;
  return { key: o.key };
}

function diapositiva(v: unknown): Diapositiva {
  const o = objeto(v);
  const porDefecto = POR_DEFECTO.portada.diapositivas[0];
  return {
    antetitulo: texto(o.antetitulo, "", LARGO.antetitulo, true),
    titulo: texto(o.titulo, porDefecto.titulo, LARGO.titulo),
    texto: texto(o.texto, "", LARGO.texto, true),
    botonPrincipal: boton(o.botonPrincipal, porDefecto.botonPrincipal, false),
    botonSecundario: boton(o.botonSecundario, porDefecto.botonSecundario, true),
    imagen: imagen(o.imagen),
    imagenMovil: imagen(o.imagenMovil),
  };
}

const BOTON_VACIO: Boton = { texto: "", enlace: "" };

function eleccionValida(v: unknown): v is string {
  if (typeof v !== "string") return false;
  const slug = slugDeEleccion(v);
  return slug === null ? esOcasion(v) : slugValido(slug);
}

function anuncio(v: unknown): Anuncio {
  const o = objeto(v);
  return { texto: texto(o.texto, "", LARGO.anuncio, true), boton: boton(o.boton, BOTON_VACIO, true) };
}

const NORMALIZAR: { [S in Seccion]: (datos: Objeto) => DatosSeccion[S] } = {
  anuncios: (d) => {
    const mensajes = lista(d.mensajes)
      .slice(0, MAXIMO_ANUNCIOS)
      .map(anuncio)
      .filter((m) => m.texto);
    return {
      mensajes: mensajes.length ? mensajes : structuredClone(POR_DEFECTO.anuncios.mensajes),
      segundos: SEGUNDOS_ANUNCIO.find((s) => s === d.segundos) ?? POR_DEFECTO.anuncios.segundos,
    };
  },
  portada: (d) => {
    const diapositivas = lista(d.diapositivas).slice(0, MAXIMO_DIAPOSITIVAS).map(diapositiva);
    return { diapositivas: diapositivas.length ? diapositivas : structuredClone(POR_DEFECTO.portada.diapositivas) };
  },
  ocasiones: (d) => {
    const tarjetas = Object.fromEntries(
      OCASIONES.map(({ clave }) => {
        const o = objeto(d[clave]);
        const porDefecto = POR_DEFECTO.ocasiones[clave];
        return [
          clave,
          {
            modalidad: texto(o.modalidad, porDefecto.modalidad, LARGO.modalidad),
            descripcion: texto(o.descripcion, porDefecto.descripcion, LARGO.descripcion),
            imagen: imagen(o.imagen),
          },
        ];
      }),
    ) as Record<ClaveOcasion, Ocasion>;
    const elegidas = Array.from(new Set(lista(d.enInicio).filter(eleccionValida))).slice(0, MAXIMO_EN_INICIO);
    return {
      ...tarjetas,
      // Lo guardado antes de poder elegir no trae la lista: De Gala, De XV y las demás con foto
      enInicio: elegidas.length >= MINIMO_EN_INICIO ? elegidas : OCASIONES.map(({ clave }) => clave).filter((clave) => OCASIONES_BASE.includes(clave) || tarjetas[clave].imagen),
    };
  },
  destacados: (d) => {
    const productos = Array.from(
      new Set(lista(d.productos).filter((id): id is string => typeof id === "string" && id.length > 0 && id.length <= 64)),
    ).slice(0, MAXIMO_DESTACADOS);
    const etiquetas = objeto(d.etiquetas);
    return {
      titulo: texto(d.titulo, POR_DEFECTO.destacados.titulo, LARGO.tituloSeccion),
      subtitulo: texto(d.subtitulo, POR_DEFECTO.destacados.subtitulo, LARGO.subtitulo, true),
      productos,
      // Solo las de los productos elegidos: al quitar uno, su etiqueta se va con él
      etiquetas: Object.fromEntries(
        productos.flatMap((id) => {
          const etiqueta = texto(etiquetas[id], "", LARGO.etiqueta, true);
          return etiqueta ? [[id, etiqueta]] : [];
        }),
      ),
    };
  },
  pasos: (d) => {
    const pasos = lista(d.pasos);
    return {
      titulo: texto(d.titulo, POR_DEFECTO.pasos.titulo, LARGO.tituloSeccion),
      subtitulo: texto(d.subtitulo, POR_DEFECTO.pasos.subtitulo, LARGO.subtitulo, true),
      // Siempre 3: el diseño (y el título "en 3 pasos") cuenta con ellos
      pasos: POR_DEFECTO.pasos.pasos.map((porDefecto, i) => {
        const o = objeto(pasos[i]);
        return {
          titulo: texto(o.titulo, porDefecto.titulo, LARGO.tituloPaso),
          texto: texto(o.texto, porDefecto.texto, LARGO.textoPaso),
        };
      }),
      boton: texto(d.boton, POR_DEFECTO.pasos.boton, LARGO.boton),
    };
  },
  nosotros: (d) => ({
    titulo: texto(d.titulo, POR_DEFECTO.nosotros.titulo, LARGO.tituloSeccion),
    lema: texto(d.lema, "", LARGO.lema, true),
    texto: texto(d.texto, POR_DEFECTO.nosotros.texto, LARGO.textoNosotros),
    imagen: imagen(d.imagen),
  }),
  inspiracion: (d) => ({
    antetitulo: texto(d.antetitulo, "", LARGO.antetitulo, true),
    texto: texto(d.texto, POR_DEFECTO.inspiracion.texto, LARGO.textoInspiracion),
    boton: boton(d.boton, POR_DEFECTO.inspiracion.boton, false),
    imagen: imagen(d.imagen),
    video: imagen(d.video), // va en la misma carpeta que las fotos
  }),
  pie: (d) => {
    const redes = objeto(d.redes);
    return {
      descripcion: texto(d.descripcion, POR_DEFECTO.pie.descripcion, LARGO.descripcionPie),
      boletinTitulo: texto(d.boletinTitulo, "", LARGO.tituloSeccion, true),
      boletinNota: texto(d.boletinNota, "", LARGO.notaBoletin, true),
      // Una red sin enlace válido se guarda vacía y no se muestra
      redes: Object.fromEntries(
        REDES.map(({ clave }) => {
          const valor = redes[clave];
          const enlace = typeof valor === "string" ? valor.trim().slice(0, LARGO.enlace) : "";
          return [clave, enlaceValido(enlace) ? enlace : ""];
        }),
      ) as DatosSeccion["pie"]["redes"],
    };
  },
};

// `datos` puede llegar como texto JSON (así devuelve AppSync los campos a.json()) o como objeto
export function normalizarSeccion<S extends Seccion>(seccion: S, datos: unknown): DatosSeccion[S] {
  return NORMALIZAR[seccion](objeto(leerJson<unknown>(datos, {})));
}

export type FilaContenido = { section: string; data: unknown; visible?: boolean | null };

// Todas las secciones a partir de las filas guardadas; las que falten, con el contenido por defecto.
// La portada y el pie siempre se muestran.
export function armarContenido(filas: FilaContenido[]): ContenidoInicio {
  const seccion = <S extends Seccion>(id: S): SeccionContenido<S> => {
    const fila = filas.find((f) => f.section === id);
    return {
      datos: fila ? normalizarSeccion(id, fila.data) : structuredClone(POR_DEFECTO[id]),
      visible: id === "portada" || id === "pie" || (fila?.visible ?? true),
      existe: Boolean(fila),
    };
  };
  return {
    anuncios: seccion("anuncios"),
    portada: seccion("portada"),
    destacados: seccion("destacados"),
    ocasiones: seccion("ocasiones"),
    pasos: seccion("pasos"),
    nosotros: seccion("nosotros"),
    inspiracion: seccion("inspiracion"),
    pie: seccion("pie"),
  };
}

// ── Validar: lo que el panel revisa antes de guardar ──

// Clave = ruta del campo dentro de la sección, como "diapositivas.0.titulo". Van en el orden
// del formulario, así el panel puede enfocar el primero.
export type Errores = Record<string, string>;

type Revisor = {
  texto: (ruta: string, valor: string, largo: number, falta?: string) => void;
  enlace: (ruta: string, valor: string, falta?: string) => void;
  minimo: (ruta: string, cantidad: number, minimo: number, falta: string) => void;
};


const VALIDAR: { [S in Seccion]: (datos: DatosSeccion[S], r: Revisor) => void } = {
  anuncios: ({ mensajes }, r) => {
    mensajes.forEach((m, i) => {
      const ruta = `mensajes.${i}`;
      r.texto(`${ruta}.texto`, m.texto, LARGO.anuncio, "Escribe el anuncio.");
      if (m.boton.texto.trim() || m.boton.enlace.trim()) {
        r.texto(`${ruta}.boton.texto`, m.boton.texto, LARGO.boton, "Escribe el texto del enlace o borra a dónde lleva.");
        r.enlace(`${ruta}.boton.enlace`, m.boton.enlace, "Escribe a dónde lleva o borra el texto del enlace.");
      }
    });
  },
  portada: ({ diapositivas }, r) => {
    diapositivas.forEach((d, i) => {
      const ruta = `diapositivas.${i}`;
      r.texto(`${ruta}.antetitulo`, d.antetitulo, LARGO.antetitulo);
      r.texto(`${ruta}.titulo`, d.titulo, LARGO.titulo, "Escribe el título.");
      r.texto(`${ruta}.texto`, d.texto, LARGO.texto);
      r.texto(`${ruta}.botonPrincipal.texto`, d.botonPrincipal.texto, LARGO.boton, "Escribe el texto del botón.");
      r.enlace(`${ruta}.botonPrincipal.enlace`, d.botonPrincipal.enlace, "Escribe a dónde lleva el botón.");
      const { botonSecundario: secundario } = d;
      if (secundario.texto.trim() || secundario.enlace.trim()) {
        r.texto(`${ruta}.botonSecundario.texto`, secundario.texto, LARGO.boton, "Escribe el texto del botón o borra su enlace.");
        r.enlace(`${ruta}.botonSecundario.enlace`, secundario.enlace, "Escribe a dónde lleva el botón o borra su texto.");
      }
    });
  },
  ocasiones: (d, r) => {
    r.minimo("enInicio", d.enInicio.length, MINIMO_EN_INICIO, `Elige al menos ${MINIMO_EN_INICIO} colecciones.`);
    for (const { clave } of OCASIONES) {
      r.texto(`${clave}.modalidad`, d[clave].modalidad, LARGO.modalidad, "Escribe la modalidad, por ejemplo «Venta y alquiler».");
      r.texto(`${clave}.descripcion`, d[clave].descripcion, LARGO.descripcion, "Escribe la descripción.");
    }
  },
  destacados: (d, r) => {
    r.texto("titulo", d.titulo, LARGO.tituloSeccion, "Escribe el título de la sección.");
    r.texto("subtitulo", d.subtitulo, LARGO.subtitulo);
  },
  pasos: (d, r) => {
    r.texto("titulo", d.titulo, LARGO.tituloSeccion, "Escribe el título de la sección.");
    r.texto("subtitulo", d.subtitulo, LARGO.subtitulo);
    d.pasos.forEach((paso, i) => {
      r.texto(`pasos.${i}.titulo`, paso.titulo, LARGO.tituloPaso, "Escribe el título del paso.");
      r.texto(`pasos.${i}.texto`, paso.texto, LARGO.textoPaso, "Escribe el texto del paso.");
    });
    r.texto("boton", d.boton, LARGO.boton, "Escribe el texto del botón.");
  },
  nosotros: (d, r) => {
    r.texto("titulo", d.titulo, LARGO.tituloSeccion, "Escribe el título de la sección.");
    r.texto("lema", d.lema, LARGO.lema);
    r.texto("texto", d.texto, LARGO.textoNosotros, "Escribe el texto.");
  },
  inspiracion: (d, r) => {
    r.texto("antetitulo", d.antetitulo, LARGO.antetitulo);
    r.texto("texto", d.texto, LARGO.textoInspiracion, "Escribe el texto.");
    r.texto("boton.texto", d.boton.texto, LARGO.boton, "Escribe el texto del botón.");
    r.enlace("boton.enlace", d.boton.enlace, "Escribe a dónde lleva el botón.");
  },
  pie: (d, r) => {
    r.texto("descripcion", d.descripcion, LARGO.descripcionPie, "Escribe la descripción.");
    r.texto("boletinTitulo", d.boletinTitulo, LARGO.tituloSeccion);
    r.texto("boletinNota", d.boletinNota, LARGO.notaBoletin);
    for (const { clave } of REDES) r.enlace(`redes.${clave}`, d.redes[clave]);
  },
};

export function validarSeccion<S extends Seccion>(seccion: S, datos: DatosSeccion[S]): Errores {
  const errores: Errores = {};
  const revisor: Revisor = {
    texto: (ruta, valor, largo, falta) => {
      const limpio = valor.trim();
      if (!limpio && falta) errores[ruta] = falta;
      else if (limpio.length > largo) errores[ruta] = `Usa como máximo ${largo} caracteres.`;
    },
    enlace: (ruta, valor, falta) => {
      const limpio = valor.trim();
      if (!limpio) {
        if (falta) errores[ruta] = falta;
      } else if (limpio.length > LARGO.enlace || !enlaceValido(limpio)) {
        errores[ruta] = "Usa una página de la tienda (/catalogo), una sección (/#pasos) o una dirección que empiece con https://.";
      }
    },
    minimo: (ruta, cantidad, minimo, falta) => {
      if (cantidad < minimo) errores[ruta] = falta;
    },
  };
  VALIDAR[seccion](datos, revisor);
  return errores;
}
