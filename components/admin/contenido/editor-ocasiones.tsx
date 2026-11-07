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
  type DatosSeccion,
  LARGO,
  MAXIMO_EN_INICIO,
  MINIMO_EN_INICIO,
  OCASIONES,
  type SeccionContenido,
  type TarjetaInicio,
  eleccionDeColeccion,
  esOcasion,
  slugDeEleccion,
} from "@/lib/contenido";
import { Buscador, type OpcionBuscador } from "./buscador";
import { Campo, CasillaVisible, PieSeccion, useSeccion } from "./comun";
import { CampoFoto, type FotoFormulario, aFormulario, aImagen, subirFoto, useFotosGuardadas } from "./foto";

type TarjetaFormulario = Omit<TarjetaInicio, "imagen"> & { foto: FotoFormulario | null };
type CampoTexto = "titulo" | "modalidad" | "descripcion";

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
  const [tarjetas, setTarjetas] = useState<TarjetaFormulario[]>(() =>
    inicial.datos.tarjetas.map(({ imagen, ...textos }) => ({ ...textos, foto: aFormulario(imagen, vistasPrevias) })),
  );
  const limpiarFotos = useFotosGuardadas(inicial.datos.tarjetas.map((t) => t.imagen));

  // El texto y la foto propios de las fijas (los de /colecciones) se guardan tal cual
  const aDatos = (lista: TarjetaFormulario[]): DatosSeccion["ocasiones"] => ({
    ...inicial.datos,
    tarjetas: lista.map(({ foto, ...textos }) => ({ ...textos, imagen: aImagen(foto) })),
  });

  const opciones: OpcionBuscador[] = [...OCASIONES.map(({ clave, nombre }) => ({ id: clave, nombre })), ...(colecciones ?? []).map(aOpcion)];
  const elegidas = tarjetas.map((t) => t.eleccion);
  const lleno = tarjetas.length >= MAXIMO_EN_INICIO;

  // Lo que la tarjeta muestra si se deja vacía
  function propia(eleccion: string) {
    if (esOcasion(eleccion)) {
      const fija = inicial.datos[eleccion];
      return {
        nombre: OCASIONES.find((o) => o.clave === eleccion)!.nombre,
        descripcion: fija.descripcion,
        sinFoto: fija.imagen ? "Sin foto se usa la de la colección." : "Sin foto se ve la ilustración del vestido.",
        aviso: undefined,
      };
    }
    const coleccion = colecciones?.find((c) => eleccionDeColeccion(c.slug) === eleccion);
    if (!coleccion) {
      return { nombre: colecciones ? "Colección eliminada" : (slugDeEleccion(eleccion) ?? eleccion), descripcion: "", sinFoto: "Sin foto se usa la de la colección.", aviso: undefined };
    }
    return {
      nombre: coleccion.title,
      descripcion: coleccion.description ?? "",
      sinFoto: coleccion.imageKey ? "Sin foto se usa la de la colección." : "La colección no tiene foto: sin una aquí, la tarjeta va solo con su color.",
      aviso: aOpcion(coleccion).aviso,
    };
  }

  const cambiarLista = (lista: TarjetaFormulario[]) => {
    setTarjetas(lista);
    s.editado("tarjetas");
  };
  const agregar = (eleccion: string) =>
    cambiarLista([...tarjetas, { eleccion, titulo: "", modalidad: esOcasion(eleccion) ? inicial.datos[eleccion].modalidad : "", descripcion: "", foto: null }]);
  const quitar = (tarjeta: TarjetaFormulario) => {
    if (tarjeta.foto?.archivo) URL.revokeObjectURL(tarjeta.foto.vistaPrevia);
    cambiarLista(tarjetas.filter((t) => t !== tarjeta));
  };
  const mover = (indice: number, paso: -1 | 1) => {
    const lista = [...tarjetas];
    [lista[indice], lista[indice + paso]] = [lista[indice + paso], lista[indice]];
    cambiarLista(lista);
  };
  const cambiar = (eleccion: string, cambios: Partial<TarjetaFormulario>) =>
    setTarjetas((actuales) => actuales.map((t) => (t.eleccion === eleccion ? { ...t, ...cambios } : t)));
  const cambiarTexto = (eleccion: string, campo: CampoTexto, valor: string) => {
    cambiar(eleccion, { [campo]: valor });
    s.editado(`tarjetas.${eleccion}.${campo}`);
  };

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let subidas = tarjetas;
    const guardado = await s.guardar(aDatos(tarjetas), async () => {
      subidas = await Promise.all(tarjetas.map(async (t) => ({ ...t, foto: await subirFoto(t.foto) })));
      setTarjetas(subidas); // si el guardado falla, al reintentar no se vuelven a subir
      return aDatos(subidas);
    });
    if (guardado) await limpiarFotos(subidas.map((t) => t.foto));
  }

  return (
    <form noValidate onSubmit={enviar}>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Colecciones</h2>
          </CardTitle>
          <CardDescription>
            Elige de {MINIMO_EN_INICIO} a {MAXIMO_EN_INICIO} colecciones para la página de inicio, en el orden en que quieres verlas. El título, la modalidad, la descripción y la foto de cada
            tarjeta son solo de la página de inicio: no cambian la colección. Lo que dejes vacío se toma de la colección.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CasillaVisible id="ocasiones-visible" visible={s.visible} onChange={s.cambiarVisible} />

          <div className="max-w-xl space-y-3">
            <Campo {...s.campo("tarjetas")} etiqueta="Agregar una colección">
              <Buscador
                {...s.entrada("tarjetas")}
                opciones={opciones.filter((o) => !elegidas.includes(o.id))}
                onElegir={agregar}
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
              Las colecciones se crean y se publican en{" "}
              <Link href="/admin/colecciones" className="underline underline-offset-2 hover:text-foreground">
                Colecciones
              </Link>
              . Si una elegida deja de estar publicada, la página de inicio sigue sin ella.
            </p>
          </div>

          <div className="space-y-3 border-t pt-5">
            <h3 className="font-medium">
              En la página de inicio ({tarjetas.length} de {MAXIMO_EN_INICIO})
            </h3>
            {tarjetas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no elegiste ninguna.</p>
            ) : (
              <ol aria-label="Colecciones en la página de inicio" className="grid gap-4 xl:grid-cols-2">
                {tarjetas.map((tarjeta, i) => {
                  const { eleccion } = tarjeta;
                  const datos = propia(eleccion);
                  const ruta = (campo: string) => `tarjetas.${eleccion}.${campo}`;
                  return (
                    <li key={eleccion} className="min-w-0">
                      <fieldset className="min-w-0 space-y-4 rounded-lg border p-4">
                        <legend className="sr-only">{datos.nombre}</legend>
                        <div className="flex items-center gap-3">
                          <span className="w-5 text-sm text-muted-foreground tabular-nums">{i + 1}</span>
                          <p aria-hidden="true" className="min-w-0 flex-1 truncate font-medium">
                            {datos.nombre}
                          </p>
                          {datos.aviso && <Badge variant="secondary">{datos.aviso}</Badge>}
                          <div className="flex flex-none">
                            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Subir ${datos.nombre}`} disabled={i === 0} onClick={() => mover(i, -1)}>
                              <ChevronUp />
                            </Button>
                            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Bajar ${datos.nombre}`} disabled={i === tarjetas.length - 1} onClick={() => mover(i, 1)}>
                              <ChevronDown />
                            </Button>
                            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Quitar ${datos.nombre}`} onClick={() => quitar(tarjeta)}>
                              <X />
                            </Button>
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,10rem)]">
                          <Campo {...s.campo(ruta("titulo"))} etiqueta="Título (opcional)">
                            <Input
                              {...s.entrada(ruta("titulo"))}
                              maxLength={LARGO.titulo}
                              placeholder={datos.nombre}
                              value={tarjeta.titulo}
                              onChange={(e) => cambiarTexto(eleccion, "titulo", e.target.value)}
                            />
                          </Campo>
                          <Campo {...s.campo(ruta("modalidad"))} etiqueta="Modalidad (opcional)">
                            <Input
                              {...s.entrada(ruta("modalidad"))}
                              maxLength={LARGO.modalidad}
                              placeholder="Venta y alquiler"
                              value={tarjeta.modalidad}
                              onChange={(e) => cambiarTexto(eleccion, "modalidad", e.target.value)}
                            />
                          </Campo>
                        </div>
                        <Campo {...s.campo(ruta("descripcion"))} etiqueta="Descripción (opcional)">
                          <Input
                            {...s.entrada(ruta("descripcion"))}
                            maxLength={LARGO.descripcion}
                            placeholder={datos.descripcion}
                            value={tarjeta.descripcion}
                            onChange={(e) => cambiarTexto(eleccion, "descripcion", e.target.value)}
                          />
                        </Campo>
                        <CampoFoto
                          s={s}
                          ruta={ruta("imagen")}
                          nombre={`foto-${eleccion}`}
                          sinFoto={datos.sinFoto}
                          foto={tarjeta.foto}
                          onChange={(foto) => cambiar(eleccion, { foto })}
                        />
                      </fieldset>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </CardContent>
        <PieSeccion estado={s.estado} texto="Guardar colecciones" />
      </Card>
    </form>
  );
}
