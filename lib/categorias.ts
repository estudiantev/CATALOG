import type { Schema } from "@/amplify/data/resource";
import { crearSlug, slugValido } from "@/lib/colecciones";

// Categorías de los vestidos, como "Floreados" o "De gala". Cada una tiene su página en
// /vestidos?categoria=<slug>, con sus vestidos. Cada vestido tiene una: Product.category guarda su
// código, que es la clave del índice listProductByCategory. Se crean, y se eligen para el menú de la
// tienda, en el panel (/admin/categorias). Lo comparten la tienda, que las lee, y el panel, que las edita.

export type FilaCategoria = Pick<Schema["Category"]["type"], "code" | "name" | "plural" | "slug" | "inMenu" | "position">;

export type Categoria = {
  codigo: string; // el que guarda Product.category ("DE_GALA"); nunca cambia
  nombre: string; // "De gala": el menú, el título de su página y el formulario de productos
  slug: string; // el de /vestidos?categoria=de-gala; nunca cambia, para no romper los enlaces
  enMenu: boolean;
  posicion: number;
  base: boolean; // una de las cinco de siempre: no se puede eliminar
  existe: boolean; // si ya tiene su fila (el panel decide entre crearla o actualizarla)
};

// El código que guardan los vestidos creados antes de las categorías. No es ninguna: salen en
// /vestidos y en el panel como "Sin categoría" hasta que se les elige una en su formulario. Cuando
// ya no quede ninguno, se puede borrar junto con sus usos (lib/catalogo.ts y components/admin/datos.ts).
export const SIN_CATEGORIA = "DRESS";

// Las cinco de siempre. Están aunque la tabla esté vacía o no responda; su fila, si la tienen,
// cambia su nombre, el menú y el orden. Mientras no se guarden, van en el menú las tres primeras.
export const CATEGORIAS_BASE: readonly Categoria[] = [
  { codigo: "FLOREADOS", nombre: "Floreados", slug: "floreados", enMenu: true, posicion: 1, base: true, existe: false },
  { codigo: "DE_GALA", nombre: "De gala", slug: "de-gala", enMenu: true, posicion: 2, base: true, existe: false },
  { codigo: "DE_NOVIA", nombre: "De novia", slug: "de-novia", enMenu: true, posicion: 3, base: true, existe: false },
  { codigo: "DE_15", nombre: "De 15", slug: "de-15", enMenu: false, posicion: 4, base: true, existe: false },
  { codigo: "CORTOS", nombre: "Cortos", slug: "cortos", enMenu: false, posicion: 5, base: true, existe: false },
];

// Las que entran en el menú de la tienda junto a Catálogo, Colecciones y Contacto
export const MAXIMO_EN_MENU = 3;

export const LARGO_CATEGORIA = 24;

export const rutaCategoria = (slug: string) => `/vestidos?categoria=${slug}`;

// "Vestidos de gala", "Vestidos floreados": el nombre de la página de una categoría
export const tituloCategoria = (categoria: Pick<Categoria, "nombre">) => `Vestidos ${categoria.nombre.toLowerCase()}`;

// El slug de una nueva sale de su nombre al crearla: "De cóctel" → "de-coctel"
export const slugDeCategoria = (nombre: string) => crearSlug(nombre);

// Y el código, del slug, al estilo de las de siempre: "de-coctel" → "DE_COCTEL"
export const codigoDeSlug = (slug: string) => slug.toUpperCase().replace(/-/g, "_");

// El nombre de la categoría de un producto; "" si no tiene (o ya no existe)
export const nombreDeCategoria = (codigo: string, categorias: Categoria[]) => categorias.find((c) => c.codigo === codigo)?.nombre ?? "";

const texto = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, LARGO_CATEGORIA) : "");

// `plural` es el nombre; `name` guarda lo mismo (las filas de antes tenían ahí el singular)
function leerFila(fila: FilaCategoria): Categoria | null {
  const base = CATEGORIAS_BASE.find((b) => b.codigo === fila.code);
  const nombre = texto(fila.plural) || texto(fila.name) || base?.nombre || "";
  const slug = base?.slug ?? fila.slug;
  if (!fila.code || !nombre || !slugValido(slug)) return null;
  return {
    codigo: fila.code,
    nombre,
    slug,
    enMenu: fila.inMenu ?? base?.enMenu ?? false,
    posicion: fila.position ?? Number.MAX_SAFE_INTEGER,
    base: Boolean(base),
    existe: true,
  };
}

