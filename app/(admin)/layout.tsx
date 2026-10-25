import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ConfigurarAmplify } from "@/components/compartido/configurar-amplify";
import "./admin.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Panel · FARA Collections",
    template: "%s · Panel FARA",
  },
  // El panel no debe aparecer en Google
  robots: { index: false, follow: false },
};

// Layout raíz del panel: tiene su propio <html> y su propio CSS (Tailwind + shadcn)
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} font-sans antialiased`}>
      <body>
        <ConfigurarAmplify />
        {children}
      </body>
    </html>
  );
}
