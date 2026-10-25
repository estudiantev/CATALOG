import type { Metadata } from "next";
import { ConfigurarAmplify } from "@/components/compartido/configurar-amplify";
import "./tienda.css";

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
    <html lang="es">
      <body className="antialiased">
        <ConfigurarAmplify />
        {children}
      </body>
    </html>
  );
}
