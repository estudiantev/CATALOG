"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { Skeleton } from "@/components/admin/ui/skeleton";
import type { OpcionProducto } from "@/components/admin/datos";
import { LARGO, MAXIMO_DESTACADOS, PRODUCTOS_POR_FILA, type SeccionContenido } from "@/lib/contenido";
import { Campo, CasillaVisible, PieSeccion, useSeccion } from "./comun";

export function EditorDestacados({
  inicial,
  productos,
  errorProductos,
}: {
  inicial: SeccionContenido<"destacados">;
  productos: OpcionProducto[] | null; // null mientras cargan
  errorProductos: string;
}) {
  const s = useSeccion("destacados", inicial);
  const [datos, setDatos] = useState(inicial.datos);
  const elegidos = datos.productos;
  const disponibles = (productos ?? []).filter((p) => !elegidos.includes(p.productId));
  const lleno = elegidos.length >= MAXIMO_DESTACADOS;

  const cambiarTexto = (campo: "titulo" | "subtitulo", valor: string) => {
    setDatos((actuales) => ({ ...actuales, [campo]: valor }));
    s.editado(campo);
  };
  const cambiarEtiqueta = (id: string, etiqueta: string) => {
    setDatos((actuales) => ({ ...actuales, etiquetas: { ...actuales.etiquetas, [id]: etiqueta } }));
    s.editado();
  };
  const cambiarProductos = (lista: string[]) => {
    setDatos((actuales) => ({ ...actuales, productos: lista }));
    s.editado();
  };
  const mover = (indice: number, paso: -1 | 1) => {
    const lista = [...elegidos];
    [lista[indice], lista[indice + paso]] = [lista[indice + paso], lista[indice]];
    cambiarProductos(lista);
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        s.guardar(datos);
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Catálogo</h2>
          </CardTitle>
          <CardDescription>
            Los productos que se destacan en la página de inicio, en dos filas de {PRODUCTOS_POR_FILA}. El precio y la foto salen del producto, así que siempre están al día.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CasillaVisible id="destacados-visible" visible={s.visible} onChange={s.cambiarVisible} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo {...s.campo("titulo")} etiqueta="Título">
              <Input {...s.entrada("titulo")} maxLength={LARGO.tituloSeccion} value={datos.titulo} onChange={(e) => cambiarTexto("titulo", e.target.value)} />
            </Campo>
            <Campo {...s.campo("subtitulo")} etiqueta="Subtítulo (opcional)">
              <Input {...s.entrada("subtitulo")} maxLength={LARGO.subtitulo} value={datos.subtitulo} onChange={(e) => cambiarTexto("subtitulo", e.target.value)} />
            </Campo>
          </div>

          <div className="space-y-3 border-t pt-5">
            <div className="space-y-2">
              <Label htmlFor="destacados-agregar">Agregar un producto</Label>
              {errorProductos ? (
                <Alert variant="destructive">
                  <AlertDescription>{errorProductos}</AlertDescription>
                </Alert>
              ) : productos === null ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Select name="destacados-agregar" value="" onValueChange={(id) => cambiarProductos([...elegidos, id])} disabled={lleno || disponibles.length === 0}>
                  <SelectTrigger id="destacados-agregar" aria-describedby="destacados-agregar-ayuda" className="w-full">
                    <SelectValue placeholder={lleno ? `Ya elegiste ${MAXIMO_DESTACADOS}` : "Elige un producto"} />
                  </SelectTrigger>
                  <SelectContent>
                    {disponibles.map((p) => (
                      <SelectItem key={p.productId} value={p.productId}>
                        {p.nombre} ({p.conStock ? p.categoria : `${p.categoria}, sin stock`})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p id="destacados-agregar-ayuda" className="text-sm text-muted-foreground">
                Hasta {MAXIMO_DESTACADOS}, en el orden de la lista. Si no eliges ninguno, se muestran los vestidos más recientes. Los productos sin stock no aparecen. La etiqueta es opcional y se ve sobre la foto, por ejemplo «Nuevo».
              </p>
            </div>

            {elegidos.length > 0 && (
              <ol aria-label="Productos elegidos" className="divide-y rounded-md border">
                {elegidos.map((id, i) => {
                  const producto = productos?.find((p) => p.productId === id);
                  const nombre = producto?.nombre ?? (productos ? "Producto eliminado" : "Cargando…");
                  return (
                    <li key={id} className="flex items-center gap-3 px-3 py-2">
                      <span className="w-5 text-sm text-muted-foreground tabular-nums">{i + 1}</span>
                      <span className="min-w-0 flex-1 truncate">{nombre}</span>
                      {producto && <Badge variant="outline">{producto.categoria}</Badge>}
                      {producto && !producto.conStock && <Badge variant="secondary">Sin stock: no se muestra</Badge>}
                      <Input
                        name={`etiqueta-${id}`}
                        aria-label={`Etiqueta de ${nombre}`}
                        placeholder="Etiqueta"
                        maxLength={LARGO.etiqueta}
                        className="h-8 w-28 flex-none"
                        value={datos.etiquetas[id] ?? ""}
                        onChange={(e) => cambiarEtiqueta(id, e.target.value)}
                      />
                      <div className="flex">
                        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Subir ${nombre}`} disabled={i === 0} onClick={() => mover(i, -1)}>
                          <ChevronUp />
                        </Button>
                        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Bajar ${nombre}`} disabled={i === elegidos.length - 1} onClick={() => mover(i, 1)}>
                          <ChevronDown />
                        </Button>
                        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Quitar ${nombre}`} onClick={() => cambiarProductos(elegidos.filter((x) => x !== id))}>
                          <X />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </CardContent>
        <PieSeccion estado={s.estado} texto="Guardar productos destacados" />
      </Card>
    </form>
  );
}
