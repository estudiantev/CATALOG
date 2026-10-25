import { MenuLateral } from "@/components/admin/menu-lateral";
import { Separator } from "@/components/admin/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/admin/ui/sidebar";
import { requerirStaff } from "@/lib/sesion-servidor";

// Estructura de las páginas internas del panel (todas menos /admin/login).
// Verifica en el servidor que la cuenta sea del staff, además del middleware.
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await requerirStaff();

  return (
    <SidebarProvider>
      <MenuLateral correo={sesion.correo} grupos={sesion.grupos} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <span className="font-medium">Panel de administración</span>
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
