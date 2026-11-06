import type { Metadata } from "next";
import { TarjetaColeccion, TarjetaOcasion } from "@/components/tienda/tarjeta-coleccion";
import { leerColeccionesPublicadas } from "@/lib/colecciones-servidor";
import { leerOcasiones } from "@/lib/contenido-servidor";

export const metadata: Metadata = {
  title: "Colecciones",
};

// Las fotos usan URLs firmadas de S3 que vencen: la página se genera en cada visita.
// Así también respeta las fechas de inicio y fin de cada colección.
export const dynamic = "force-dynamic";

const TAMANOS = "(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw";

// Bordes en cada tarjeta: con gap sobre un fondo oscuro, la última fila incompleta dejaría un hueco negro
const celda = "border-b border-tinta sm:border-r";

// Como en el menú: primero las fijas y después las publicadas en /admin/colecciones
export default async function ColeccionesPage() {
  const [ocasiones, colecciones] = await Promise.all([leerOcasiones(), leerColeccionesPublicadas()]);

  return (
    <section className="pt-[clamp(40px,4.4vw,64px)]">
      <div className="px-[clamp(16px,3.6vw,54px)] pb-6">
        <h1 className="text-[clamp(24px,2vw,30px)] leading-[1.2] font-medium tracking-[0.08em] uppercase">Colecciones</h1>
        <p className="mt-1 text-topo">Elige la colección para tu próximo evento.</p>
      </div>
      <ul aria-label="Colecciones" className="grid grid-cols-1 border-t-2 border-tinta sm:grid-cols-2 xl:grid-cols-3">
        {ocasiones.map(({ clave, ocasion }) => (
          <li key={clave} className={celda}>
            <TarjetaOcasion clave={clave} ocasion={ocasion} sizes={TAMANOS} />
          </li>
        ))}
        {colecciones.map((coleccion) => (
          <li key={coleccion.href} className={celda}>
            <TarjetaColeccion {...coleccion} sizes={TAMANOS} />
          </li>
        ))}
      </ul>
    </section>
  );
}
