// Mi cuenta y Mi perfil: fondo blanco y la letra del resto de la tienda. Desde 1024 px ocupan
// justo la pantalla debajo del encabezado (los paneles se estiran hasta abajo).
export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col bg-white font-cuerpo text-[15px] text-tinta lg:min-h-[calc(100svh-var(--alto-marco))]">{children}</div>;
}
