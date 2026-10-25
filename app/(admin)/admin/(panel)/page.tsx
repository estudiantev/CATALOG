import { redirect } from "next/navigation";

// /admin abre directamente la gestión de productos
export default function PanelPage() {
  redirect("/admin/productos");
}
