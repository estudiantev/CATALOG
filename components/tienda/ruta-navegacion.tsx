import Link from "next/link";
import type { ReactNode } from "react";

const enlace = "text-[#555555] underline underline-offset-2 transition-colors duration-150 hover:text-acento";

// "Inicio / Catálogo / Vestidos / Vestido satinado". El último paso, sin enlace, es la página actual.
// `children` va a la derecha en la misma barra (en el catálogo, Todo / Comprar / Alquilar).
// `sinLinea`: sin la línea de abajo, cuando lo que sigue es el título de la misma página (Mi cuenta).
export function RutaNavegacion({
  pasos,
  sinLinea = false,
  children,
}: {
  pasos: { nombre: string; href?: string }[];
  sinLinea?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 px-[clamp(16px,3vw,32px)] text-[13px] text-[#555555] ${sinLinea ? "" : "border-b border-tinta"} ${children ? "py-2.5" : "py-3"}`}
    >
      <nav aria-label="Ruta de navegación" className="min-w-0">
        <ol className="flex flex-wrap gap-2">
          {pasos.map((paso, i) => (
            <li key={`${i}-${paso.nombre}`} className="flex min-w-0 gap-2">
              {paso.href ? (
                <Link href={paso.href} className={enlace}>
                  {paso.nombre}
                </Link>
              ) : (
                <span aria-current="page" className="text-tinta [overflow-wrap:anywhere]">
                  {paso.nombre}
                </span>
              )}
              {i < pasos.length - 1 && <span aria-hidden="true">/</span>}
            </li>
          ))}
        </ol>
      </nav>
      {children}
    </div>
  );
}
