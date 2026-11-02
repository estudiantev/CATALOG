"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { invalidarCatalogo } from "@/app/(admin)/admin/(panel)/productos/acciones";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { Textarea } from "@/components/admin/ui/textarea";
import { clienteDatos, mensajeErrorDatos } from "@/components/admin/datos";
import { CATEGORIAS, type Categoria, type Producto } from "@/lib/productos";

// Datos generales del producto. Precios, tallas, colores y fotos van en sus variantes,
// y el resumen que usa el catálogo se recalcula desde ellas.
type Formulario = {
  name: string;
  category: Categoria | "";
  description: string;
  brand: string;
  designer: string;
  occasion: string;
  material: string;
  tags: string;
};

const VACIO: Formulario = {
  name: "",
  category: "",
  description: "",
  brand: "",
  designer: "",
  occasion: "",
  material: "",
  tags: "",
};

const desdeProducto = (p: Producto): Formulario => ({
  name: p.name,
  category: (CATEGORIAS.find((c) => c.valor === p.category)?.valor ?? "") as Categoria | "",
  description: p.description ?? "",
  brand: p.brand ?? "",
  designer: p.designer ?? "",
  occasion: p.occasion ?? "",
  material: p.material ?? "",
  tags: (p.tags ?? []).filter(Boolean).join(", "),
});

// Texto vacío → null, para que AppSync borre el valor al editar
const textoONulo = (valor: string) => valor.trim() || null;

export function FormularioProducto({ productId }: { productId?: string }) {
  const router = useRouter();
  const editando = productId !== undefined;
  const [form, setForm] = useState<Formulario | null>(editando ? null : VACIO);
  const [error, setError] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!productId) return;
    clienteDatos.models.Product.get({ productId }).then(({ data, errors }) => {
      if (errors?.length) return setError(mensajeErrorDatos(errors));
      if (!data) return setError("No encontramos este producto.");
      setForm(desdeProducto(data));
    });
  }, [productId]);

  if (!form) {
    return error ? (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    ) : (
      <Skeleton className="h-96 w-full max-w-3xl" />
    );
  }

  const cambiar = <K extends keyof Formulario>(campo: K, valor: Formulario[K]) => {
    setGuardado(false);
    setForm({ ...form, [campo]: valor });
  };

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form) return;
    setError("");
    if (!form.name.trim()) return setError("Escribe el nombre del producto.");
    if (!form.category) return setError("Elige una categoría.");

    const datos = {
      name: form.name.trim(),
      category: form.category,
      description: textoONulo(form.description),
      brand: textoONulo(form.brand),
      designer: textoONulo(form.designer),
      occasion: textoONulo(form.occasion),
      material: textoONulo(form.material),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    setGuardando(true);
    const nuevoId = crypto.randomUUID();
    const { errors } = productId
      ? await clienteDatos.models.Product.update({ productId, ...datos })
      : // Sin variantes todavía: no aparece en el catálogo hasta que tenga al menos una con stock
        await clienteDatos.models.Product.create({ productId: nuevoId, ...datos, priceSale: 0, priceRent: 0, variantSummary: "[]" });
    if (errors?.length) {
      setGuardando(false);
      return setError(mensajeErrorDatos(errors));
    }
    // Si falla, el catálogo igual se actualiza solo en 10 minutos
    await invalidarCatalogo().catch(() => {});
    setGuardando(false);

    if (productId) {
      setGuardado(true);
      router.refresh();
    } else {
      // Al crear, se sigue con sus variantes
      router.push(`/admin/productos/${nuevoId}?nuevo=1`);
    }
  }

  return (
    <form onSubmit={guardar} noValidate className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos generales</CardTitle>
          <CardDescription>
            Precios, tallas, colores, stock y fotos se cargan en cada variante.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={form.name} onChange={(e) => cambiar("name", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={form.category} onValueChange={(valor) => cambiar("category", valor as Categoria)}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Elige una categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map((c) => (
                  <SelectItem key={c.valor} value={c.valor}>{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="occasion">Ocasión</Label>
            <Input id="occasion" placeholder="Gala, XV, cóctel…" value={form.occasion} onChange={(e) => cambiar("occasion", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Marca</Label>
            <Input id="brand" value={form.brand} onChange={(e) => cambiar("brand", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="designer">Diseñador</Label>
            <Input id="designer" value={form.designer} onChange={(e) => cambiar("designer", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" value={form.description} onChange={(e) => cambiar("description", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="material">Material</Label>
            <Input id="material" value={form.material} onChange={(e) => cambiar("material", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Características</Label>
            <Input id="tags" placeholder="Separadas por comas: brillos, cola, pedrería" value={form.tags} onChange={(e) => cambiar("tags", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {guardado && (
        <Alert>
          <AlertDescription>Cambios guardados.</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : editando ? "Guardar datos generales" : "Crear y agregar variantes"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/productos">Volver</Link>
        </Button>
      </div>
    </form>
  );
}
