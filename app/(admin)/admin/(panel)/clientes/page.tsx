import type { Metadata } from "next";
import { TablaClientes } from "@/components/admin/tabla-clientes";
import { requerirStaff } from "@/lib/sesion-servidor";

export const metadata: Metadata = {
  title: "Clientes",
};

export default async function ClientesPage() {
  // Solo ADMIN: la regla de Customer en amplify/data/resource.ts también lo exige
  await requerirStaff("verClientes");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <p className="text-sm text-muted-foreground">
          Cuentas registradas en la tienda, con correo o con Google.
        </p>
      </div>
      <TablaClientes />
    </div>
  );
}
