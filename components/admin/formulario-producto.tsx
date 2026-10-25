"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Checkbox } from "@/components/admin/ui/checkbox";
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
import {
  CATEGORIAS,
  type Categoria,
  type ColorProducto,
  FAMILIAS_COLOR,
  type Producto,
  TALLAS,
  type Talla,
  clienteDatos,
  mensajeErrorDatos,
} from "@/components/admin/datos";

type Formulario = {
  name: string;
  category: Categoria | "";
  description: string;
  occasion: string;
  tags: string;
  material: string;
  silhouette: string;
  priceSale: string;
  priceRent: string;
  availableSizes: Talla[];
  availableColors: ColorProducto[];
};

const VACIO: Formulario = {
  name: "",
  category: "",
  description: "",
  occasion: "",
  tags: "",
  material: "",
  silhouette: "",
  priceSale: "",
  priceRent: "",
  availableSizes: [],
  availableColors: [],
};

function desdeProducto(p: Producto): Formulario {
  return {
    name: p.name ?? "",
    category: p.category ?? "",
    description: p.description ?? "",
    occasion: p.occasion ?? "",
    tags: (p.tags ?? []).filter(Boolean).join(", "),
    material: p.material ?? "",
    silhouette: p.silhouette ?? "",
    priceSale: String(p.priceSale),
    priceRent: String(p.priceRent),
    availableSizes: (p.availableSizes ?? []).filter((t): t is Talla => t !== null),
    // Solo los campos del input: AppSync rechaza campos extra como __typename
    availableColors: (p.availableColors ?? [])
      .filter((c): c is ColorProducto => c !== null)
      .map(({ name, hex, family }) => ({ name, hex, family })),
  };
}

// Texto vacío → null, para que AppSync borre el valor al editar
const textoONulo = (valor: string) => valor.trim() || null;

export function FormularioProducto({ productId }: { productId?: string }) {
  const router = useRouter();
  const editando = productId !== undefined;
  const [form, setForm] = useState<Formulario | null>(editando ? null : VACIO);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!productId) return;
    clienteDatos.models.Product.get({ productId }).then(({ data, errors }) => {
      if (errors) setError(mensajeErrorDatos(errors));
      else if (!data) setError("No encontramos este producto.");
      else setForm(desdeProducto(data));
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

  const cambiar = <K extends keyof Formulario>(campo: K, valor: Formulario[K]) =>
    setForm({ ...form, [campo]: valor });

  const cambiarColor = (indice: number, cambios: Partial<ColorProducto>) =>
    cambiar(
      "availableColors",
      form.availableColors.map((color, i) => (i === indice ? { ...color, ...cambios } : color)),
    );

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form) return;
    setError("");

    const priceSale = Number.parseFloat(form.priceSale);
    const priceRent = Number.parseFloat(form.priceRent);
    if (!form.name.trim()) return setError("Escribe el nombre del producto.");
    if (!(priceSale >= 0) || !(priceRent >= 0)) return setError("Escribe precios válidos de venta y alquiler.");
    if (form.availableColors.some((color) => !color.name.trim())) return setError("Cada color necesita un nombre.");

    const datos = {
      name: form.name.trim(),
      category: form.category || null,
      description: textoONulo(form.description),
      occasion: textoONulo(form.occasion),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      material: textoONulo(form.material),
      silhouette: textoONulo(form.silhouette),
      priceSale,
      priceRent,
      availableSizes: form.availableSizes,
      availableColors: form.availableColors.map((color) => ({ ...color, name: color.name.trim() })),
      // Copia plana de las familias para filtrar el catálogo por color
      colorFamilies: Array.from(new Set(form.availableColors.map((color) => color.family))),
    };

    setGuardando(true);
    const { errors } = productId
      ? await clienteDatos.models.Product.update({ productId, ...datos })
      : await clienteDatos.models.Product.create({ productId: crypto.randomUUID(), ...datos });
    setGuardando(false);

    if (errors) return setError(mensajeErrorDatos(errors));
    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <form onSubmit={guardar} noValidate className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información</CardTitle>
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
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" value={form.description} onChange={(e) => cambiar("description", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="material">Material</Label>
            <Input id="material" value={form.material} onChange={(e) => cambiar("material", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="silhouette">Silueta</Label>
            <Input id="silhouette" placeholder="Sirena, princesa…" value={form.silhouette} onChange={(e) => cambiar("silhouette", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="tags">Etiquetas</Label>
            <Input id="tags" placeholder="Separadas por comas: largo, brillos, escote en V" value={form.tags} onChange={(e) => cambiar("tags", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Precios</CardTitle>
          <CardDescription>En soles (S/).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="priceSale">Precio de venta</Label>
            <Input id="priceSale" type="number" min="0" step="0.01" inputMode="decimal" value={form.priceSale} onChange={(e) => cambiar("priceSale", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceRent">Precio de alquiler</Label>
            <Input id="priceRent" type="number" min="0" step="0.01" inputMode="decimal" value={form.priceRent} onChange={(e) => cambiar("priceRent", e.target.value)} required />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tallas disponibles</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-x-6 gap-y-3">
          {TALLAS.map((talla) => (
            <div key={talla.valor} className="flex items-center gap-2">
              <Checkbox
                id={`talla-${talla.valor}`}
                checked={form.availableSizes.includes(talla.valor)}
                onCheckedChange={(marcado) =>
                  cambiar(
                    "availableSizes",
                    marcado
                      ? TALLAS.map((t) => t.valor).filter((t) => t === talla.valor || form.availableSizes.includes(t))
                      : form.availableSizes.filter((t) => t !== talla.valor),
                  )
                }
              />
              <Label htmlFor={`talla-${talla.valor}`}>{talla.nombre}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Colores</CardTitle>
          <CardDescription>La familia agrupa tonos parecidos para los filtros del catálogo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.availableColors.map((color, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3">
              <div className="min-w-40 flex-1 space-y-2">
                <Label htmlFor={`color-nombre-${i}`}>Nombre</Label>
                <Input id={`color-nombre-${i}`} placeholder="Rosa palo" value={color.name} onChange={(e) => cambiarColor(i, { name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`color-hex-${i}`}>Tono</Label>
                <Input id={`color-hex-${i}`} type="color" className="w-16 p-1" value={color.hex ?? "#000000"} onChange={(e) => cambiarColor(i, { hex: e.target.value })} />
              </div>
              <div className="w-40 space-y-2">
                <Label htmlFor={`color-familia-${i}`}>Familia</Label>
                <Select value={color.family} onValueChange={(valor) => cambiarColor(i, { family: valor as ColorProducto["family"] })}>
                  <SelectTrigger id={`color-familia-${i}`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FAMILIAS_COLOR.map((f) => (
                      <SelectItem key={f.valor} value={f.valor}>{f.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Quitar color"
                onClick={() => cambiar("availableColors", form.availableColors.filter((_, j) => j !== i))}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => cambiar("availableColors", [...form.availableColors, { name: "", hex: "#000000", family: "BLACK" }])}
          >
            <Plus />
            Agregar color
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : editando ? "Guardar cambios" : "Crear producto"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/productos">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
