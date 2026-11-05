"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { remove } from "aws-amplify/storage";
import { invalidarColecciones } from "@/app/(admin)/admin/(panel)/colecciones/acciones";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { cargarColecciones, mensajeErrorDatos, tablaColecciones } from "@/components/admin/datos";
import { type Coleccion, ESTADOS, estadoColeccion, idsDeColeccion, rutaColeccion } from "@/lib/colecciones";

const COLUMNAS = 5;

export function TablaColecciones() {
  const [colecciones, setColecciones] = useState<Coleccion[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarColecciones()
      .then(setColecciones)
      .catch((err: Error) => setError(err.message));
  }, []);

  async function eliminar(coleccion: Coleccion) {
    setError("");
    try {
      const { errors } = await tablaColecciones().delete({ id: coleccion.id });
      if (errors?.length) throw new Error(mensajeErrorDatos(errors));
      setColecciones((actuales) => actuales?.filter((c) => c.id !== coleccion.id) ?? null);
      if (coleccion.imageKey) await remove({ path: coleccion.imageKey }).catch(() => {});
      await invalidarColecciones().catch(() => {}); // si falla, la caché vence sola en 10 minutos
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la colección.");
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
              <TableHead>Colección</TableHead>
              <TableHead className="text-right">Productos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Posición</TableHead>
              <TableHead className="w-28 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {colecciones === null && !error &&
              [0, 1, 2].map((i) => (
                <TableRow key={i}>
                  <TableCell colSpan={COLUMNAS}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {colecciones?.length === 0 && (
              <TableRow>
                <TableCell colSpan={COLUMNAS} className="py-10 text-center text-muted-foreground">
                  Todavía no hay colecciones.
                </TableCell>
              </TableRow>
            )}
            {colecciones?.map((coleccion) => {
              const estado = estadoColeccion(coleccion);
              return (
                <TableRow key={coleccion.id}>
                  <TableCell>
                    <p className="font-medium">{coleccion.title}</p>
                    <p className="text-xs text-muted-foreground">{rutaColeccion(coleccion.slug)}</p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{idsDeColeccion(coleccion).length}</TableCell>
                  <TableCell>
                    <Badge variant={estado === "publicada" ? "default" : estado === "programada" ? "outline" : "secondary"}>{ESTADOS[estado]}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{coleccion.position ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {estado === "publicada" && (
                        <Button asChild variant="ghost" size="icon-sm" aria-label={`Ver ${coleccion.title} en la tienda`}>
                          <Link href={rutaColeccion(coleccion.slug)} target="_blank" rel="noopener noreferrer">
                            <ExternalLink />
                          </Link>
                        </Button>
                      )}
                      <Button asChild variant="ghost" size="icon-sm" aria-label={`Editar ${coleccion.title}`}>
                        <Link href={`/admin/colecciones/${coleccion.id}`}>
                          <Pencil />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Eliminar ${coleccion.title}`}>
                            <Trash2 className="text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar esta colección?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Se eliminará «{coleccion.title}» y dejará de funcionar su enlace. Sus productos no se tocan. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction variant="destructive" onClick={() => eliminar(coleccion)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
