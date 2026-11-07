"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { DatosSeccion } from "@/lib/contenido";
import { enlaceCuenta } from "@/lib/redireccion";
import { Anuncios } from "./anuncios";
import { ALQUILER, COLECCIONES, COLORES } from "./datos";
import { cajaIconoAzul, cajaIconoBlanca, cajaNav } from "./estilos-inicio";
import { useSesion } from "./use-sesion";

const enlaceMega =
  "inline-flex items-center gap-2.5 min-h-8 text-[14px] leading-[20px] tracking-[0.08em] uppercase hover:underline hover:decoration-2 hover:underline-offset-[6px]";
const tituloMega = "font-archivo text-[13px] leading-[18px] font-semibold tracking-[0.16em] uppercase";
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

export function Encabezado({
  anuncios,
  colecciones,
}: {
  anuncios: DatosSeccion["anuncios"] | null;
  colecciones: { nombre: string; href: string }[]; // las publicadas en /admin/colecciones
}) {
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [submenuMovilAbierto, setSubmenuMovilAbierto] = useState(true);
  const contenedor = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  // Mientras se revisa (undefined) el ícono lleva al login, que igual redirige si ya hay sesión
  const sesion = useSesion();

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

  // Un anuncio largo hace crecer el marco: la página y el menú móvil se calculan con su alto real
  useEffect(() => {
    const marco = contenedor.current;
    if (!marco) return;
    const observador = new ResizeObserver(() => {
      document.documentElement.style.setProperty("--alto-marco", `${marco.offsetHeight}px`);
    });
    observador.observe(marco);
    return () => observador.disconnect();
  }, []);

  return (
    <div ref={contenedor} id="marco" className="relative z-30 bg-white font-cuerpo">
      <a href="#contenido" className="absolute left-4 -top-30 z-20 bg-tinta px-4.5 py-3 font-semibold text-white focus:top-3">
        Saltar al contenido
      </a>
      {anuncios && <Anuncios {...anuncios} />}
      <header className="flex h-14 items-center gap-2 border-b border-tinta bg-white px-4">
        <Link href="/" aria-label="FARA collections, inicio" onClick={cerrarMenus} className={`${cajaNav} group flex-none py-1 hover:[&_img]:brightness-0 hover:[&_img]:invert`}>
          <Image src="/logo-fara.svg" alt="" width={722} height={341} priority className="h-6 w-auto" />
        </Link>

        <nav aria-label="Principal" className="ml-[clamp(0px,4vw,56px)] hidden min-w-0 flex-auto menu:flex">
          <ul className="flex items-center gap-2">
            <li>
              <button
                type="button"
                aria-expanded={catalogoAbierto}
                aria-controls="menu-catalogo"
                onClick={() => setCatalogoAbierto((abierto) => !abierto)}
                className={`${cajaNav} cursor-pointer gap-2 aria-expanded:border-acento aria-expanded:bg-acento aria-expanded:text-white`}
              >
                Catálogo
                <Chevron arriba={catalogoAbierto} />
              </button>
            </li>
            <li>
              <Link href="/colecciones" onClick={cerrarMenus} className={cajaNav}>
                Colecciones
              </Link>
            </li>
            <li>
              <a href="#contacto" onClick={cerrarMenus} className={cajaNav}>
                Contacto
              </a>
            </li>
            <li>
              <Link href="/catalogo?categoria=accesorios" onClick={cerrarMenus} className={cajaNav}>
                Accesorios
              </Link>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex flex-none items-center gap-1.5 menu:gap-2">
          <button type="button" aria-label="Buscar" className={`${cajaIconoBlanca} cursor-pointer`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M20 20l-4.2-4.2" />
            </svg>
          </button>
          <a href="#" aria-label="Favoritos" className={cajaIconoBlanca}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
            </svg>
            <span aria-hidden="true" className="hidden menu:inline">
              Favoritos
            </span>
          </a>
          {/* Con sesión lleva a Mi cuenta y lo marca: el nombre en escritorio, un punto en el celular.
              Sin sesión, el login recuerda esta página para volver aquí después de entrar. */}
          <Link
            href={sesion ? "/cuenta" : enlaceCuenta("/login", pathname)}
            aria-label={sesion ? (sesion.nombre ? `Mi cuenta, ${sesion.nombre}` : "Mi cuenta") : "Ingresar"}
            onClick={cerrarMenus}
            className={`${cajaIconoAzul} relative`}
          >
            <svg className="menu:hidden" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c1.6-4 4.6-6 8-6s6.4 2 8 6" />
            </svg>
            {sesion && <span aria-hidden="true" className="absolute top-1 right-1 size-2.5 rounded-full border-2 border-white bg-acento2 menu:hidden" />}
            <span aria-hidden="true" className="hidden max-w-[14ch] truncate menu:block">
              {sesion ? sesion.nombre || "Mi cuenta" : "Ingresar"}
            </span>
          </Link>
          <button
            type="button"
            aria-label={menuMovilAbierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuMovilAbierto}
            aria-controls="menu-movil"
            onClick={() => setMenuMovilAbierto((abierto) => !abierto)}
            className={`${cajaIconoBlanca} cursor-pointer menu:hidden`}
          >
            {menuMovilAbierto ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Menú desplegable de Catálogo (escritorio) */}
      {catalogoAbierto && (
        <div id="menu-catalogo" className="absolute inset-x-0 top-full hidden border-b border-tinta bg-white px-[clamp(16px,3.6vw,54px)] pt-12 pb-14 menu:block">
          <div className="flex flex-wrap items-start gap-x-[clamp(56px,8vw,120px)] gap-y-10">
            <section aria-labelledby="col-colecciones" className="flex flex-none flex-col gap-5">
              <h2 id="col-colecciones" className={tituloMega}>Colecciones</h2>
              <ul className="flex flex-col gap-0.5">
                {[...COLECCIONES, ...colecciones].map((coleccion) => (
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

      {/* Menú móvil. Tiene su propio scroll: en el inicio el marco queda fijo y, con el celular en
          horizontal, lo de abajo no se alcanzaría moviendo la página. */}
      {menuMovilAbierto && (
        <nav id="menu-movil" aria-label="Menú principal" className="absolute inset-x-0 top-full h-[calc(100dvh-var(--alto-marco))] overflow-y-auto overscroll-contain border-b border-tinta bg-white pt-3 pb-6 menu:hidden">
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
                  {[...COLECCIONES, ...colecciones, { nombre: "Ver todo", href: "/catalogo" }].map((coleccion) => (
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
              <Link href="/colecciones" onClick={cerrarMenus} className={`${filaMovil} h-14 px-5`}>
                <span className={`${etiquetaMovil} py-1.5 text-[15px] leading-[20px] font-medium tracking-[0.1em] uppercase`}>Colecciones</span>
              </Link>
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
