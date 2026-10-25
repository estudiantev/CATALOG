import type { Metadata } from "next";
import { FormularioIngresoAdmin } from "@/components/admin/formulario-ingreso-admin";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

// Login del staff: sin opción de registro (las cuentas las crea un ADMIN desde Equipo)
export default function AdminLoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted p-6">
      <FormularioIngresoAdmin />
    </main>
  );
}
