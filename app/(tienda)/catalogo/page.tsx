import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Catálogo",
};

/*
 * Página provisional del catálogo.
 * Plan: leer los productos en el servidor con Amplify Data (Product permite lectura a
 * visitantes) y filtrarlos con los parámetros que ya envía el menú:
 *   ?coleccion=gala|xv|cortos|floreados  ?color=negro|vino|...  ?modalidad=alquiler  ?categoria=accesorios
 * Cada producto tendrá su página en /catalogo/[productId].
 */
export default function CatalogoPage() {
  return (
    <section className="px-[clamp(16px,3.6vw,54px)] py-[clamp(56px,6vw,88px)]">
      <h1 className="text-[clamp(24px,2vw,30px)] leading-[1.2] font-medium tracking-[0.08em] uppercase">
        Nuestro catálogo
      </h1>
      <p className="mt-2 text-topo">Estamos preparando el catálogo. Muy pronto podrás ver todos los vestidos aquí.</p>
      <Link href="/" className="mt-8 inline-flex min-h-13 items-center justify-center border-2 border-tinta bg-white px-7 text-[15px] font-semibold tracking-[0.06em] uppercase transition-colors hover:bg-arena active:bg-dorado">
        Volver al inicio
      </Link>
    </section>
  );
}
