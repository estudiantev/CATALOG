import Link from "next/link";
import { botonVerde, letraContorno } from "@/components/tienda/estilos-inicio";

export default function ProductoNoEncontrado() {
  return (
    <section className="flex flex-col items-center gap-4 bg-white px-6 py-24 text-center font-cuerpo text-tinta">
      <h1 className={`${letraContorno} text-[clamp(32px,4.4vw,54px)] leading-[1.14]!`}>Producto no disponible</h1>
      <p className="text-[15px] leading-[1.55] text-[#444444]">Este producto no existe o ya no está en el catálogo.</p>
      <Link href="/catalogo" className={`${botonVerde} mt-2`}>
        Ver el catálogo
      </Link>
    </section>
  );
}
