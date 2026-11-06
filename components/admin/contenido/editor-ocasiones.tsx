"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { type Coleccion, estadoColeccion } from "@/lib/colecciones";
import {
  type ClaveOcasion,
  type DatosSeccion,
  LARGO,
  MAXIMO_EN_INICIO,
  MINIMO_EN_INICIO,
  OCASIONES,
  type Ocasion,
  type SeccionContenido,
  eleccionDeColeccion,
  slugDeEleccion,
} from "@/lib/contenido";
import { Buscador, type OpcionBuscador } from "./buscador";
import { Campo, CasillaVisible, PieSeccion, useSeccion } from "./comun";
import { CampoFoto, type FotoFormulario, aFormulario, aImagen, subirFoto, useFotosGuardadas } from "./foto";

type OcasionFormulario = Omit<Ocasion, "imagen"> & { foto: FotoFormulario | null };
type Formulario = Record<ClaveOcasion, OcasionFormulario>;

const aDatos = (datos: Formulario, enInicio: string[]) =>
  ({
    ...Object.fromEntries(
      OCASIONES.map(({ clave }) => {
        const { foto, ...textos } = datos[clave];
        return [clave, { ...textos, imagen: aImagen(foto) }];
      }),
    ),
    enInicio,
  }) as DatosSeccion["ocasiones"];

// Por qué una colección elegida no se vería como se espera
const AVISOS = {
  borrador: "Borrador: no se muestra",
  programada: "Programada: todavía no se muestra",
  terminada: "Terminada: no se muestra",
};

function aOpcion(coleccion: Coleccion): OpcionBuscador {
  const estado = estadoColeccion(coleccion);
  const aviso = estado === "publicada" ? (coleccion.imageKey ? undefined : "Sin foto") : AVISOS[estado];
  return { id: eleccionDeColeccion(coleccion.slug), nombre: coleccion.title, aviso };
}

