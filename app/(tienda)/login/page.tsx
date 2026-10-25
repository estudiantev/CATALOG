import type { Metadata } from "next";
import { FormularioIngreso } from "@/components/tienda/formulario-ingreso";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return (
    <div className="px-4 py-10">
      <div className="mx-auto flex max-w-260 items-stretch gap-8 border border-tinta bg-white p-4 sm:px-8 sm:py-8">
        <div className="flex flex-1 justify-center">
          <FormularioIngreso />
        </div>
        <div aria-hidden="true" className="hidden w-px bg-tinta md:block" />
        {/* Espacio para una foto de la colección */}
        <div aria-hidden="true" className="hidden flex-1 bg-lino md:block" />
      </div>
    </div>
  );
}
