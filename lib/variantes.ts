import { CLAVES, type Clave, type Filtros, type Opciones, opcionesDeVariante, ordenarValores } from "@/lib/productos";

// Fila de Product.variantSummary: lo que el catálogo necesita de cada variante
export type ResumenVariante = {
  variantId: string;
  options: Opciones;
  priceSale: number;
  priceRent: number;
  inStock: boolean;
  cover: string | null; // portada (foto 1, versión liviana)
  hover: string | null; // contraportada (foto 2, versión liviana)
};

// Lo mínimo que se necesita de una ProductVariant para resumirla
type VarianteBase = {
  id: string;
  position?: number | null;
  stock?: number | null;
  priceSale: number;
  priceRent: number;
  size?: string | null;
  length?: string | null;
  neckline?: string | null;
  sleeve?: string | null;
  silhouette?: string | null;
  colorFamily?: string | null;
  images?: ({ key: string; thumbKey?: string | null; position?: number | null } | null | undefined)[] | null;
};

function unicos<T>(valores: (T | null | undefined)[]): T[] {
  return Array.from(new Set(valores.filter((v): v is T => v != null && v !== "")));
}

// Fotos de una variante en orden: 1 = portada, 2 = contraportada, 3..6 = resto
export function fotosOrdenadas<F extends { position?: number | null }>(fotos?: (F | null | undefined)[] | null) {
  return (fotos ?? []).flatMap((f) => (f ? [f] : [])).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

// Resumen que se guarda en Product: precios "desde", listas available* y variantSummary.
// Se recalcula cada vez que cambian las variantes; nunca se edita a mano.
export function resumenDeVariantes<V extends VarianteBase>(variantes: V[]) {
  const ordenadas = [...variantes].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const conStock = ordenadas.filter((v) => (v.stock ?? 0) > 0);
  const base = conStock.length ? conStock : ordenadas; // si todo está agotado, igual hay precio

  return {
    variantSummary: JSON.stringify(
      ordenadas.map((v): ResumenVariante => {
        const fotos = fotosOrdenadas(v.images);
        return {
          variantId: v.id,
          options: opcionesDeVariante(v),
          priceSale: v.priceSale,
          priceRent: v.priceRent,
          inStock: (v.stock ?? 0) > 0,
          cover: fotos[0] ? fotos[0].thumbKey ?? fotos[0].key : null,
          hover: fotos[1] ? fotos[1].thumbKey ?? fotos[1].key : null,
        };
      }),
    ),
    priceSale: base.length ? Math.min(...base.map((v) => v.priceSale)) : 0,
    priceRent: base.length ? Math.min(...base.map((v) => v.priceRent)) : 0,
    availableSizes: unicos(conStock.map((v) => v.size)) as NonNullable<V["size"]>[],
    availableLengths: unicos(conStock.map((v) => v.length)),
    availableNecklines: unicos(conStock.map((v) => v.neckline)),
    availableSleeves: unicos(conStock.map((v) => v.sleeve)),
    availableSilhouettes: unicos(conStock.map((v) => v.silhouette)),
    colorFamilies: unicos(conStock.map((v) => v.colorFamily)) as NonNullable<V["colorFamily"]>[],
  };
}

// ── Catálogo ──

type VarianteTarjeta<F> = {
  variantId: string;
  opciones: Opciones;
  precioVenta: number;
  precioAlquiler: number;
  enStock: boolean;
  portada: F | null;
  hover: F | null;
};

const cumple = (opciones: Opciones, filtros: Filtros) =>
  CLAVES.every((clave) => {
    const elegidos = filtros[clave];
    if (!elegidos?.length) return true;
    const valor = opciones[clave];
    return valor !== undefined && elegidos.includes(valor);
  });

// Una sola función para los 6 filtros: de las variantes con stock que cumplen todos a la vez
// salen el precio más bajo y la portada de la primera. null = el producto no se muestra.
export function resolverTarjeta<F>(p: { variantes: VarianteTarjeta<F>[] }, filtros: Filtros) {
  const candidatas = p.variantes.filter((v) => v.enStock && cumple(v.opciones, filtros));
  if (!candidatas.length) return null;

  const primera = candidatas.find((v) => v.portada) ?? candidatas[0];
  const precios = candidatas.map((v) => v.precioVenta);

  return {
    variantId: primera.variantId, // para abrir el detalle en esta combinación
    precioVenta: Math.min(...precios),
    precioAlquiler: Math.min(...candidatas.map((v) => v.precioAlquiler)),
    desde: new Set(precios).size > 1, // "Desde" solo si quedan precios distintos
    portada: primera.portada,
    hover: primera.hover,
  };
}

// ── Detalle: elegir una combinación ──

type VarianteElegible = { variantId: string; opciones: Opciones; enStock: boolean };

// La del ?v= del catálogo; si no existe, la primera con stock
export function varianteInicial<V extends VarianteElegible>(variantes: V[], variantId?: string) {
  return variantes.find((v) => v.variantId === variantId) ?? variantes.find((v) => v.enStock) ?? variantes[0];
}

// Las claves que el producto usa, con sus valores en el orden de las listas fijas
export function clavesDelProducto(variantes: VarianteElegible[]) {
  return CLAVES.flatMap((clave) => {
    const valores = unicos(variantes.map((v) => v.opciones[clave]));
    return valores.length ? [{ clave, valores: ordenarValores(clave, valores) }] : [];
  });
}

// Cuántas de las otras opciones elegidas comparte v con la variante actual
const comparteResto = (v: VarianteElegible, actual: VarianteElegible, clave: Clave) =>
  CLAVES.filter((k) => k !== clave && actual.opciones[k] !== undefined && v.opciones[k] === actual.opciones[k]).length;

// Al tocar un valor se pasa a la variante con stock que lo tiene y que más opciones
// comparte con la actual; así nunca se queda en una combinación que no existe
export function elegirOpcion<V extends VarianteElegible>(variantes: V[], actual: V, clave: Clave, valor: string) {
  const candidatas = variantes.filter((v) => v.enStock && v.opciones[clave] === valor);
  if (!candidatas.length) return actual;
  return candidatas.reduce((mejor, v) => (comparteResto(v, actual, clave) > comparteResto(mejor, actual, clave) ? v : mejor));
}

// elegida: la actual · compatible: existe con el resto de la selección · cambia: existe, pero
// cambia otras opciones · agotada: ninguna variante con stock la tiene (no se puede elegir)
export function estadoOpcion(variantes: VarianteElegible[], actual: VarianteElegible, clave: Clave, valor: string) {
  if (actual.opciones[clave] === valor) return "elegida";
  const conStock = variantes.filter((v) => v.enStock && v.opciones[clave] === valor);
  if (!conStock.length) return "agotada";
  const total = CLAVES.filter((k) => k !== clave && actual.opciones[k] !== undefined).length;
  return conStock.some((v) => comparteResto(v, actual, clave) === total) ? "compatible" : "cambia";
}
