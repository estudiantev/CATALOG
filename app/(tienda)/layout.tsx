import type { Metadata } from "next";
import { Jost, Playfair_Display } from "next/font/google";
import { ConfigurarAmplify } from "@/components/compartido/configurar-amplify";
import { Encabezado } from "@/components/tienda/encabezado";
import { Pie } from "@/components/tienda/pie";
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

export const metadata: Metadata = {
  title: {
    default: "FARA Collections",
    template: "%s · FARA Collections",
  },
  description: "Alquiler y venta de vestidos en Tacna",
};

// Layout raíz de la tienda: tiene su propio <html> y su propio CSS (sin shadcn)
export default function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${jost.variable} ${playfair.variable}`}>
      <body className="antialiased">
        <ConfigurarAmplify />
        <Encabezado />
        <main id="contenido">{children}</main>
        <Pie />
      </body>
    </html>
  );
}
