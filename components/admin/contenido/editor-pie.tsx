"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { type ClaveRed, type DatosSeccion, LARGO, REDES, type SeccionContenido } from "@/lib/contenido";
import { Campo, PieSeccion, useSeccion } from "./comun";

type Datos = DatosSeccion["pie"];

export function EditorPie({ inicial }: { inicial: SeccionContenido<"pie"> }) {
  const s = useSeccion("pie", inicial);
  const [datos, setDatos] = useState(inicial.datos);

  const cambiar = (campo: Exclude<keyof Datos, "redes">, valor: string) => {
    setDatos((actuales) => ({ ...actuales, [campo]: valor }));
    s.editado(campo);
  };
  const cambiarRed = (clave: ClaveRed, valor: string) => {
    setDatos((actuales) => ({ ...actuales, redes: { ...actuales.redes, [clave]: valor } }));
    s.editado(`redes.${clave}`);
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
            <h2>Pie de página</h2>
          </CardTitle>
          <CardDescription>Se ve en todas las páginas de la tienda. Los enlaces de catálogo y de alquiler son los del menú.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Campo {...s.campo("descripcion")} etiqueta="Descripción de la tienda">
            <Textarea {...s.entrada("descripcion")} maxLength={LARGO.descripcionPie} rows={3} value={datos.descripcion} onChange={(e) => cambiar("descripcion", e.target.value)} />
          </Campo>

          <div className="grid gap-x-8 gap-y-5 xl:grid-cols-2">
            <div className="min-w-0 border-t pt-5">
              <fieldset className="min-w-0">
                <legend className="mb-3 font-medium">Suscripción</legend>
                <div className="grid gap-4">
                  <Campo
                    {...s.campo("boletinTitulo")}
                    etiqueta="Título (opcional)"
                    ayuda="Déjalo vacío para ocultar el formulario. Quien se suscribe abre WhatsApp con su correo ya escrito: la tienda todavía no guarda una lista."
                  >
                    <Input {...s.entrada("boletinTitulo", true)} maxLength={LARGO.tituloSeccion} value={datos.boletinTitulo} onChange={(e) => cambiar("boletinTitulo", e.target.value)} />
                  </Campo>
                  <Campo {...s.campo("boletinNota")} etiqueta="Nota debajo del formulario (opcional)">
                    <Input {...s.entrada("boletinNota")} maxLength={LARGO.notaBoletin} value={datos.boletinNota} onChange={(e) => cambiar("boletinNota", e.target.value)} />
                  </Campo>
                </div>
              </fieldset>
            </div>

            <div className="min-w-0 border-t pt-5">
              <fieldset className="min-w-0">
                <legend className="mb-3 font-medium">Redes</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  {REDES.map(({ clave, nombre }) => (
                    <Campo key={clave} {...s.campo(`redes.${clave}`)} etiqueta={nombre}>
                      <Input
                        {...s.entrada(`redes.${clave}`)}
                        maxLength={LARGO.enlace}
                        spellCheck={false}
                        autoCapitalize="none"
                        placeholder="https://"
                        value={datos.redes[clave]}
                        onChange={(e) => cambiarRed(clave, e.target.value)}
                      />
                    </Campo>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Una red sin enlace no se muestra.</p>
              </fieldset>
            </div>
          </div>
        </CardContent>
        <PieSeccion estado={s.estado} texto="Guardar pie de página" />
      </Card>
    </form>
  );
}
