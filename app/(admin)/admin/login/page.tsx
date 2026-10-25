import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

// Página temporal: aquí irá el login del staff (SIN opción de registro)
export default function AdminLoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-2 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-xl font-semibold">Panel de administración</h1>
        <p className="text-sm text-muted-foreground">
          Formulario de inicio de sesión en construcción.
        </p>
      </div>
    </main>
  );
}
