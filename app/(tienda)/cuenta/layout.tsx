// Mi cuenta y Mi perfil: fondo blanco y la letra del resto de la tienda
export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-white font-cuerpo text-[15px] text-tinta">{children}</div>;
}
