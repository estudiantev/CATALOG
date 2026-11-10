import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Catalogo } from "@/components/tienda/catalogo";
import { RutaNavegacion } from "@/components/tienda/ruta-navegacion";
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
    return (
      <p className="bg-white px-4 py-24 text-center font-cuerpo text-[18px] text-tinta">No pudimos cargar esta colección. Inténtalo de nuevo en unos minutos.</p>
    );
  }
  if (!pagina) notFound();

  const { titulo, descripcion, foto, productos } = pagina;
  const ruta = [{ nombre: "Inicio", href: "/" }, { nombre: "Colecciones", href: "/colecciones" }, { nombre: titulo }];
  // La foto de la colección, su nombre y su descripción, entre la ruta y los filtros
  const portada = (
    <>
      {foto && (
        <div className="relative h-[clamp(200px,30vw,420px)] bg-[#f3f3f3]">
          <Image src={foto.url} alt="" fill unoptimized priority sizes="100vw" className="object-cover" />
        </div>
      )}
      <div className="px-[clamp(16px,3vw,32px)] pt-10 pb-8">
        <h1 className="text-[clamp(32px,2.8vw,42px)] leading-[1.1] font-medium tracking-[-0.01em] [overflow-wrap:anywhere]">{titulo}</h1>
        {descripcion && <p className="mt-3 max-w-[70ch] text-[16px] leading-[1.5] whitespace-pre-line text-[#555555]">{descripcion}</p>}
      </div>
    </>
  );

  if (!productos.length) {
    return (
      <div className="bg-white font-cuerpo text-[15px] text-tinta">
        <RutaNavegacion pasos={ruta} />
        {portada}
        <p className="px-6 py-24 text-center text-[18px]">Por ahora no hay productos disponibles en esta colección.</p>
      </div>
    );
  }
  // key: al pasar a otra colección desde el menú, los filtros vuelven a empezar
  return <Catalogo key={slug} productos={productos} ruta={ruta} encabezado={portada} />;
}
