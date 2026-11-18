import type { Schema } from "@/amplify/data/resource";
import { crearSlug, slugValido } from "@/lib/colecciones";

// Categorías del catálogo, como "Vestidos" o "Accesorios": cada una es su propio catálogo en
// /catalogo?categoria=<slug>. Product.category guarda su código, así el catálogo de una categoría
// sigue siendo un Query al índice listProductByCategory. Se crean, y se eligen para el menú de la
// tienda, en el panel de contenido. Lo comparten la tienda, que las lee, y el panel, que las edita.

export type FilaCategoria = Pick<Schema["Category"]["type"], "code" | "name" | "plural" | "slug" | "inMenu" | "position">;

export type Categoria = {
  codigo: string; // el que guarda Product.category ("DRESS"); nunca cambia
  nombre: string; // en singular, "Vestido": el formulario de productos y el detalle
  plural: string; // "Vestidos": el menú, el título y la ruta del catálogo
  slug: string; // el de /catalogo?categoria=vestidos; nunca cambia, para no romper los enlaces
  enMenu: boolean;
  posicion: number;
  base: boolean; // una de las tres de siempre: no se puede eliminar
  existe: boolean; // si ya tiene su fila (el panel decide entre crearla o actualizarla)
};

// Las de antes de la tabla, con los códigos que ya guardan los productos. Están siempre, aunque la
// tabla esté vacía o no responda; su fila, si la tienen, cambia sus nombres, el menú y el orden.
// Mientras no se guarden, el menú queda como antes: solo con Accesorios.
export const CATEGORIAS_BASE: readonly Categoria[] = [
  { codigo: "DRESS", nombre: "Vestido", plural: "Vestidos", slug: "vestidos", enMenu: false, posicion: 1, base: true, existe: false },
  { codigo: "JEWELRY", nombre: "Joya", plural: "Joyas", slug: "joyas", enMenu: false, posicion: 2, base: true, existe: false },
  { codigo: "ACCESSORY", nombre: "Accesorio", plural: "Accesorios", slug: "accesorios", enMenu: true, posicion: 3, base: true, existe: false },
];

// La de /catalogo sin ?categoria= y la del menú desplegable Catálogo
export const CATEGORIA_PRINCIPAL = "DRESS";

// Las que entran en el menú de la tienda junto a Catálogo, Colecciones y Contacto
export const MAXIMO_EN_MENU = 3;

export const LARGO_CATEGORIA = { nombre: 24, plural: 24 };

export const rutaCategoria = (slug: string) => `/catalogo?categoria=${slug}`;

// El slug de una nueva sale de su plural al crearla: "Ropa de baño" → "ropa-de-bano"
export const slugDeCategoria = (plural: string) => crearSlug(plural);

// Y el código, del slug, al estilo de las de siempre: "ropa-de-bano" → "ROPA_DE_BANO"
export const codigoDeSlug = (slug: string) => slug.toUpperCase().replace(/-/g, "_");

const texto = (v: unknown, largo: number) => (typeof v === "string" ? v.trim().slice(0, largo) : "");

function leerFila(fila: FilaCategoria): Categoria | null {
  const base = CATEGORIAS_BASE.find((b) => b.codigo === fila.code);
  const plural = texto(fila.plural, LARGO_CATEGORIA.plural) || base?.plural || "";
  const slug = base?.slug ?? fila.slug;
  if (!fila.code || !plural || !slugValido(slug)) return null;
  return {
    codigo: fila.code,
    nombre: texto(fila.name, LARGO_CATEGORIA.nombre) || base?.nombre || plural,
    plural,
    slug,
    enMenu: fila.inMenu ?? base?.enMenu ?? false,
    posicion: fila.position ?? Number.MAX_SAFE_INTEGER,
    base: Boolean(base),
    existe: true,
  };
}

// De las filas guardadas a la lista que usan la tienda y el panel, en orden: primero por posición
// y, empatadas, por nombre. Las de siempre van aunque no tengan fila; una fila sin código, sin
// plural o con un slug que ya usa otra no se puede enlazar y se salta.
export function armarCategorias(filas: FilaCategoria[]): Categoria[] {
  const leidas = filas.flatMap((fila) => leerFila(fila) ?? []);
  const lista = CATEGORIAS_BASE.map((base) => leidas.find((c) => c.codigo === base.codigo) ?? { ...base });
  for (const categoria of leidas) {
    if (!lista.some((c) => c.codigo === categoria.codigo || c.slug === categoria.slug)) lista.push(categoria);
  }
  return lista.sort((a, b) => a.posicion - b.posicion || a.plural.localeCompare(b.plural, "es"));
}

