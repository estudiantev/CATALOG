import type { Schema } from "@/amplify/data/resource";

// Colecciones: grupos de productos que arma Marketing, con su página en /coleccion/<slug>.
// Lo comparten la tienda, que las lee, y el panel, que las edita.

export type Coleccion = Schema["Collection"]["type"];
export type OrdenColeccion = Schema["CollectionSortOrder"]["type"];

// Debe estar dentro de "collections/*", la ruta que autoriza amplify/storage/resource.ts
export const CARPETA_COLECCIONES = "collections/";

export const ORDENES = [
  { valor: "MANUAL", nombre: "Manual: el orden de la lista" },
  { valor: "NEWEST", nombre: "Los más nuevos primero" },
  { valor: "PRICE_ASC", nombre: "Precio de venta: de menor a mayor" },
  { valor: "PRICE_DESC", nombre: "Precio de venta: de mayor a menor" },
] satisfies { valor: OrdenColeccion; nombre: string }[];

export const LARGO_COLECCION = {
  title: 80,
  slug: 80,
  description: 1000,
  seoTitle: 70,
  seoDescription: 160,
};

export const rutaColeccion = (slug: string) => `/coleccion/${slug}`;

// Minúsculas y sin tildes
export const normalizarTexto = (texto: string) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// "Novias 2027 — Edición Ñandú" → "novias-2027-edicion-nandu"
export function crearSlug(titulo: string) {
  return normalizarTexto(titulo)
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, LARGO_COLECCION.slug)
    .replace(/^-+|-+$/g, "");
}

export const slugValido = (slug: string) => slug.length <= LARGO_COLECCION.slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

export const idsDeColeccion = ({ productIds }: Pick<Coleccion, "productIds">) => (productIds ?? []).filter((id) => id !== null);

// ── Publicación ──

type Publicacion = Pick<Coleccion, "isPublished" | "startsAt" | "endsAt">;

export const ESTADOS = {
  borrador: "Borrador",
  programada: "Programada",
  publicada: "Publicada",
  terminada: "Terminada",
};

// Se calcula en cada visita, así una colección de temporada aparece y desaparece a su hora
export function estadoColeccion({ isPublished, startsAt, endsAt }: Publicacion, ahora = new Date()): keyof typeof ESTADOS {
  if (!isPublished) return "borrador";
  if (startsAt && ahora.getTime() < Date.parse(startsAt)) return "programada";
  if (endsAt && ahora.getTime() >= Date.parse(endsAt)) return "terminada";
  return "publicada";
}

export const coleccionVisible = (coleccion: Publicacion, ahora?: Date) => estadoColeccion(coleccion, ahora) === "publicada";

// ── Orden ──

// Primero las que tienen posición; sin posición o empatadas, por título
export function ordenarColecciones<C extends { title: string; position?: number | null }>(colecciones: C[]) {
  return [...colecciones].sort(
    (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity) || a.title.localeCompare(b.title, "es"),
  );
}

// Los productos de la colección, en su orden. Los que ya no están en `productos` se omiten.
export function ordenarProductos<P extends { productId: string; createdAt: string; priceSale: number }>(
  productos: P[],
  ids: string[],
  orden: OrdenColeccion,
) {
  const porId = new Map(productos.map((p) => [p.productId, p]));
  const elegidos = ids.flatMap((id) => porId.get(id) ?? []);
  if (orden === "NEWEST") return elegidos.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (orden === "PRICE_ASC") return elegidos.sort((a, b) => a.priceSale - b.priceSale);
  if (orden === "PRICE_DESC") return elegidos.sort((a, b) => b.priceSale - a.priceSale);
  return elegidos;
}

// ── Formulario del panel ──

export type FormularioColeccion = {
  title: string;
  slug: string;
  description: string;
  productIds: string[];
  sortOrder: OrdenColeccion;
  isPublished: boolean;
  startsAt: string; // hora local, como la da <input type="datetime-local">
  endsAt: string;
  position: string;
  seoTitle: string;
  seoDescription: string;
};

// <input type="datetime-local"> usa la hora local de quien edita; la tabla guarda UTC
export function aFechaLocal(iso?: string | null) {
  if (!iso) return "";
  const fecha = new Date(iso);
  return new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export const aFechaIso = (local: string) => (local ? new Date(local).toISOString() : null);

// Los errores van en el orden del formulario: el primero recibe el foco
export function validarColeccion(form: FormularioColeccion) {
  const errores: Record<string, string> = {};
  if (!form.title.trim()) errores.title = "Escribe el nombre de la colección.";
  if (!slugValido(form.slug)) errores.slug = "Usa solo letras minúsculas sin tildes, números y guiones, como novias-2027.";
  if (form.isPublished && form.productIds.length === 0) errores.productIds = "Agrega al menos un producto antes de publicarla.";
  if (form.startsAt && form.endsAt && form.endsAt <= form.startsAt) errores.endsAt = "Debe ser después del inicio.";
  if (form.position && !/^\d{1,4}$/.test(form.position)) errores.position = "Escribe un número entero, como 1.";
  return errores;
}
