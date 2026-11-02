"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ImageIcon, Pencil, Trash2 } from "lucide-react";
import { getUrl, remove } from "aws-amplify/storage";
import { invalidarCatalogo } from "@/app/(admin)/admin/(panel)/productos/acciones";
import { rutasEnUso } from "@/components/admin/variantes-producto";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/admin/ui/alert-dialog";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Skeleton } from "@/components/admin/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import { cargarProductos, cargarVariantes, clienteDatos, mensajeErrorDatos } from "@/components/admin/datos";
import { CATEGORIAS, type Producto, formatoSoles, leerJson } from "@/lib/productos";
import type { ResumenVariante } from "@/lib/variantes";

const resumenDe = (producto: Producto) => leerJson<ResumenVariante[]>(producto.variantSummary, []);

// Portada de la primera variante (la que se ve en el catálogo sin filtros), en su versión liviana
async function cargarMiniaturas(productos: Producto[]) {
  const pares = await Promise.all(
    productos.map(async (producto) => {
      const portada = resumenDe(producto).find((v) => v.cover)?.cover;
      if (!portada) return null;
      try {
        const { url } = await getUrl({ path: portada });
        return [producto.productId, url.toString()] as const;
      } catch {
        return null;
      }
    }),
  );
  return Object.fromEntries(pares.filter((par) => par !== null));
}

export function TablaProductos({
  puedeEditar,
  puedeEliminar,
}: {
  puedeEditar: boolean;
  puedeEliminar: boolean;
}) {
  const [productos, setProductos] = useState<Producto[] | null>(null);
  const [miniaturas, setMiniaturas] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    cargarProductos()
      .then((cargados) => {
        setProductos(cargados);
        return cargarMiniaturas(cargados).then(setMiniaturas);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  // Elimina primero sus variantes, después el producto y al final sus fotos de S3.
  // Solo ADMIN elimina, y ADMIN también puede borrar en S3.
  async function eliminar(producto: Producto) {
    setError("");
    try {
      const cargado = await cargarVariantes(producto.productId);
      const variantes = cargado?.variantes ?? [];
      for (const variante of variantes) {
        const { errors } = await clienteDatos.models.ProductVariant.delete({ id: variante.id });
        if (errors?.length) throw new Error(mensajeErrorDatos(errors));
      }
      const { errors } = await clienteDatos.models.Product.delete({ productId: producto.productId });
      if (errors?.length) throw new Error(mensajeErrorDatos(errors));
      setProductos((actuales) => actuales?.filter((p) => p.productId !== producto.productId) ?? null);
      await Promise.allSettled(Array.from(rutasEnUso(variantes)).map((path) => remove({ path })));
      await invalidarCatalogo().catch(() => {}); // si falla, la caché vence sola en 10 minutos
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el producto.");
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Foto</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Venta desde</TableHead>
              <TableHead className="text-right">Alquiler/día desde</TableHead>
              <TableHead>Variantes</TableHead>
              <TableHead className="w-24 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productos === null && !error &&
              [0, 1, 2].map((i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {productos?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Todavía no hay productos.
                </TableCell>
              </TableRow>
            )}
            {productos?.map((producto) => (
              <TableRow key={producto.productId}>
                <TableCell>
                  <div className="relative flex h-14 w-11 items-center justify-center overflow-hidden rounded-sm border bg-muted">
                    {miniaturas[producto.productId] ? (
                      <Image src={miniaturas[producto.productId]} alt="" fill unoptimized sizes="44px" className="object-cover" />
                    ) : (
                      <ImageIcon className="size-4 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{producto.name}</TableCell>
                <TableCell>
                  {CATEGORIAS.find((c) => c.valor === producto.category)?.nombre ?? "—"}
                </TableCell>
                <TableCell className="text-right">{formatoSoles.format(producto.priceSale)}</TableCell>
                <TableCell className="text-right">{formatoSoles.format(producto.priceRent)}</TableCell>
                <TableCell>
                  {(() => {
                    const resumen = resumenDe(producto);
                    const conStock = resumen.filter((v) => v.inStock).length;
                    if (!resumen.length) return <Badge variant="secondary">Sin variantes</Badge>;
                    return (
                      <span className="text-sm">
                        {resumen.length} · {conStock ? `${conStock} con stock` : <Badge variant="secondary">Agotado</Badge>}
                      </span>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    {puedeEditar && (
                      <Button asChild variant="ghost" size="icon-sm" aria-label={`Editar ${producto.name}`}>
                        <Link href={`/admin/productos/${producto.productId}`}>
                          <Pencil />
                        </Link>
                      </Button>
                    )}
                    {puedeEliminar && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Eliminar ${producto.name}`}>
                            <Trash2 className="text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Se eliminarán «{producto.name}», todas sus variantes y sus fotos. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction variant="destructive" onClick={() => eliminar(producto)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
