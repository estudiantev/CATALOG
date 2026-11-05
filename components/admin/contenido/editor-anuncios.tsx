"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { type Anuncio, type Boton, LARGO, MAXIMO_ANUNCIOS, SEGUNDOS_ANUNCIO, type SeccionContenido } from "@/lib/contenido";
import { Campo, CamposEnlace, CasillaVisible, PieSeccion, useSeccion } from "./comun";

type AnuncioFormulario = Anuncio & { id: string };

export function EditorAnuncios({ inicial }: { inicial: SeccionContenido<"anuncios"> }) {
  const s = useSeccion("anuncios", inicial);
  const [mensajes, setMensajes] = useState<AnuncioFormulario[]>(() => inicial.datos.mensajes.map((m) => ({ ...m, id: crypto.randomUUID() })));
  const [segundos, setSegundos] = useState(inicial.datos.segundos);

  const cambiarTexto = (indice: number, texto: string) => {
    setMensajes((actuales) => actuales.map((m, i) => (i === indice ? { ...m, texto } : m)));
    s.editado(`mensajes.${indice}.texto`);
  };
  const cambiarBoton = (indice: number, campo: keyof Boton, valor: string) => {
    setMensajes((actuales) => actuales.map((m, i) => (i === indice ? { ...m, boton: { ...m.boton, [campo]: valor } } : m)));
    s.editado(`mensajes.${indice}.boton.${campo}`);
  };
  // Al agregar, quitar o mover anuncios cambian sus números: se limpian los errores
  const reordenar = (lista: AnuncioFormulario[]) => {
    setMensajes(lista);
    s.setErrores({});
    s.editado();
  };
  const mover = (indice: number, paso: -1 | 1) => {
    const lista = [...mensajes];
    [lista[indice], lista[indice + paso]] = [lista[indice + paso], lista[indice]];
    reordenar(lista);
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        s.guardar({ mensajes: mensajes.map(({ texto, boton }) => ({ texto, boton })), segundos });
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Anuncios</h2>
          </CardTitle>
          <CardDescription>
            La barra azul sobre el menú, en todas las páginas de la tienda. Puedes tener hasta {MAXIMO_ANUNCIOS} anuncios; con más de uno van rotando y aparecen las flechas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CasillaVisible id="anuncios-visible" visible={s.visible} onChange={s.cambiarVisible} etiqueta="Mostrar la barra de anuncios en la tienda" />
          {mensajes.map((m, i) => {
            const ruta = `mensajes.${i}`;
            const nombre = `Anuncio ${i + 1}`;
            return (
              <fieldset key={m.id} className="space-y-4 rounded-lg border p-4">
                <legend className="sr-only">{nombre}</legend>
                <div className="flex items-center justify-between gap-2">
                  <p aria-hidden="true" className="font-medium">
                    {nombre}
                  </p>
                  {mensajes.length > 1 && (
                    <div className="flex">
                      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Subir ${nombre}`} disabled={i === 0} onClick={() => mover(i, -1)}>
                        <ChevronUp />
                      </Button>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Bajar ${nombre}`} disabled={i === mensajes.length - 1} onClick={() => mover(i, 1)}>
                        <ChevronDown />
                      </Button>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Quitar ${nombre}`} onClick={() => reordenar(mensajes.filter((_, j) => j !== i))}>
                        <Trash2 />
                      </Button>
                    </div>
                  )}
                </div>
                <Campo {...s.campo(`${ruta}.texto`)} etiqueta="Texto">
                  <Input {...s.entrada(`${ruta}.texto`)} maxLength={LARGO.anuncio} value={m.texto} onChange={(e) => cambiarTexto(i, e.target.value)} />
                </Campo>
                <div className="grid gap-4 sm:grid-cols-2">
                  <CamposEnlace
                    s={s}
                    ruta={`${ruta}.boton`}
                    etiqueta="Texto del enlace (opcional)"
                    ayuda="Déjalo vacío si el anuncio no lleva enlace."
                    boton={m.boton}
                    onChange={(campo, valor) => cambiarBoton(i, campo, valor)}
                  />
                </div>
              </fieldset>
            );
          })}

          {mensajes.length < MAXIMO_ANUNCIOS && (
            <Button
              type="button"
              variant="outline"
              onClick={() => reordenar([...mensajes, { texto: "", boton: { texto: "", enlace: "" }, id: crypto.randomUUID() }])}
            >
              <Plus />
              Agregar otro anuncio
            </Button>
          )}

          <Campo id="anuncios-segundos" etiqueta="Cambia cada">
            <Select
              name="anuncios-segundos"
              value={String(segundos)}
              onValueChange={(valor) => {
                setSegundos(Number(valor));
                s.editado();
              }}
            >
              <SelectTrigger id="anuncios-segundos" className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEGUNDOS_ANUNCIO.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} segundos
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>
        </CardContent>
        <PieSeccion estado={s.estado} texto="Guardar anuncios" />
      </Card>
    </form>
  );
}
