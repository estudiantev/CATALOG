"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import { LogOut, Package, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/admin/ui/sidebar";
import { NOMBRES_GRUPO } from "@/components/admin/datos";
import { puede } from "@/lib/permisos";

export function MenuLateral({ correo, grupos }: { correo: string; grupos: string[] }) {
  const pathname = usePathname();
  const router = useRouter();

  const opciones = [
    { titulo: "Productos", href: "/admin/productos", icono: Package, visible: true },
    // Solo ADMIN puede agregar staff (la mutación agregarStaff lo exige)
    { titulo: "Equipo", href: "/admin/equipo", icono: Users, visible: puede(grupos, "agregarStaff") },
  ];

  async function cerrarSesion() {
    await signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <span className="text-lg font-semibold tracking-wide">FARA</span>
        <span className="text-xs text-muted-foreground">Panel de administración</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestión</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {opciones
                .filter((opcion) => opcion.visible)
                .map((opcion) => (
                  <SidebarMenuItem key={opcion.href}>
                    <SidebarMenuButton asChild isActive={pathname.startsWith(opcion.href)}>
                      <Link href={opcion.href}>
                        <opcion.icono />
                        <span>{opcion.titulo}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 text-xs">
          <p className="truncate font-medium">{correo}</p>
          <p className="text-muted-foreground">
            {grupos.map((grupo) => NOMBRES_GRUPO[grupo] ?? grupo).join(", ")}
          </p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={cerrarSesion}>
              <LogOut />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
