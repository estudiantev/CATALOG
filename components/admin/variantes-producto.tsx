"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Copy, ImageIcon, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { getUrl, remove } from "aws-amplify/storage";
import { recalcularResumen } from "@/app/(admin)/admin/(panel)/productos/acciones";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { cargarVariantes, clienteDatos, mensajeErrorDatos } from "@/components/admin/datos";
import { CLAVES, NOMBRES_CLAVE, type Producto, type Variante, formatoSoles, nombreOpcion, opcionesDeVariante } from "@/lib/productos";
import { fotosOrdenadas } from "@/lib/variantes";

// Rutas de S3 que usan las variantes (grande y liviana)
export const rutasEnUso = (variantes: Variante[]) =>
  new Set(variantes.flatMap((v) => fotosOrdenadas(v.images).flatMap((f) => [f.key, f.thumbKey ?? f.key])));

export function VariantesProducto({
  productId,
  puedeCrear,
  puedeEliminar,
  nuevo,
}: {
  productId: string;
  puedeCrear: boolean;
  puedeEliminar: boolean;
  nuevo: boolean;
}) {
  const [datos, setDatos] = useState<{ producto: Producto; variantes: Variante[] } | null>(null);
  const [portadas, setPortadas] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [trabajando, setTrabajando] = useState(false);

  const cargar = useCallback(async () => {
    const cargado = await cargarVariantes(productId);
    if (!cargado) throw new Error("No encontramos este producto.");
    setDatos(cargado);
    const pares = await Promise.all(
      cargado.variantes.map(async (v) => {
        const portada = fotosOrdenadas(v.images)[0];
        if (!portada) return null;
        const url = await getUrl({ path: portada.thumbKey ?? portada.key }).then(({ url }) => url.toString(), () => null);
        return url ? ([v.id, url] as const) : null;
      }),
    );
    setPortadas(Object.fromEntries(pares.filter((p) => p !== null)));
  }, [productId]);

  useEffect(() => {
    cargar().catch((err: Error) => setError(err.message));
  }, [cargar]);

  // RF-15: después de cada cambio el resumen del catálogo se recalcula desde las variantes
  async function actualizarResumen() {
    const resultado = await recalcularResumen(productId).catch(
      (err: Error): { ok: false; error: string } => ({ ok: false, error: err.message }),
    );
    if (!resultado.ok) setError(`Las variantes se guardaron, pero no se pudo actualizar el catálogo: ${resultado.error}`);
    return resultado.ok;
  }

  async function eliminar(variante: Variante) {
    if (!datos) return;
    setError("");
    setAviso("");
    setTrabajando(true);
    const { errors } = await clienteDatos.models.ProductVariant.delete({ id: variante.id });
    if (errors?.length) {
      setTrabajando(false);
      return setError(mensajeErrorDatos(errors));
    }
    // Solo ADMIN elimina variantes, y ADMIN puede borrar en S3 las fotos que ya nadie usa
    const restantes = datos.variantes.filter((v) => v.id !== variante.id);
    const enUso = rutasEnUso(restantes);
    const propias = rutasEnUso([variante]);
    await Promise.allSettled(Array.from(propias).filter((r) => !enUso.has(r)).map((path) => remove({ path })));
    if (await actualizarResumen()) setAviso("Variante eliminada y catálogo actualizado.");
    await cargar().catch((err: Error) => setError(err.message));
    setTrabajando(false);
  }

  async function recalcular() {
    setError("");
    setAviso("");
    setTrabajando(true);
    if (await actualizarResumen()) setAviso("Resumen del catálogo actualizado.");
    await cargar().catch((err: Error) => setError(err.message));
    setTrabajando(false);
  }

  const conStock = datos?.variantes.filter((v) => (v.stock ?? 0) > 0).length ?? 0;
  // Solo se muestran las columnas de las opciones que este producto usa
  const claves = CLAVES.filter((clave) => datos?.variantes.some((v) => opcionesDeVariante(v)[clave]));

  return (
    <Card className="max-w-6xl">
      <CardHeader className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <CardTitle>Variantes</CardTitle>
          <CardDescription>
            Cada combinación con su precio, stock y fotos. La de menor posición es la que se ve sin filtros.
          </CardDescription>
          {datos && datos.variantes.length > 0 && (
            <p className="text-sm">
              En el catálogo: desde {formatoSoles.format(datos.producto.priceSale)} · alquiler desde{" "}
              {formatoSoles.format(datos.producto.priceRent)} por día · {datos.variantes.length} variantes, {conStock} con stock
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={trabajando} onClick={recalcular}>
            <RefreshCw />
            Actualizar resumen
          </Button>
          {puedeCrear && (
            <Button asChild>
              <Link href={`/admin/productos/${productId}/variantes/nueva`}>
                <Plus />
                Nueva variante
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {nuevo && datos?.variantes.length === 0 && (
          <Alert>
            <AlertDescription>
              Producto creado. Agrega al menos una variante con stock para que aparezca en el catálogo.
            </AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {aviso && (
          <Alert>
            <AlertDescription>{aviso}</AlertDescription>
          </Alert>
        )}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead className="w-14">Portada</TableHead>
                {claves.map((clave) => (
                  <TableHead key={clave}>{NOMBRES_CLAVE[clave]}</TableHead>
                ))}
                <TableHead className="text-right">Venta</TableHead>
                <TableHead className="text-right">Alquiler/día</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="w-28 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!datos && !error && (
                <TableRow>
                  <TableCell colSpan={6 + claves.length}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              )}
              {datos?.variantes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6 + claves.length} className="py-10 text-center text-muted-foreground">
                    Este producto todavía no tiene variantes.
                  </TableCell>
                </TableRow>
              )}
              {datos?.variantes.map((variante) => {
                const opciones = opcionesDeVariante(variante);
                return (
                  <TableRow key={variante.id}>
                    <TableCell className="text-muted-foreground">{variante.position ?? "—"}</TableCell>
                    <TableCell>
                      <div className="relative flex h-14 w-11 items-center justify-center overflow-hidden rounded-sm border bg-muted">
                        {portadas[variante.id] ? (
                          <Image src={portadas[variante.id]} alt="" fill unoptimized sizes="44px" className="object-cover" />
                        ) : (
                          <ImageIcon className="size-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    {claves.map((clave) => (
                      <TableCell key={clave}>
                        {clave === "color" && opciones.color ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="size-3 rounded-full border" style={{ background: variante.colorHex ?? "transparent" }} />
                            {variante.colorName || nombreOpcion("color", opciones.color)}
                          </span>
                        ) : opciones[clave] ? (
                          nombreOpcion(clave, opciones[clave])
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">{formatoSoles.format(variante.priceSale)}</TableCell>
                    <TableCell className="text-right">{formatoSoles.format(variante.priceRent)}</TableCell>
                    <TableCell className="text-right">
                      {(variante.stock ?? 0) > 0 ? variante.stock : <Badge variant="secondary">Agotada</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon-sm" aria-label={`Editar variante ${variante.position ?? ""}`}>
                          <Link href={`/admin/productos/${productId}/variantes/${variante.id}`}>
                            <Pencil />
                          </Link>
                        </Button>
                        {puedeCrear && (
                          <Button asChild variant="ghost" size="icon-sm" aria-label={`Duplicar variante ${variante.position ?? ""}`}>
                            <Link href={`/admin/productos/${productId}/variantes/nueva?desde=${variante.id}`}>
                              <Copy />
                            </Link>
                          </Button>
                        )}
                        {puedeEliminar && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon-sm" disabled={trabajando} aria-label={`Eliminar variante ${variante.position ?? ""}`}>
                                <Trash2 className="text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar esta variante?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se eliminará la combinación y las fotos que ninguna otra variante use. Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction variant="destructive" onClick={() => eliminar(variante)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
