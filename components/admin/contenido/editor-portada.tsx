"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { type Boton, type Diapositiva, LARGO, MAXIMO_DIAPOSITIVAS, type SeccionContenido } from "@/lib/contenido";
import { Campo, CamposEnlace, PieSeccion, useSeccion } from "./comun";
import { CampoFoto, type FotoFormulario, aFormulario, aImagen, subirFoto, useFotosGuardadas } from "./foto";

type DiapositivaFormulario = Omit<Diapositiva, "imagen"> & { id: string; imagen: FotoFormulario | null };
type CualBoton = "botonPrincipal" | "botonSecundario";

const NUEVA: Omit<Diapositiva, "imagen"> = {
  antetitulo: "",
  titulo: "",
  texto: "",
  botonPrincipal: { texto: "Comprar", enlace: "/catalogo" },
  botonSecundario: { texto: "", enlace: "" },
};

const aDatos = (d: DiapositivaFormulario): Diapositiva => ({
  antetitulo: d.antetitulo,
  titulo: d.titulo,
  texto: d.texto,
  botonPrincipal: d.botonPrincipal,
  botonSecundario: d.botonSecundario,
  imagen: aImagen(d.imagen),
});

export function EditorPortada({
  inicial,
  vistasPrevias,
}: {
  inicial: SeccionContenido<"portada">;
  vistasPrevias: Record<string, string>; // URL firmada de cada foto guardada
}) {
  const s = useSeccion("portada", inicial);
  const [diapositivas, setDiapositivas] = useState<DiapositivaFormulario[]>(() =>
    inicial.datos.diapositivas.map(({ imagen, ...d }) => ({
      ...d,
      id: crypto.randomUUID(),
      imagen: aFormulario(imagen, vistasPrevias),
    })),
  );
  const limpiarFotos = useFotosGuardadas(inicial.datos.diapositivas.map((d) => d.imagen));

  const cambiar = (indice: number, cambios: Partial<DiapositivaFormulario>, ruta?: string) => {
    setDiapositivas((actuales) => actuales.map((d, i) => (i === indice ? { ...d, ...cambios } : d)));
    s.editado(ruta && `diapositivas.${indice}.${ruta}`);
  };
  const cambiarBoton = (indice: number, cual: CualBoton, campo: keyof Boton, valor: string) => {
    setDiapositivas((actuales) => actuales.map((d, i) => (i === indice ? { ...d, [cual]: { ...d[cual], [campo]: valor } } : d)));
    s.editado(`diapositivas.${indice}.${cual}.${campo}`);
  };
  // Al agregar, quitar o mover portadas cambian sus números: se limpian los errores
  const reordenar = (lista: DiapositivaFormulario[]) => {
    setDiapositivas(lista);
    s.setErrores({});
    s.editado();
  };
  const mover = (indice: number, paso: -1 | 1) => {
    const lista = [...diapositivas];
    [lista[indice], lista[indice + paso]] = [lista[indice + paso], lista[indice]];
    reordenar(lista);
  };
  const quitar = (indice: number) => {
    const foto = diapositivas[indice].imagen;
    if (foto?.archivo) URL.revokeObjectURL(foto.vistaPrevia);
    reordenar(diapositivas.filter((_, i) => i !== indice));
  };

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let subidas = diapositivas;
    const guardado = await s.guardar({ diapositivas: diapositivas.map(aDatos) }, async () => {
      subidas = await Promise.all(diapositivas.map(async (d) => ({ ...d, imagen: await subirFoto(d.imagen) })));
      setDiapositivas(subidas); // si el guardado falla, al reintentar no se vuelven a subir
      return { diapositivas: subidas.map(aDatos) };
    });
    if (guardado) await limpiarFotos(subidas.map((d) => d.imagen));
  }

  const campoBoton = (i: number, cual: CualBoton, etiqueta: string, opcional: boolean) => (
    <CamposEnlace
      s={s}
      ruta={`diapositivas.${i}.${cual}`}
      etiqueta={etiqueta}
      ayuda={opcional ? "Déjalo vacío si no quieres un segundo botón." : undefined}
      boton={diapositivas[i][cual]}
      onChange={(campo, valor) => cambiarBoton(i, cual, campo, valor)}
    />
  );

  return (
    <form noValidate onSubmit={enviar}>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Portada</h2>
          </CardTitle>
          <CardDescription>
            Lo primero que se ve al entrar a la tienda. Puedes tener hasta {MAXIMO_DIAPOSITIVAS} portadas; con más de una aparecen guiones para pasar de una a otra.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {diapositivas.map((d, i) => {
            const ruta = `diapositivas.${i}`;
            const nombre = `Portada ${i + 1}`;
            return (
              <fieldset key={d.id} className="space-y-4 rounded-lg border p-4">
                <legend className="sr-only">{nombre}</legend>
                <div className="flex items-center justify-between gap-2">
                  <p aria-hidden="true" className="font-medium">
                    {nombre}
                  </p>
                  {diapositivas.length > 1 && (
                    <div className="flex">
                      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Subir ${nombre}`} disabled={i === 0} onClick={() => mover(i, -1)}>
                        <ChevronUp />
                      </Button>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Bajar ${nombre}`} disabled={i === diapositivas.length - 1} onClick={() => mover(i, 1)}>
                        <ChevronDown />
                      </Button>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Quitar ${nombre}`} onClick={() => quitar(i)}>
                        <Trash2 />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo {...s.campo(`${ruta}.antetitulo`)} etiqueta="Antetítulo (opcional)" ayuda="El texto pequeño sobre el título.">
                    <Input
                      {...s.entrada(`${ruta}.antetitulo`, true)}
                      maxLength={LARGO.antetitulo}
                      value={d.antetitulo}
                      onChange={(e) => cambiar(i, { antetitulo: e.target.value }, "antetitulo")}
                    />
                  </Campo>
                  <Campo {...s.campo(`${ruta}.titulo`)} etiqueta="Título">
                    <Input {...s.entrada(`${ruta}.titulo`)} maxLength={LARGO.titulo} value={d.titulo} onChange={(e) => cambiar(i, { titulo: e.target.value }, "titulo")} />
                  </Campo>
                  <Campo {...s.campo(`${ruta}.texto`)} etiqueta="Texto (opcional)" className="sm:col-span-2">
                    <Textarea {...s.entrada(`${ruta}.texto`)} maxLength={LARGO.texto} rows={2} value={d.texto} onChange={(e) => cambiar(i, { texto: e.target.value }, "texto")} />
                  </Campo>
                  {campoBoton(i, "botonPrincipal", "Botón principal", false)}
                  {campoBoton(i, "botonSecundario", "Segundo botón (opcional)", true)}
                </div>

                <div className="border-t pt-4">
                  <CampoFoto
                    s={s}
                    ruta={`${ruta}.imagen`}
                    nombre={`foto-${i + 1}`}
                    sinFoto="Sin foto se ven las ilustraciones de vestidos."
                    recomendacion="Medida recomendada: 2000 × 900 px, en horizontal. Deja lo importante arriba y al centro: en celular se recortan los lados y la caja de texto tapa lo que queda debajo."
                    foto={d.imagen}
                    onChange={(imagen) => cambiar(i, { imagen })}
                  />
                </div>
              </fieldset>
            );
          })}

          {diapositivas.length < MAXIMO_DIAPOSITIVAS && (
            <Button
              type="button"
              variant="outline"
              onClick={() => reordenar([...diapositivas, { ...structuredClone(NUEVA), id: crypto.randomUUID(), imagen: null }])}
            >
              <Plus />
              Agregar otra portada
            </Button>
          )}
        </CardContent>
        <PieSeccion estado={s.estado} texto="Guardar portada" />
      </Card>
    </form>
  );
}
