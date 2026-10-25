import Link from "next/link";
import { Button } from "@/components/admin/ui/button";

// Página temporal: aquí irá el dashboard
export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">
        Aquí verás el resumen del catálogo.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Ver la tienda</Link>
      </Button>
    </div>
  );
}
