"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { type ClaveOcasion, type DatosSeccion, LARGO, OCASIONES, OCASIONES_INICIO, type Ocasion, type SeccionContenido } from "@/lib/contenido";
import { Campo, CasillaVisible, PieSeccion, useSeccion } from "./comun";
import { CampoFoto, type FotoFormulario, aFormulario, aImagen, subirFoto, useFotosGuardadas } from "./foto";

type OcasionFormulario = Omit<Ocasion, "imagen"> & { foto: FotoFormulario | null };
type Formulario = Record<ClaveOcasion, OcasionFormulario>;

const enInicio = (clave: ClaveOcasion) => (OCASIONES_INICIO as readonly ClaveOcasion[]).includes(clave);

const aDatos = (datos: Formulario) =>
  Object.fromEntries(
    OCASIONES.map(({ clave }) => {
      const { foto, ...textos } = datos[clave];
      return [clave, { ...textos, imagen: aImagen(foto) }];
    }),
  ) as DatosSeccion["ocasiones"];

export function EditorOcasiones({
  inicial,
  vistasPrevias,
}: {
  inicial: SeccionContenido<"ocasiones">;
  vistasPrevias: Record<string, string>; // URL firmada de cada foto guardada
}) {
  const s = useSeccion("ocasiones", inicial);
  const [datos, setDatos] = useState<Formulario>(
    () =>
      Object.fromEntries(
        OCASIONES.map(({ clave }) => {
          const { imagen, ...textos } = inicial.datos[clave];
          return [clave, { ...textos, foto: aFormulario(imagen, vistasPrevias) }];
        }),
      ) as Formulario,
  );
  const limpiarFotos = useFotosGuardadas(OCASIONES.map(({ clave }) => inicial.datos[clave].imagen));

  const cambiar = (clave: ClaveOcasion, cambios: Partial<OcasionFormulario>) => setDatos((actuales) => ({ ...actuales, [clave]: { ...actuales[clave], ...cambios } }));

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let subidos = datos;
    const guardado = await s.guardar(aDatos(datos), async () => {
      const lista = await Promise.all(OCASIONES.map(async ({ clave }) => [clave, { ...datos[clave], foto: await subirFoto(datos[clave].foto) }] as const));
      subidos = Object.fromEntries(lista) as Formulario;
      setDatos(subidos); // si el guardado falla, al reintentar no se vuelven a subir
      return aDatos(subidos);
    });
    if (guardado) await limpiarFotos(OCASIONES.map(({ clave }) => subidos[clave].foto));
  }

  return (
    <form noValidate onSubmit={enviar}>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Colecciones</h2>
          </CardTitle>
          <CardDescription>
            De Gala y De XV se ven en la página de inicio; las cuatro, en la página Colecciones. Sus nombres y enlaces son los del menú de la tienda; aquí cambias el texto y la foto de cada una.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CasillaVisible id="ocasiones-visible" visible={s.visible} onChange={s.cambiarVisible} />
          {OCASIONES.map(({ clave, nombre }) => (
            // El borde va en un div: en el <fieldset> el <legend> quedaría encima de la línea
            <div key={clave} className="border-t pt-5">
              <fieldset className="min-w-0 space-y-4">
                <legend className="mb-3 font-medium">
                  {nombre}
                  {!enInicio(clave) && <span className="font-normal text-muted-foreground"> · solo en la página Colecciones</span>}
                </legend>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
                  <Campo {...s.campo(`${clave}.modalidad`)} etiqueta="Modalidad">
                    <Input
                      {...s.entrada(`${clave}.modalidad`)}
                      maxLength={LARGO.modalidad}
                      placeholder="Venta y alquiler"
                      value={datos[clave].modalidad}
                      onChange={(e) => {
                        cambiar(clave, { modalidad: e.target.value });
                        s.editado(`${clave}.modalidad`);
                      }}
                    />
                  </Campo>
                  <Campo {...s.campo(`${clave}.descripcion`)} etiqueta="Descripción">
                    <Input
                      {...s.entrada(`${clave}.descripcion`)}
                      maxLength={LARGO.descripcion}
                      value={datos[clave].descripcion}
                      onChange={(e) => {
                        cambiar(clave, { descripcion: e.target.value });
                        s.editado(`${clave}.descripcion`);
                      }}
                    />
                  </Campo>
                </div>
                <CampoFoto
                  s={s}
                  ruta={`${clave}.imagen`}
                  nombre={`foto-${clave}`}
                  sinFoto="Sin foto se ve la ilustración del vestido."
                  foto={datos[clave].foto}
                  onChange={(foto) => cambiar(clave, { foto })}
                />
              </fieldset>
            </div>
          ))}
        </CardContent>
        <PieSeccion estado={s.estado} texto="Guardar colecciones" />
      </Card>
    </form>
  );
}
