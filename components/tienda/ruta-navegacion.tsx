import Link from "next/link";

const enlace = "text-[#555555] underline underline-offset-2 transition-colors duration-150 hover:text-acento";

// "Inicio / Catálogo / Vestidos / Vestido satinado". El último paso, sin enlace, es la página actual.
export function RutaNavegacion({ pasos }: { pasos: { nombre: string; href?: string }[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="border-b border-tinta px-[clamp(16px,3vw,32px)] py-3 text-[13px] text-[#555555]">
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
  );
}