export const categoriaPrincipal = (categorias: Categoria[]) =>
  categorias.find((c) => c.codigo === CATEGORIA_PRINCIPAL) ?? CATEGORIAS_BASE[0];

// ── Ancho del menú de escritorio ──

// El menú de escritorio se diseñó con Accesorios como única categoría y se muestra desde 998 px.
// Más categorías piden más ancho de pantalla: por debajo, la tienda usa el menú de celular, así las
// opciones nunca se montan sobre los íconos. Cada nombre se estima en 10 px por letra (en el menú
// miden de 8 a 9.6) más los 21 px entre opciones. A 998 px, con un nombre de 14 letras en "Mi
// cuenta", todavía sobran unos 128 px.
const PX_POR_LETRA = 10;
const PX_ENTRE_OPCIONES = 21;
const HOLGURA = 110;
// Desde 1100 px el staff ve "Panel" en texto y su nombre completo: la derecha crece unos 66 px
const ANCHO_PANEL = 1100;
const SALTO_PANEL = 70;

// Desde qué ancho se muestra el menú de escritorio en cada escalón. Deben coincidir con la variante
// `menu` de app/(tienda)/tienda.css.
export const ANCHOS_MENU = [998, 1080, 1160, 1280] as const;

const anchoOpcion = (nombre: string) => nombre.trim().length * PX_POR_LETRA + PX_ENTRE_OPCIONES;

// El escalón (índice de ANCHOS_MENU) que necesita el menú con estas categorías; -1 si no entran ni
// en el último. Uno por debajo de 1100 px sirve solo si el menú también entra con el salto del staff.
export function escalonMenu(nombres: string[]) {
  const extra = nombres.reduce((total, nombre) => total + anchoOpcion(nombre), 0) - anchoOpcion("Accesorios");
  const necesario = ANCHOS_MENU[0] + Math.max(0, extra - HOLGURA);
  return ANCHOS_MENU.findIndex((ancho) =>
    ancho >= ANCHO_PANEL ? ancho >= necesario + SALTO_PANEL : ancho >= necesario && necesario + SALTO_PANEL <= ANCHO_PANEL,
  );
}

// ── Validar: lo que el panel revisa antes de guardar ──

// Una fila del formulario. `codigo` y `slug` de una nueva salen de su plural (los da el panel).
export type CategoriaEditada = { id: string; codigo: string; slug: string; nueva: boolean; nombre: string; plural: string; enMenu: boolean };

// Clave = "<id>.nombre", "<id>.plural" o "menu"; van en el orden del formulario, así el panel puede
// enfocar el primero
export function validarCategorias(lista: CategoriaEditada[]) {
  const errores: Record<string, string> = {};
  lista.forEach((c, i) => {
    const nombre = c.nombre.trim();
    const plural = c.plural.trim();
    if (!nombre) errores[`${c.id}.nombre`] = "Escribe el nombre.";
    else if (nombre.length > LARGO_CATEGORIA.nombre) errores[`${c.id}.nombre`] = `Usa como máximo ${LARGO_CATEGORIA.nombre} caracteres.`;
    if (!plural) errores[`${c.id}.plural`] = "Escribe el nombre en plural.";
    else if (plural.length > LARGO_CATEGORIA.plural) errores[`${c.id}.plural`] = `Usa como máximo ${LARGO_CATEGORIA.plural} caracteres.`;
    else if (c.nueva && !slugValido(c.slug)) errores[`${c.id}.plural`] = "Usa al menos una letra o un número.";
    else if (c.nueva && lista.some((otra, j) => j !== i && (otra.slug === c.slug || otra.codigo === c.codigo))) {
      errores[`${c.id}.plural`] = "Ya hay otra categoría con este nombre.";
    }
  });
  const enMenu = lista.filter((c) => c.enMenu);
  if (enMenu.length > MAXIMO_EN_MENU) errores.menu = `Muestra como máximo ${MAXIMO_EN_MENU} en el menú.`;
  else if (escalonMenu(enMenu.map((c) => c.plural)) === -1) {
    errores.menu = "Los nombres de las categorías del menú son muy largos para entrar en una línea: acórtalos o muestra menos.";
  }
  return errores;
}
