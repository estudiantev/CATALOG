import Link from "next/link";
import type { Boton } from "@/lib/contenido";

// Un enlace escrito en el panel. Las páginas de la tienda navegan sin recargar; las secciones
// (#pasos) y los sitios externos son enlaces comunes.
export function EnlaceContenido({ boton, className }: { boton: Boton; className: string }) {
  return boton.enlace.startsWith("/") ? (
    <Link href={boton.enlace} className={className}>
      {boton.texto}
    </Link>
  ) : (
    <a href={boton.enlace} className={className}>
      {boton.texto}
    </a>
  );
}
