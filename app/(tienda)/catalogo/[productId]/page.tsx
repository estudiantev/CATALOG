import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WHATSAPP_FARA } from "@/components/tienda/datos";
import { GaleriaProducto } from "@/components/tienda/galeria-producto";
import { type ProductoDetalle, obtenerProducto } from "@/lib/catalogo";
import { CATEGORIAS, TALLAS, formatoSoles } from "@/lib/productos";

// Las fotos usan URLs firmadas de S3 que vencen: la página se genera en cada visita
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ productId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  const producto = await obtenerProducto(productId).catch(() => null);
  return { title: producto?.nombre ?? "Producto" };
}

// Abre WhatsApp con un mensaje que ya menciona el producto
function enlaceWhatsapp(nombre: string) {
  const parametros = new URLSearchParams({
    text: `Hola, quisiera consultar sobre ${nombre} en Fara Collection.`,
    username: WHATSAPP_FARA,
    type: "username",
    app_absent: "0",
  });
  return `https://api.whatsapp.com/send/?${parametros}`;
}

const etiqueta = "text-[12px] leading-[18px] font-semibold tracking-[0.1em] text-topo uppercase";

export default async function ProductoPage({ params }: Props) {
  const { productId } = await params;

  let producto: ProductoDetalle | null;
  try {
    producto = await obtenerProducto(productId);
  } catch (error) {
    console.error("No se pudo cargar el producto:", error);
    return (
      <p className="px-4 py-24 text-center text-[18px]">
        No pudimos cargar este producto. Inténtalo de nuevo en unos minutos.
      </p>
    );
  }
  if (!producto) notFound();

  const categoria = CATEGORIAS.find((c) => c.valor === producto.categoria)?.nombre;
  const atributos = [
    { nombre: "Ocasión", valor: producto.ocasion },
    { nombre: "Silueta", valor: producto.silueta },
    { nombre: "Material", valor: producto.material },
  ].filter((a) => a.valor);

  return (
    <article className="mx-auto grid max-w-[1300px] gap-x-[75px] gap-y-10 px-4 pt-[clamp(40px,5vw,94px)] pb-[clamp(56px,6vw,96px)] md:grid-cols-[minmax(0,450px)_minmax(0,1fr)]">
      <GaleriaProducto imagenes={producto.imagenes} />

      <div className="flex flex-col items-start">
        {categoria && <span className={etiqueta}>{categoria}</span>}
        <h1 className="mt-2 font-titulo text-[clamp(44px,5vw,72px)] leading-[1.05] text-tinta">{producto.nombre}</h1>
        {producto.descripcion && (
          <p className="mt-6 max-w-[620px] text-[20px] leading-[30px] text-grafito">{producto.descripcion}</p>
        )}

        <div className="mt-8 flex flex-col gap-1 text-[24px] leading-[32px]">
          <p>Precio de venta: {formatoSoles.format(producto.precioVenta)}</p>
          <p>Precio de alquiler: {formatoSoles.format(producto.precioAlquiler)}</p>
        </div>

        <a
          href={enlaceWhatsapp(producto.nombre)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex h-[60px] items-center justify-center rounded-lg bg-tinta px-11 text-[18px] font-semibold tracking-[0.04em] text-white uppercase transition-colors hover:bg-grafito"
        >
          Contactar
        </a>

        {(atributos.length > 0 || producto.tallas.length > 0 || producto.colores.length > 0 || producto.etiquetas.length > 0) && (
          <dl className="mt-12 grid w-full max-w-[620px] grid-cols-[minmax(0,130px)_minmax(0,1fr)] gap-x-6 gap-y-4 border-t border-arena pt-8 text-[17px]">
            {atributos.map((atributo) => (
              <div key={atributo.nombre} className="contents">
                <dt className={`${etiqueta} pt-0.5`}>{atributo.nombre}</dt>
                <dd>{atributo.valor}</dd>
              </div>
            ))}
            {producto.tallas.length > 0 && (
              <div className="contents">
                <dt className={`${etiqueta} pt-1.5`}>Tallas</dt>
                <dd className="flex flex-wrap gap-2">
                  {producto.tallas.map((talla) => (
                    <span key={talla} className="border border-tinta px-3 py-1 text-[14px]">
                      {TALLAS.find((t) => t.valor === talla)?.nombre ?? talla}
                    </span>
                  ))}
                </dd>
              </div>
            )}
            {producto.colores.length > 0 && (
              <div className="contents">
                <dt className={`${etiqueta} pt-0.5`}>Colores</dt>
                <dd className="flex flex-wrap gap-x-5 gap-y-2">
                  {producto.colores.map((color) => (
                    <span key={color.nombre} className="inline-flex items-center gap-2">
                      <span aria-hidden="true" className="size-4 border border-tinta" style={{ background: color.hex ?? "transparent" }} />
                      {color.nombre}
                    </span>
                  ))}
                </dd>
              </div>
            )}
            {producto.etiquetas.length > 0 && (
              <div className="contents">
                <dt className={`${etiqueta} pt-0.5`}>Etiquetas</dt>
                <dd>{producto.etiquetas.join(", ")}</dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </article>
  );
}
