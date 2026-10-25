"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ALQUILER, COLECCIONES, COLORES } from "./datos";

const etiquetaNav =
  "relative inline-flex items-center gap-2 py-1.5 text-[15px] leading-[20px] font-medium tracking-[0.1em] uppercase after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-tinta after:opacity-0 group-hover:after:opacity-100 group-aria-expanded:after:opacity-100 group-focus-visible:outline-2 group-focus-visible:outline-offset-6 group-focus-visible:outline-tinta";
const enlaceMega =
  "inline-flex items-center gap-2.5 min-h-8 text-[14px] leading-[20px] tracking-[0.08em] uppercase hover:underline hover:decoration-2 hover:underline-offset-[6px]";
const icono =
  "flex size-11 menu:size-12 items-center justify-center transition-colors hover:bg-durazno active:bg-champan";
const tituloMega = "text-[13px] leading-[18px] font-semibold tracking-[0.16em] uppercase";
const filaMovil =
  "group flex w-full items-center active:bg-durazno focus-visible:outline-offset-[-6px]";
const etiquetaMovil =
  "relative inline-flex after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-tinta after:opacity-0 group-hover:after:opacity-100 group-aria-expanded:after:opacity-100";

function Chevron({ arriba }: { arriba: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={arriba ? "rotate-180" : undefined}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function Encabezado() {
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [submenuMovilAbierto, setSubmenuMovilAbierto] = useState(true);
  const contenedor = useRef<HTMLDivElement>(null);

  const cerrarMenus = () => {
    setCatalogoAbierto(false);
    setMenuMovilAbierto(false);
  };

  // Escape o un clic fuera del encabezado cierran los menús
  useEffect(() => {
    if (!catalogoAbierto && !menuMovilAbierto) return;
    const alPresionar = (e: KeyboardEvent) => e.key === "Escape" && cerrarMenus();
    const alHacerClic = (e: MouseEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) cerrarMenus();
    };
    document.addEventListener("keydown", alPresionar);
    document.addEventListener("mousedown", alHacerClic);
    return () => {
      document.removeEventListener("keydown", alPresionar);
      document.removeEventListener("mousedown", alHacerClic);
    };
  }, [catalogoAbierto, menuMovilAbierto]);

  return (
    <div ref={contenedor} className="relative z-30 bg-white">
      <a href="#contenido" className="absolute left-4 -top-30 z-20 bg-tinta px-4.5 py-3 font-semibold text-white focus:top-3">
        Saltar al contenido
      </a>
      <header className="border-2 border-tinta bg-white">
        <p className="border-b-2 border-tinta bg-champan px-3 py-[9px] text-center text-[11px] leading-[16px] font-semibold tracking-[0.05em] text-carbon uppercase menu:px-4 menu:py-[11px] menu:text-[13px] menu:leading-[18px] menu:tracking-[0.14em]">
          Alquila tu vestido de gala o de XV en Tacna
        </p>
        <div className="flex min-h-[clamp(64px,6.7vw,96px)] items-stretch">
          <Link href="/" aria-label="FARA collections, inicio" onClick={cerrarMenus} className="flex flex-auto items-center px-4 focus-visible:outline-offset-[-8px] menu:flex-none menu:px-[clamp(16px,3.6vw,54px)]">
            <Image src="/logo-fara.svg" alt="" width={722} height={341} priority className="h-[clamp(40px,4vw,58px)] w-auto" />
          </Link>

          <nav aria-label="Principal" className="hidden min-w-0 flex-auto menu:flex">
            <ul className="flex items-stretch gap-[clamp(24px,3vw,44px)] pl-[clamp(8px,2.2vw,32px)]">
              <li className="flex">
                <button
                  type="button"
                  aria-expanded={catalogoAbierto}
                  aria-controls="menu-catalogo"
                  onClick={() => setCatalogoAbierto((abierto) => !abierto)}
                  className="group flex cursor-pointer items-center focus-visible:outline-none"
                >
                  <span className={etiquetaNav}>
                    Catálogo
                    <Chevron arriba={catalogoAbierto} />
                  </span>
                </button>
              </li>
              <li className="flex">
                <a href="#contacto" onClick={cerrarMenus} className="group flex items-center focus-visible:outline-none">
                  <span className={etiquetaNav}>Contacto</span>
                </a>
              </li>
              <li className="flex">
                <Link href="/catalogo?categoria=accesorios" onClick={cerrarMenus} className="group flex items-center focus-visible:outline-none">
                  <span className={etiquetaNav}>Accesorios</span>
                </Link>
              </li>
            </ul>
          </nav>

          <div className="ml-auto flex flex-none items-center gap-0.5 px-2 menu:gap-[clamp(2px,0.6vw,8px)] menu:px-[clamp(8px,2.4vw,36px)]">
            <button type="button" aria-label="Buscar" className={`${icono} cursor-pointer`}>
              <svg className="size-[22px] menu:h-[31px] menu:w-[34px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M20 20l-4.2-4.2" />
              </svg>
            </button>
            <a href="#" aria-label="Favoritos" className={icono}>
              <svg className="size-[22px] menu:h-8 menu:w-[33px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />
              </svg>
            </a>
            <Link href="/login" aria-label="Mi cuenta" onClick={cerrarMenus} className={icono}>
              <svg className="size-[22px] menu:size-[35px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c1.6-4 4.6-6 8-6s6.4 2 8 6" />
              </svg>
            </Link>
            <button
              type="button"
              aria-label={menuMovilAbierto ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuMovilAbierto}
              aria-controls="menu-movil"
              onClick={() => setMenuMovilAbierto((abierto) => !abierto)}
              className={`${icono} cursor-pointer menu:hidden`}
            >
              {menuMovilAbierto ? (
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Menú desplegable de Catálogo (escritorio) */}
      {catalogoAbierto && (
        <div id="menu-catalogo" className="absolute inset-x-0 top-full hidden border-2 border-t-0 border-tinta bg-white px-[clamp(16px,3.6vw,54px)] pt-12 pb-14 menu:block">
          <div className="flex flex-wrap items-start gap-x-[clamp(56px,8vw,120px)] gap-y-10">
            <section aria-labelledby="col-colecciones" className="flex flex-none flex-col gap-5">
              <h2 id="col-colecciones" className={tituloMega}>Colecciones</h2>
              <ul className="flex flex-col gap-0.5">
                {COLECCIONES.map((coleccion) => (
                  <li key={coleccion.href}>
                    <Link href={coleccion.href} onClick={cerrarMenus} className={enlaceMega}>{coleccion.nombre}</Link>
                  </li>
                ))}
                <li>
                  <Link href="/catalogo" onClick={cerrarMenus} className={enlaceMega}>Ver todo</Link>
                </li>
              </ul>
            </section>
            <section aria-labelledby="col-alquiler" className="flex flex-none flex-col gap-5">
              <h2 id="col-alquiler" className={tituloMega}>En alquiler</h2>
              <ul className="flex flex-col gap-0.5">
                {ALQUILER.map((opcion) => (
                  <li key={opcion.href}>
                    <Link href={opcion.href} onClick={cerrarMenus} className={enlaceMega}>{opcion.nombre}</Link>
                  </li>
                ))}
                <li>
                  <Link href="/catalogo?modalidad=alquiler" onClick={cerrarMenus} className={enlaceMega}>Ver todo</Link>
                </li>
              </ul>
            </section>
            <section aria-labelledby="col-color" className="flex flex-none flex-col gap-5">
              <h2 id="col-color" className={tituloMega}>Por color</h2>
              <ul className="grid grid-flow-col grid-rows-[repeat(5,auto)] auto-cols-max gap-x-12 gap-y-0.5">
                {COLORES.map((color) => (
                  <li key={color.href}>
                    <Link href={color.href} onClick={cerrarMenus} className={enlaceMega}>
                      <span aria-hidden="true" className="size-3 flex-none border border-tinta" style={{ background: color.hex }} />
                      {color.nombre}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}

      {/* Menú móvil */}
      {menuMovilAbierto && (
        <nav id="menu-movil" aria-label="Menú principal" className="absolute inset-x-0 top-full min-h-svh border-2 border-t-0 border-tinta bg-white pt-3 pb-6 menu:hidden">
          <ul>
            <li>
              <button
                type="button"
                aria-expanded={submenuMovilAbierto}
                aria-controls="sub-catalogo"
                onClick={() => setSubmenuMovilAbierto((abierto) => !abierto)}
                className={`${filaMovil} h-14 cursor-pointer justify-between px-5`}
              >
                <span className={`${etiquetaMovil} py-1.5 text-[15px] leading-[20px] font-medium tracking-[0.1em] uppercase`}>Catálogo</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={submenuMovilAbierto ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"} />
                </svg>
              </button>
              {submenuMovilAbierto && (
                <ul id="sub-catalogo" className="pb-2">
                  {[...COLECCIONES, { nombre: "Ver todo", href: "/catalogo" }].map((coleccion) => (
                    <li key={coleccion.href}>
                      <Link href={coleccion.href} onClick={cerrarMenus} className={`${filaMovil} min-h-11 pr-5 pl-9 text-[14px] leading-[20px] tracking-[0.08em] uppercase`}>
                        <span className={`${etiquetaMovil} py-1`}>{coleccion.nombre}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li>
              <a href="#contacto" onClick={cerrarMenus} className={`${filaMovil} h-14 px-5`}>
                <span className={`${etiquetaMovil} py-1.5 text-[15px] leading-[20px] font-medium tracking-[0.1em] uppercase`}>Contacto</span>
              </a>
            </li>
            <li>
              <Link href="/catalogo?categoria=accesorios" onClick={cerrarMenus} className={`${filaMovil} h-14 px-5`}>
                <span className={`${etiquetaMovil} py-1.5 text-[15px] leading-[20px] font-medium tracking-[0.1em] uppercase`}>Accesorios</span>
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
