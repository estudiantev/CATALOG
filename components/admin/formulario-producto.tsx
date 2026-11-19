"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { invalidarCatalogo } from "@/app/(admin)/admin/(panel)/productos/acciones";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Checkbox } from "@/components/admin/ui/checkbox";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { Textarea } from "@/components/admin/ui/textarea";
import { cargarCategorias, clienteDatos, mensajeErrorDatos } from "@/components/admin/datos";
import { type Categoria, TIPO_VESTIDO } from "@/lib/categorias";
import type { Producto } from "@/lib/productos";

// Datos generales del producto. Precios, tallas, colores y fotos van en sus variantes,
// y el resumen que usa el catálogo se recalcula desde ellas.
type Formulario = {
  name: string;
  categories: string[]; // los códigos de sus categorías (lib/categorias.ts); puede no tener ninguna
  description: string;
  brand: string;
  designer: string;
  occasion: string;
  material: string;
  tags: string;
};

const VACIO: Formulario = {
  name: "",
  categories: [],
  description: "",
  brand: "",
  designer: "",
  occasion: "",
  material: "",
  tags: "",
};

const desdeProducto = (p: Producto): Formulario => ({
  name: p.name,
  categories: (p.categories ?? []).filter((c): c is string => Boolean(c)),
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
  // Las de la tabla Category, que se crean en el panel, en Categorías
  const [categorias, setCategorias] = useState<Categoria[] | null>(null);
  const [error, setError] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarCategorias()
      .then(setCategorias)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "No se pudieron cargar las categorías. Recarga la página."));
  }, []);

  useEffect(() => {
    if (!productId) return;
    clienteDatos.models.Product.get({ productId }).then(({ data, errors }) => {
      if (errors?.length) return setError(mensajeErrorDatos(errors));
      if (!data) return setError("No encontramos este producto.");
      setForm(desdeProducto(data));
    });
  }, [productId]);

  if (!form || !categorias) {
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
    if (!form || !categorias) return;
    setError("");
    if (!form.name.trim()) return setError("Escribe el nombre del producto.");

    const datos = {
      name: form.name.trim(),
      // Solo las que existen, en el orden de la lista: una eliminada mientras tanto no queda guardada
      categories: categorias.filter((c) => form.categories.includes(c.codigo)).map((c) => c.codigo),
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
        await clienteDatos.models.Product.create({ productId: nuevoId, category: TIPO_VESTIDO, ...datos, priceSale: 0, priceRent: 0, variantSummary: "[]" });
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
          {/* Puede estar en varias, o en ninguna: igual sale en /vestidos */}
          <fieldset className="space-y-3 sm:col-span-2">
            <legend className="text-sm leading-none font-medium">Categorías</legend>
            <p className="text-sm text-muted-foreground">Marca todas las que le quedan: sale en la página de cada una.</p>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {categorias.map((c) => {
                const id = `categoria-${c.codigo}`;
                return (
                  <div key={c.codigo} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={form.categories.includes(c.codigo)}
                      onCheckedChange={(marcada) =>
                        cambiar("categories", marcada === true ? [...form.categories, c.codigo] : form.categories.filter((codigo) => codigo !== c.codigo))
                      }
                    />
                    <Label htmlFor={id} className="font-normal">
                      {c.nombre}
                    </Label>
                  </div>
                );
              })}
            </div>
          </fieldset>
          <div className="space-y-2">
            <Label htmlFor="occasion">Ocasión</Label>
            <Input id="occasion" placeholder="Gala, XV, cóctel…" value={form.occasion} onChange={(e) => cambiar("occasion", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="material">Material</Label>
            <Input id="material" value={form.material} onChange={(e) => cambiar("material", e.target.value)} />
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
          <div className="space-y-2 sm:col-span-2">
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
