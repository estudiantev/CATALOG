import type { Metadata } from "next";
import { RutaNavegacion } from "@/components/tienda/ruta-navegacion";
import { TarjetaColeccion } from "@/components/tienda/tarjeta-coleccion";
import { leerColeccionesPublicadas } from "@/lib/colecciones-servidor";

export const metadata: Metadata = {
  title: "Colecciones",
};

// Las fotos usan URLs firmadas de S3 que vencen: la página se genera en cada visita.
// Así también respeta las fechas de inicio y fin de cada colección.
export const dynamic = "force-dynamic";

const TAMANOS = "(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw";

// Las colecciones publicadas en /admin/colecciones, en su orden. Cada una lleva a su página
// (/coleccion/…), no al catálogo.
export default async function ColeccionesPage() {
  const colecciones = await leerColeccionesPublicadas();

  return (
    <div className="bg-white font-cuerpo text-[15px] text-tinta">
      <RutaNavegacion pasos={[{ nombre: "Inicio", href: "/" }, { nombre: "Colecciones" }]} />
      <div className="px-[clamp(16px,3vw,32px)] pt-1 pb-6">
        <h1 className="text-[clamp(24px,2vw,28px)] leading-[1.15] font-medium tracking-[-0.01em]">Colecciones</h1>
        <p className="mt-1.5 text-[15px] text-[#555555]">Elige la colección para tu próximo evento.</p>
      </div>
      {colecciones.length ? (
        <ul aria-label="Colecciones" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {colecciones.map((coleccion) => (
            <li key={coleccion.href}>
              <TarjetaColeccion {...coleccion} sizes={TAMANOS} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-6 py-24 text-center text-[18px]">Por ahora no hay colecciones publicadas.</p>
      )}
    </div>
  );
}
