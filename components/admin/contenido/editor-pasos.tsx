"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { type DatosSeccion, LARGO, type Paso, type SeccionContenido } from "@/lib/contenido";
import { Campo, CasillaVisible, PieSeccion, useSeccion } from "./comun";

type Datos = DatosSeccion["pasos"];

export function EditorPasos({ inicial }: { inicial: SeccionContenido<"pasos"> }) {
  const s = useSeccion("pasos", inicial);
  const [datos, setDatos] = useState(inicial.datos);

  const cambiar = (campo: Exclude<keyof Datos, "pasos">, valor: string) => {
    setDatos((actuales) => ({ ...actuales, [campo]: valor }));
    s.editado(campo);
  };
  const cambiarPaso = (indice: number, campo: keyof Paso, valor: string) => {
    setDatos((actuales) => ({
      ...actuales,
      pasos: actuales.pasos.map((paso, i) => (i === indice ? { ...paso, [campo]: valor } : paso)),
    }));
    s.editado(`pasos.${indice}.${campo}`);
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
            <h2>Alquiler en 3 pasos</h2>
          </CardTitle>
          <CardDescription>La franja que explica cómo alquilar. El botón abre WhatsApp con el número de la tienda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CasillaVisible id="pasos-visible" visible={s.visible} onChange={s.cambiarVisible} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo {...s.campo("titulo")} etiqueta="Título">
              <Input {...s.entrada("titulo")} maxLength={LARGO.tituloSeccion} value={datos.titulo} onChange={(e) => cambiar("titulo", e.target.value)} />
            </Campo>
            <Campo {...s.campo("subtitulo")} etiqueta="Subtítulo (opcional)">
              <Input {...s.entrada("subtitulo")} maxLength={LARGO.subtitulo} value={datos.subtitulo} onChange={(e) => cambiar("subtitulo", e.target.value)} />
            </Campo>
          </div>
          <div className="grid gap-x-8 gap-y-5 xl:grid-cols-3">
            {datos.pasos.map((paso, i) => (
              // El borde va en un div: en el <fieldset> el <legend> quedaría encima de la línea
              <div key={i} className="min-w-0 border-t pt-5">
                <fieldset className="min-w-0">
                  <legend className="mb-3 font-medium">Paso {i + 1}</legend>
                  <div className="grid gap-4">
                    <Campo {...s.campo(`pasos.${i}.titulo`)} etiqueta="Título">
                      <Input
                        {...s.entrada(`pasos.${i}.titulo`)}
                        maxLength={LARGO.tituloPaso}
                        value={paso.titulo}
                        onChange={(e) => cambiarPaso(i, "titulo", e.target.value)}
                      />
                    </Campo>
                    <Campo {...s.campo(`pasos.${i}.texto`)} etiqueta="Texto">
                      <Textarea
                        {...s.entrada(`pasos.${i}.texto`)}
                        maxLength={LARGO.textoPaso}
                        rows={2}
                        value={paso.texto}
                        onChange={(e) => cambiarPaso(i, "texto", e.target.value)}
                      />
                    </Campo>
                  </div>
                </fieldset>
              </div>
            ))}
          </div>
          <Campo {...s.campo("boton")} etiqueta="Texto del botón de WhatsApp" className="border-t pt-5">
            <Input {...s.entrada("boton")} maxLength={LARGO.boton} value={datos.boton} onChange={(e) => cambiar("boton", e.target.value)} />
          </Campo>
        </CardContent>
        <PieSeccion estado={s.estado} texto="Guardar pasos" />
      </Card>
    </form>
  );
}