// De las filas guardadas a la lista que usan la tienda y el panel, en orden: primero por posición
// y, empatadas, por nombre. Las de siempre van aunque no tengan fila; una fila sin código, sin
// nombre o con un slug que ya usa otra no se puede enlazar y se salta.
export function armarCategorias(filas: FilaCategoria[]): Categoria[] {
  const leidas = filas.flatMap((fila) => leerFila(fila) ?? []);
  const lista = CATEGORIAS_BASE.map((base) => leidas.find((c) => c.codigo === base.codigo) ?? { ...base });
  for (const categoria of leidas) {
    if (!lista.some((c) => c.codigo === categoria.codigo || c.slug === categoria.slug)) lista.push(categoria);
  }
  return lista.sort((a, b) => a.posicion - b.posicion || a.nombre.localeCompare(b.nombre, "es"));
}

// ── Ancho del menú de escritorio ──

// El menú de escritorio se diseñó con una sola categoría de 10 letras ("Accesorios") y se muestra
// desde 998 px. Más categorías piden más ancho de pantalla: por debajo, la tienda usa el menú de
// celular, así las opciones nunca se montan sobre los íconos. Cada nombre se estima en 10 px por
// letra (en el menú miden de 8 a 9.6) más los 21 px entre opciones. A 998 px, con un nombre de 14
// letras en "Mi cuenta", todavía sobran unos 128 px.
const PX_POR_LETRA = 10;
const PX_ENTRE_OPCIONES = 21;
const HOLGURA = 110;
const ANCHO_DISENADO = 10 * PX_POR_LETRA + PX_ENTRE_OPCIONES;
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
  const extra = nombres.reduce((total, nombre) => total + anchoOpcion(nombre), 0) - ANCHO_DISENADO;
  const necesario = ANCHOS_MENU[0] + Math.max(0, extra - HOLGURA);
  return ANCHOS_MENU.findIndex((ancho) =>
    ancho >= ANCHO_PANEL ? ancho >= necesario + SALTO_PANEL : ancho >= necesario && necesario + SALTO_PANEL <= ANCHO_PANEL,
  );
}

// ── Validar: lo que el panel revisa antes de guardar ──

// Una fila del formulario. `codigo` y `slug` de una nueva salen de su nombre (los da el panel).
export type CategoriaEditada = { id: string; codigo: string; slug: string; nueva: boolean; nombre: string; enMenu: boolean };

// Clave = "<id>.nombre" o "menu"; van en el orden del formulario, así el panel puede enfocar el primero
export function validarCategorias(lista: CategoriaEditada[]) {
  const errores: Record<string, string> = {};
  lista.forEach((c, i) => {
    const nombre = c.nombre.trim();
    if (!nombre) errores[`${c.id}.nombre`] = "Escribe el nombre.";
    else if (nombre.length > LARGO_CATEGORIA) errores[`${c.id}.nombre`] = `Usa como máximo ${LARGO_CATEGORIA} caracteres.`;
    else if (c.nueva && !slugValido(c.slug)) errores[`${c.id}.nombre`] = "Usa al menos una letra o un número.";
    else if (c.nueva && lista.some((otra, j) => j !== i && (otra.slug === c.slug || otra.codigo === c.codigo))) {
      errores[`${c.id}.nombre`] = "Ya hay otra categoría con este nombre.";
    }
  });
  const enMenu = lista.filter((c) => c.enMenu);
  if (enMenu.length > MAXIMO_EN_MENU) errores.menu = `Muestra como máximo ${MAXIMO_EN_MENU} en el menú.`;
  else if (escalonMenu(enMenu.map((c) => c.nombre)) === -1) {
    errores.menu = "Los nombres de las categorías del menú son muy largos para entrar en una línea: acórtalos o muestra menos.";
  }
  return errores;
}
