import type { Metadata } from "next";
import { FormularioStaff } from "@/components/admin/formulario-staff";
import { requerirStaff } from "@/lib/sesion-servidor";

export const metadata: Metadata = {
  title: "Equipo",
};

export default async function EquipoPage() {
  // Solo ADMIN: la mutación agregarStaff también lo exige en AppSync
  await requerirStaff("agregarStaff");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Equipo</h1>
        <p className="text-sm text-muted-foreground">Da acceso al panel a las personas del staff.</p>
      </div>
      <FormularioStaff />
    </div>
  );
}
