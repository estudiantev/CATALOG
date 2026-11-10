"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { DatosSeccion } from "@/lib/contenido";
import { esStaff } from "@/lib/permisos";
import { nombreOpcion } from "@/lib/productos";
import { enlaceCuenta } from "@/lib/redireccion";
import { Anuncios } from "./anuncios";
import { COLORES } from "./datos";
import { cajaNav, opcionIcono, opcionNav } from "./estilos-inicio";
import { useSesion } from "./use-sesion";

const enlaceMega =
  "inline-flex items-center gap-2.5 min-h-8 text-[14px] leading-[20px] tracking-[0.08em] uppercase hover:underline hover:decoration-2 hover:underline-offset-[6px]";
const tituloMega = "font-archivo text-[13px] leading-[18px] font-semibold tracking-[0.16em] uppercase";
const tituloMovil = "pt-1 pb-1 pl-9 font-archivo text-[11px] leading-[16px] font-semibold tracking-[0.16em] text-[#666666] uppercase";
// El catálogo de vestidos con esa ocasión ya elegida en los filtros
const enlaceOcasion = (ocasion: string) => `/catalogo?ocasion=${encodeURIComponent(ocasion)}`;
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
  ocasiones,
  tallas,
}: {
  anuncios: DatosSeccion["anuncios"] | null;
  // Las de los vestidos con stock (lib/catalogo.ts): el menú solo ofrece lo que hay
  ocasiones: string[];
  tallas: string[];
}) {
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [submenuMovilAbierto, setSubmenuMovilAbierto] = useState(true);
  const contenedor = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  // Mientras se revisa (undefined) el ícono lleva al login, que igual redirige si ya hay sesión
  const sesion = useSesion();
  const staff = Boolean(sesion && esStaff(sesion.grupos));

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
      {/* 50 px de alto más una línea gris muy suave abajo */}
      <header className="flex h-[51px] items-center gap-2 border-b border-[#f0f0f0] bg-white px-[15px] menu:gap-11">
        <Link href="/" aria-label="FARA collections, inicio" onClick={cerrarMenus} className="flex flex-none items-center transition-opacity duration-150 hover:opacity-70">
          <Image src="/logo-fara.svg" alt="" width={722} height={341} priority className="h-12 w-auto" />
        </Link>

        <nav aria-label="Principal" className="hidden min-w-0 flex-auto menu:flex">
          <ul className="flex items-center gap-[21px]">
            <li>
              <button
                type="button"
                aria-expanded={catalogoAbierto}
                aria-controls="menu-catalogo"
                onClick={() => setCatalogoAbierto((abierto) => !abierto)}
                className={`${opcionNav} cursor-pointer gap-1.5 aria-expanded:underline aria-expanded:underline-offset-3`}
              >
                Catálogo
                <Chevron arriba={catalogoAbierto} />
              </button>
            </li>
            <li>
              <Link href="/colecciones" onClick={cerrarMenus} className={opcionNav}>
                Colecciones
              </Link>
            </li>
            <li>
              <a href="#contacto" onClick={cerrarMenus} className={opcionNav}>
                Contacto
              </a>
            </li>
            <li>
              <Link href="/catalogo?categoria=accesorios" onClick={cerrarMenus} className={opcionNav}>
                Accesorios
              </Link>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex flex-none items-center gap-1.5 menu:gap-[21px]">
          <button type="button" aria-label="Buscar" className={`${opcionIcono} cursor-pointer menu:w-8`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M20 20l-4.2-4.2" />
            </svg>
          </button>
          <a href="#" aria-label="Favoritos" className={opcionIcono}>
            <svg className="menu:hidden" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
            </svg>
            <span aria-hidden="true" className="hidden menu:inline">
              Favoritos
            </span>
          </a>
          {/* Solo para el staff. Es un atajo: /admin igual revisa la sesión en el servidor. Hasta
              1100 px va solo el ícono, para que entre junto al nombre sin tapar el menú. */}
          {staff && (
            <Link href="/admin" aria-label="Panel de administración" title="Panel de administración" onClick={cerrarMenus} className={opcionIcono}>
              <svg className="min-[1100px]:hidden" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="9" />
                <rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" />
                <rect x="3" y="16" width="7" height="5" />
              </svg>
              <span aria-hidden="true" className="hidden min-[1100px]:inline">
                Panel
              </span>
            </Link>
          )}
          {/* Con sesión lleva a Mi cuenta y lo marca: el nombre en escritorio, un punto en el celular.
              Sin sesión, el login recuerda esta página para volver aquí después de entrar. */}
          <Link
            href={sesion ? "/cuenta" : enlaceCuenta("/login", pathname)}
            aria-label={sesion ? (sesion.nombre ? `Mi cuenta, ${sesion.nombre}` : "Mi cuenta") : "Ingresar"}
            onClick={cerrarMenus}
            className={`${opcionIcono} relative`}
          >
            <svg className="menu:hidden" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c1.6-4 4.6-6 8-6s6.4 2 8 6" />
            </svg>
            {sesion && <span aria-hidden="true" className="absolute top-1 right-1 size-2.5 rounded-full border-2 border-white bg-acento2 menu:hidden" />}
            <span aria-hidden="true" className={`hidden truncate menu:block ${staff ? "max-w-[8ch] min-[1100px]:max-w-[14ch]" : "max-w-[14ch]"}`}>
              {sesion ? sesion.nombre || "Mi cuenta" : "Ingresar"}
            </span>
          </Link>
          <button
            type="button"
            aria-label={menuMovilAbierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuMovilAbierto}
            aria-controls="menu-movil"
            onClick={() => setMenuMovilAbierto((abierto) => !abierto)}
            className={`${opcionIcono} cursor-pointer menu:hidden`}
          >
            {menuMovilAbierto ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Menú desplegable de Catálogo (escritorio): ocasiones, tallas y colores */}
      {catalogoAbierto && (
        <div id="menu-catalogo" className="absolute inset-x-0 top-full hidden bg-white px-[clamp(16px,3.6vw,54px)] pt-12 pb-14 menu:block">
          <div className="flex flex-wrap items-start gap-x-[clamp(56px,8vw,120px)] gap-y-10">
            {ocasiones.length > 0 && (
              <section aria-labelledby="col-ocasiones" className="flex flex-none flex-col gap-5">
                <h2 id="col-ocasiones" className={tituloMega}>Ocasiones</h2>
                <ul className="flex flex-col gap-0.5">
                  {ocasiones.map((ocasion) => (
                    <li key={ocasion}>
                      <Link href={enlaceOcasion(ocasion)} onClick={cerrarMenus} className={enlaceMega}>{ocasion}</Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/catalogo" onClick={cerrarMenus} className={enlaceMega}>Ver todo el catálogo</Link>
                  </li>
                </ul>
              </section>
            )}
            {tallas.length > 0 && (
              <section aria-labelledby="col-tallas" className="flex flex-none flex-col gap-5">
                <h2 id="col-tallas" className={tituloMega}>Tallas</h2>
                <ul className="flex max-w-[15rem] flex-wrap gap-1.5">
                  {tallas.map((talla) => (
                    <li key={talla}>
                      <Link href={`/catalogo?talla=${talla}`} onClick={cerrarMenus} className={`${cajaNav} min-w-11 justify-center`}>
                        {nombreOpcion("talla", talla)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section aria-labelledby="col-color" className="flex flex-none flex-col gap-5">
              <h2 id="col-color" className={tituloMega}>Colores</h2>
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
        <nav id="menu-movil" aria-label="Menú principal" className="absolute inset-x-0 top-full h-[calc(100dvh-var(--alto-marco))] overflow-y-auto overscroll-contain bg-white pt-3 pb-6 menu:hidden">
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
                <div id="sub-catalogo" className="flex flex-col gap-4 pb-3">
                  {ocasiones.length > 0 && (
                    <section aria-labelledby="movil-ocasiones">
                      <h2 id="movil-ocasiones" className={tituloMovil}>Ocasiones</h2>
                      <ul>
                        {ocasiones.map((ocasion) => (
                          <li key={ocasion}>
                            <Link href={enlaceOcasion(ocasion)} onClick={cerrarMenus} className={`${filaMovil} min-h-11 pr-5 pl-9 text-[14px] leading-[20px] tracking-[0.08em] uppercase`}>
                              <span className={`${etiquetaMovil} py-1`}>{ocasion}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  {tallas.length > 0 && (
                    <section aria-labelledby="movil-tallas">
                      <h2 id="movil-tallas" className={tituloMovil}>Tallas</h2>
                      <ul className="flex flex-wrap gap-1.5 pt-1.5 pr-5 pl-9">
                        {tallas.map((talla) => (
                          <li key={talla}>
                            <Link href={`/catalogo?talla=${talla}`} onClick={cerrarMenus} className={`${cajaNav} min-w-11 justify-center`}>
                              {nombreOpcion("talla", talla)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  <section aria-labelledby="movil-colores">
                    <h2 id="movil-colores" className={tituloMovil}>Colores</h2>
                    <ul>
                      {COLORES.map((color) => (
                        <li key={color.href}>
                          <Link href={color.href} onClick={cerrarMenus} className={`${filaMovil} min-h-11 gap-2.5 pr-5 pl-9 text-[14px] leading-[20px] tracking-[0.08em] uppercase`}>
                            <span aria-hidden="true" className="size-3 flex-none border border-tinta" style={{ background: color.hex }} />
                            <span className={`${etiquetaMovil} py-1`}>{color.nombre}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <Link href="/catalogo" onClick={cerrarMenus} className={`${filaMovil} min-h-11 pr-5 pl-9 text-[14px] leading-[20px] font-medium tracking-[0.08em] uppercase`}>
                    <span className={`${etiquetaMovil} py-1`}>Ver todo el catálogo</span>
                  </Link>
                </div>
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