export function EditorOcasiones({
  inicial,
  vistasPrevias,
  colecciones,
  errorColecciones,
}: {
  inicial: SeccionContenido<"ocasiones">;
  vistasPrevias: Record<string, string>; // URL firmada de cada foto guardada
  colecciones: Coleccion[] | null; // null mientras cargan
  errorColecciones: string;
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
  const [enInicio, setEnInicio] = useState(inicial.datos.enInicio);
  const limpiarFotos = useFotosGuardadas(OCASIONES.map(({ clave }) => inicial.datos[clave].imagen));

  const opciones: OpcionBuscador[] = [
    ...OCASIONES.map(({ clave, nombre }) => ({ id: clave, nombre, aviso: datos[clave].foto ? undefined : "Sin foto" })),
    ...(colecciones ?? []).map(aOpcion),
  ];
  const lleno = enInicio.length >= MAXIMO_EN_INICIO;

  const cambiar = (clave: ClaveOcasion, cambios: Partial<OcasionFormulario>) => setDatos((actuales) => ({ ...actuales, [clave]: { ...actuales[clave], ...cambios } }));
  const cambiarEnInicio = (lista: string[]) => {
    setEnInicio(lista);
    s.editado("enInicio");
  };
  const mover = (indice: number, paso: -1 | 1) => {
    const lista = [...enInicio];
    [lista[indice], lista[indice + paso]] = [lista[indice + paso], lista[indice]];
    cambiarEnInicio(lista);
  };

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let subidos = datos;
    const guardado = await s.guardar(aDatos(datos, enInicio), async () => {
      const lista = await Promise.all(OCASIONES.map(async ({ clave }) => [clave, { ...datos[clave], foto: await subirFoto(datos[clave].foto) }] as const));
      subidos = Object.fromEntries(lista) as Formulario;
      setDatos(subidos); // si el guardado falla, al reintentar no se vuelven a subir
      return aDatos(subidos, enInicio);
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
            Elige de {MINIMO_EN_INICIO} a {MAXIMO_EN_INICIO} colecciones para la página de inicio, en el orden en que quieres verlas. En la página Colecciones se ven todas las publicadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CasillaVisible id="ocasiones-visible" visible={s.visible} onChange={s.cambiarVisible} />

          <div className="grid gap-x-8 gap-y-5 xl:grid-cols-2">
            <div className="min-w-0 space-y-3">
              <Campo {...s.campo("enInicio")} etiqueta="Agregar una colección">
                <Buscador
                  {...s.entrada("enInicio")}
                  opciones={opciones.filter((o) => !enInicio.includes(o.id))}
                  onElegir={(id) => cambiarEnInicio([...enInicio, id])}
                  placeholder={lleno ? `Ya elegiste ${MAXIMO_EN_INICIO}: quita una para cambiarla` : "Busca por nombre"}
                  disabled={lleno}
                  sinResultados="No hay más colecciones con ese nombre."
                />
              </Campo>
              {errorColecciones && (
                <Alert variant="destructive">
                  <AlertDescription>{errorColecciones}</AlertDescription>
                </Alert>
              )}
              <p className="text-sm text-muted-foreground">
                El texto y la foto de De Gala, De XV, Cortos y Floreados se cambian aquí abajo. Los de las demás, en{" "}
                <Link href="/admin/colecciones" className="underline underline-offset-2 hover:text-foreground">
                  Colecciones
                </Link>
                . Si una elegida deja de estar publicada, la página de inicio sigue sin ella.
              </p>
            </div>

            <div className="min-w-0 space-y-2">
              <h3 className="text-sm font-medium">
                En la página de inicio ({enInicio.length} de {MAXIMO_EN_INICIO})
              </h3>
              <ol aria-label="Colecciones en la página de inicio" className="divide-y rounded-md border">
                {enInicio.map((id, i) => {
                  const opcion = opciones.find((o) => o.id === id);
                  const nombre = opcion?.nombre ?? (colecciones ? "Colección eliminada" : (slugDeEleccion(id) ?? id));
                  return (
                    <li key={id} className="flex items-center gap-3 px-3 py-2">
                      <span className="w-5 text-sm text-muted-foreground tabular-nums">{i + 1}</span>
                      <span className="min-w-0 flex-1 truncate">{nombre}</span>
                      {opcion?.aviso && <Badge variant="secondary">{opcion.aviso}</Badge>}
                      <div className="flex flex-none">
                        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Subir ${nombre}`} disabled={i === 0} onClick={() => mover(i, -1)}>
                          <ChevronUp />
                        </Button>
                        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Bajar ${nombre}`} disabled={i === enInicio.length - 1} onClick={() => mover(i, 1)}>
                          <ChevronDown />
                        </Button>
                        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Quitar ${nombre}`} onClick={() => cambiarEnInicio(enInicio.filter((x) => x !== id))}>
                          <X />
                        </Button>
                      </div>
                    </li>
                  );
                })}
                {enInicio.length === 0 && <li className="px-3 py-2 text-sm text-muted-foreground">Todavía no elegiste ninguna.</li>}
              </ol>
            </div>
          </div>

          <div className="space-y-4 border-t pt-5">
            <div className="space-y-1">
              <h3 className="font-medium">De Gala, De XV, Cortos y Floreados</h3>
              <p className="text-sm text-muted-foreground">Sus nombres y enlaces son los del menú de la tienda; aquí cambias su texto y su foto.</p>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {OCASIONES.map(({ clave, nombre }) => (
                <fieldset key={clave} className="min-w-0 space-y-4 rounded-lg border p-4">
                  <legend className="sr-only">{nombre}</legend>
                  <p aria-hidden="true" className="font-medium">
                    {nombre}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)]">
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
              ))}
            </div>
          </div>
        </CardContent>
        <PieSeccion estado={s.estado} texto="Guardar colecciones" />
      </Card>
    </form>
  );
}
