import type { Metadata } from "next";
import { Archivo, DM_Sans, Instrument_Serif, Jost, Playfair_Display } from "next/font/google";
import { ConfigurarAmplify } from "@/components/compartido/configurar-amplify";
import { Encabezado } from "@/components/tienda/encabezado";
import { Pie } from "@/components/tienda/pie";
import { RetornoGoogle } from "@/components/tienda/retorno-google";
import { leerOpcionesMenu } from "@/lib/catalogo";
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
// Los anuncios y el pie se editan en /admin/contenido; las colecciones, en /admin/colecciones.
export default async function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ anuncios, pie }, { ocasiones, tallas }] = await Promise.all([leerContenidoMarco(), leerOpcionesMenu()]);

  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${jost.variable} ${playfair.variable} ${instrument.variable} ${dmSans.variable} ${archivo.variable}`}
    >
      <body className="antialiased">
        <ConfigurarAmplify />
        <RetornoGoogle />
        <Encabezado anuncios={anuncios} ocasiones={ocasiones} tallas={tallas} />
        <main id="contenido">{children}</main>
        <Pie contenido={pie} />
      </body>
    </html>
  );
}
