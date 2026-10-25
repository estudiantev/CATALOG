// Estructura de las páginas internas del panel (todas menos /admin/login).
// Aquí irá el sidebar de shadcn: npx shadcn@latest add sidebar
export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh">
      <header className="border-b px-6 py-4 font-semibold">
        Panel de administración
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
