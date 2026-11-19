import type { Metadata } from "next";
import { Archivo, DM_Mono, DM_Sans, Instrument_Serif, Jost, Playfair_Display } from "next/font/google";
import { ConfigurarAmplify } from "@/components/compartido/configurar-amplify";
import { Encabezado } from "@/components/tienda/encabezado";
import { Pie } from "@/components/tienda/pie";
import { RetornoGoogle } from "@/components/tienda/retorno-google";
import { ANCHOS_MENU, escalonMenu, rutaCategoria } from "@/lib/categorias";
import { leerCategorias } from "@/lib/categorias-servidor";
import { leerContenidoMarco } from "@/lib/contenido-servidor";
import "./tienda.css";

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-playfair",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

// Las etiquetas de los productos destacados del inicio
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-mono",
});

// Con el eje de ancho: los títulos usan la versión expandida
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo-ancho",
});

export const metadata: Metadata = {
  title: {
    default: "FARA Collections",
    template: "%s · FARA Collections",
  },
  description: "Alquiler y venta de vestidos en Tacna",
};

// Layout raíz de la tienda: tiene su propio <html> y su propio CSS (sin shadcn).
// Los anuncios y el pie se editan en /admin/contenido; las categorías del menú, en /admin/categorias;
// las colecciones, en /admin/colecciones.
export default async function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ninguno de los dos lee los vestidos: el menú se arma con las categorías
  const [{ anuncios, pie }, categorias] = await Promise.all([leerContenidoMarco(), leerCategorias()]);
  const enlaces = categorias.map((c) => ({ nombre: c.nombre, href: rutaCategoria(c.slug), enMenu: c.enMenu }));
  const categoriasMenu = enlaces.filter((c) => c.enMenu);
  // El panel no deja guardar nombres que no entran ni en el último escalón; si llegan igual, va el último
  const escalon = escalonMenu(categoriasMenu.map((c) => c.nombre));

  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${jost.variable} ${playfair.variable} ${instrument.variable} ${dmSans.variable} ${dmMono.variable} ${archivo.variable}`}
    >
      <body className="antialiased">
        <ConfigurarAmplify />
        <RetornoGoogle />
        <Encabezado
          anuncios={anuncios}
          categoriasCatalogo={enlaces}
          categorias={categoriasMenu}
          escalonMenu={escalon === -1 ? ANCHOS_MENU.length - 1 : escalon}
        />
        <main id="contenido">{children}</main>
        <Pie contenido={pie} />
      </body>
    </html>
  );
}
