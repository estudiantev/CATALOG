import Link from "next/link";
import type { ReactNode } from "react";

const enlace = "text-[#555555] underline underline-offset-2 transition-colors duration-150 hover:text-acento";

// "Inicio / Catálogo / Vestidos / Vestido satinado". El último paso, sin enlace, es la página actual.
// Sola, sin la barra: el catálogo la pone dentro de su barra de filtros en pantallas anchas.
// `unaLinea`: no baja de línea; si no entra, el último paso termina en "…".
export function Ruta({ pasos, unaLinea = false }: { pasos: { nombre: string; href?: string }[]; unaLinea?: boolean }) {
  return (
    <nav aria-label="Ruta de navegación" className="min-w-0">
      <ol className={`flex gap-2 ${unaLinea ? "whitespace-nowrap" : "flex-wrap"}`}>
        {pasos.map((paso, i) => (
          <li key={`${i}-${paso.nombre}`} className="flex min-w-0 gap-2">
            {paso.href ? (
              <Link href={paso.href} className={enlace}>
                {paso.nombre}
              </Link>
            ) : (
              <span aria-current="page" className={`text-tinta ${unaLinea ? "truncate" : "[overflow-wrap:anywhere]"}`}>
                {paso.nombre}
              </span>
            )}
            {i < pasos.length - 1 && <span aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// La ruta en su barra. `children` va a la derecha en la misma barra (en el catálogo, Todo /
// Comprar / Alquilar); `className` se suma a la barra.
export function RutaNavegacion({
  pasos,
  children,
  className = "",
}: {
  pasos: { nombre: string; href?: string }[];
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 px-[clamp(16px,3vw,32px)] text-[13px] text-[#555555] ${children ? "py-2.5" : "py-3"} ${className}`}
    >
      <Ruta pasos={pasos} />
      {children}
    </div>
  );
}
