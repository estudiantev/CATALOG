import type { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/data";
import type { Schema } from "@/amplify/data/resource";
import { resumenDeVariantes } from "@/lib/variantes";

type ClienteServidor = ReturnType<typeof generateServerClientUsingCookies<Schema>>;

// AP-09 + AP-11: lee todas las variantes del producto (Query al índice por productId,
// paginando) y guarda en Product su resumen. Así el resumen siempre sale de ProductVariant
// y nunca se edita a mano.
export async function guardarResumen(cliente: ClienteServidor, productId: string) {
  const variantes = [];
  let nextToken: string | null | undefined;
  do {
    const respuesta = await cliente.models.ProductVariant.listVariantsByProduct({ productId }, { limit: 100, nextToken });
    if (respuesta.errors?.length) throw new Error(respuesta.errors[0].message);
    variantes.push(...respuesta.data);
    nextToken = respuesta.nextToken;
  } while (nextToken);

  // update falla si el producto ya no existe (AppSync verifica que exista)
  const { data, errors } = await cliente.models.Product.update({
    productId,
    ...resumenDeVariantes(variantes),
  });
  if (errors?.length) throw new Error(errors[0].message);
  if (!data) throw new Error("No encontramos el producto.");
  return variantes.length;
}
