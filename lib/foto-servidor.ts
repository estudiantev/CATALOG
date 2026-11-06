import { getUrl } from "aws-amplify/storage/server";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";
import type { Imagen } from "@/lib/contenido";

// Las URLs firmadas de las fotos duran 1 hora y se generan en cada visita
const VIGENCIA_URL = 60 * 60;

// Fotos de ambiente: el texto que las acompaña dice lo importante, así que van con alt=""
export type FotoAmbiente = { url: string };

// Una foto que no se puede firmar se trata como si no hubiera foto: se ve la ilustración
export async function firmarFoto(imagen: Imagen | null): Promise<FotoAmbiente | null> {
  if (!imagen) return null;
  const url = await runWithAmplifyServerContext({
    nextServerContext: null,
    operation: (contextSpec) =>
      getUrl(contextSpec, { path: imagen.key, options: { expiresIn: VIGENCIA_URL } }).then(
        ({ url }) => url.toString(),
        () => null,
      ),
  });
  return url ? { url } : null;
}
