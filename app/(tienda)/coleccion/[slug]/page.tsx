import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Catalogo } from "@/components/tienda/catalogo";
import { leerPaginaColeccion, obtenerColeccion } from "@/lib/colecciones-servidor";

// Las fotos usan URLs firmadas de S3 que vencen: la página se genera en cada visita.
// Así también respeta las fechas de inicio y fin de la colección.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

// seoTitle y seoDescription son para Google y para cuando se comparte el enlace
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const coleccion = await obtenerColeccion(slug).catch(() => null);
  if (!coleccion) return { title: "Colección" };
  const title = coleccion.seoTitle || coleccion.title;
  const description = coleccion.seoDescription || coleccion.description;
  // Sin descripción no se pasa la clave: `undefined` borraría la de la tienda
  if (!description) return { title, openGraph: { title } };
  return { title, description, openGraph: { title, description } };
}

export default async function ColeccionPage({ params }: Props) {
  const { slug } = await params;

  let pagina: Awaited<ReturnType<typeof leerPaginaColeccion>>;
  try {
    pagina = await leerPaginaColeccion(slug);
  } catch (error) {
    console.error("No se pudo cargar la colección:", error);
    return <p className="px-4 py-24 text-center text-[18px]">No pudimos cargar esta colección. Inténtalo de nuevo en unos minutos.</p>;
  }
  if (!pagina) notFound();

  const { titulo, descripcion, foto, productos } = pagina;
  return (
    <section>
      {foto && (
        <div className="relative h-[clamp(200px,30vw,420px)] border-b-2 border-tinta bg-lino">
          <Image src={foto.url} alt="" fill unoptimized priority sizes="100vw" className="object-cover" />
        </div>
      )}
      <div className="px-[clamp(16px,3.6vw,54px)] pt-[clamp(40px,4.4vw,64px)] pb-6">
        <h1 className="text-[clamp(24px,2vw,30px)] leading-[1.2] font-medium tracking-[0.08em] uppercase">{titulo}</h1>
        {descripcion && <p className="mt-1 max-w-[70ch] whitespace-pre-line text-topo">{descripcion}</p>}
      </div>
      {productos.length ? (
        // key: al pasar a otra colección desde el menú, los filtros vuelven a empezar
        <Catalogo key={slug} productos={productos} filtrosIniciales={{ variante: {}, texto: "" }} />
      ) : (
        <p className="border-t-2 border-tinta px-[clamp(16px,3.6vw,54px)] py-16 text-center text-[18px]">Por ahora no hay productos disponibles en esta colección.</p>
      )}
    </section>
  );
}
