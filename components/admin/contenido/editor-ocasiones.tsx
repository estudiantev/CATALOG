"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { type ClaveOcasion, LARGO, OCASIONES, type Ocasion, type SeccionContenido } from "@/lib/contenido";
import { Campo, CasillaVisible, PieSeccion, useSeccion } from "./comun";

export function EditorOcasiones({ inicial }: { inicial: SeccionContenido<"ocasiones"> }) {
  const s = useSeccion("ocasiones", inicial);
  const [datos, setDatos] = useState(inicial.datos);

  const cambiar = (clave: ClaveOcasion, campo: keyof Ocasion, valor: string) => {
    setDatos((actuales) => ({ ...actuales, [clave]: { ...actuales[clave], [campo]: valor } }));
    s.editado(`${clave}.${campo}`);
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
            <h2>Ocasiones</h2>
          </CardTitle>
          <CardDescription>
            La lista De Gala, De XV, Cortos y Floreados. Sus nombres y enlaces son los del menú de la tienda; aquí cambias el texto de cada una.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CasillaVisible id="ocasiones-visible" visible={s.visible} onChange={s.cambiarVisible} />
          {OCASIONES.map(({ clave, nombre }) => (
            // El borde va en un div: en el <fieldset> el <legend> quedaría encima de la línea
            <div key={clave} className="border-t pt-5">
              <fieldset className="min-w-0">
                <legend className="mb-3 font-medium">{nombre}</legend>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
                  <Campo {...s.campo(`${clave}.modalidad`)} etiqueta="Modalidad">
                    <Input
                      {...s.entrada(`${clave}.modalidad`)}
                      maxLength={LARGO.modalidad}
                      placeholder="Venta y alquiler"
                      value={datos[clave].modalidad}
                      onChange={(e) => cambiar(clave, "modalidad", e.target.value)}
                    />
                  </Campo>
                  <Campo {...s.campo(`${clave}.descripcion`)} etiqueta="Descripción">
                    <Input
                      {...s.entrada(`${clave}.descripcion`)}
                      maxLength={LARGO.descripcion}
                      value={datos[clave].descripcion}
                      onChange={(e) => cambiar(clave, "descripcion", e.target.value)}
                    />
                  </Campo>
                </div>
              </fieldset>
            </div>
          ))}
        </CardContent>
        <PieSeccion estado={s.estado} texto="Guardar ocasiones" />
      </Card>
    </form>
  );
}
