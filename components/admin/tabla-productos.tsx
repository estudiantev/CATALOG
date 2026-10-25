"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ImageIcon, Pencil, Trash2 } from "lucide-react";
import { getUrl, remove } from "aws-amplify/storage";
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
import { clienteDatos, mensajeErrorDatos } from "@/components/admin/datos";
import { CATEGORIAS, type Producto, TALLAS, formatoSoles, imagenPrincipal } from "@/lib/productos";

async function cargarProductos() {
  const productos: Producto[] = [];
  let nextToken: string | null | undefined;
  do {
    const respuesta = await clienteDatos.models.Product.list({ limit: 100, nextToken });
    if (respuesta.errors) throw new Error(mensajeErrorDatos(respuesta.errors));
    productos.push(...respuesta.data);
    nextToken = respuesta.nextToken;
  } while (nextToken);
  return productos.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
}

// URL firmada de la foto principal de cada producto, para la miniatura
async function cargarMiniaturas(productos: Producto[]) {
  const pares = await Promise.all(
    productos.map(async (producto) => {
      const imagen = imagenPrincipal(producto.imagenes);
      if (!imagen) return null;
      try {
        const { url } = await getUrl({ path: imagen.key });
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

  async function eliminar(producto: Producto) {
    setError("");
    const { errors } = await clienteDatos.models.Product.delete({ productId: producto.productId });
    if (errors) {
      setError(mensajeErrorDatos(errors));
      return;
    }
    setProductos((actuales) => actuales?.filter((p) => p.productId !== producto.productId) ?? null);
    // Solo ADMIN elimina productos, y ADMIN también puede borrar sus fotos de S3
    await Promise.allSettled(
      (producto.imagenes ?? []).flatMap((imagen) => (imagen ? [remove({ path: imagen.key })] : [])),
    );
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
              <TableHead className="text-right">Venta</TableHead>
              <TableHead className="text-right">Alquiler</TableHead>
              <TableHead>Tallas</TableHead>
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
                <TableCell className="font-medium">{producto.name || "Sin nombre"}</TableCell>
                <TableCell>
                  {CATEGORIAS.find((c) => c.valor === producto.category)?.nombre ?? "—"}
                </TableCell>
                <TableCell className="text-right">{formatoSoles.format(producto.priceSale)}</TableCell>
                <TableCell className="text-right">{formatoSoles.format(producto.priceRent)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {producto.availableSizes?.map((talla) => (
                      <Badge key={talla} variant="secondary">
                        {TALLAS.find((t) => t.valor === talla)?.nombre ?? talla}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    {puedeEditar && (
                      <Button asChild variant="ghost" size="icon-sm" aria-label={`Editar ${producto.name ?? "producto"}`}>
                        <Link href={`/admin/productos/${producto.productId}`}>
                          <Pencil />
                        </Link>
                      </Button>
                    )}
                    {puedeEliminar && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Eliminar ${producto.name ?? "producto"}`}>
                            <Trash2 className="text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Se eliminará «{producto.name || "Sin nombre"}» del catálogo. Esta acción no se puede deshacer.
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
