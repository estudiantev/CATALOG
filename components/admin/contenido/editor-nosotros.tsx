"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { LARGO, type SeccionContenido } from "@/lib/contenido";
import { CamposEnlace, CasillaVisible, Campo, PieSeccion, useSeccion } from "./comun";
import { CampoFoto, aFormulario, aImagen, subirFoto, useFotosGuardadas } from "./foto";

export function EditorNosotros({
  inicial,
  vistasPrevias,
}: {
  inicial: SeccionContenido<"nosotros">;
  vistasPrevias: Record<string, string>; // URL firmada de cada foto guardada
}) {
  const s = useSeccion("nosotros", inicial);
  const [titulo, setTitulo] = useState(inicial.datos.titulo);
  const [texto, setTexto] = useState(inicial.datos.texto);
  const [boton, setBoton] = useState(inicial.datos.boton);
  const [direccion, setDireccion] = useState(inicial.datos.direccion);
  const [foto, setFoto] = useState(() => aFormulario(inicial.datos.imagen, vistasPrevias));
  const limpiarFotos = useFotosGuardadas([inicial.datos.imagen]);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let subida = foto;
    const guardado = await s.guardar({ titulo, texto, boton, direccion, imagen: aImagen(foto) }, async () => {
      subida = await subirFoto(foto);
      setFoto(subida); // si el guardado falla, al reintentar no se vuelve a subir
      return { titulo, texto, boton, direccion, imagen: aImagen(subida) };
    });
    if (guardado) await limpiarFotos([subida]);
  }

  return (
    <form noValidate onSubmit={enviar}>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Quiénes somos</h2>
          </CardTitle>
          <CardDescription>Un título, un texto y un botón al lado del mapa del local. Sin dirección, al lado va la foto.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CasillaVisible id="nosotros-visible" visible={s.visible} onChange={s.cambiarVisible} />
          <div className="grid gap-x-8 gap-y-5 xl:grid-cols-2">
            <div className="grid content-start gap-4 sm:grid-cols-2">
              <Campo {...s.campo("titulo")} etiqueta="Título">
                <Input
                  {...s.entrada("titulo")}
                  maxLength={LARGO.tituloSeccion}
                  value={titulo}
                  onChange={(e) => {
                    setTitulo(e.target.value);
                    s.editado("titulo");
                  }}
                />
              </Campo>
              <Campo {...s.campo("texto")} etiqueta="Texto" className="sm:col-span-2">
                <Textarea
                  {...s.entrada("texto")}
                  maxLength={LARGO.textoNosotros}
                  rows={4}
                  value={texto}
                  onChange={(e) => {
                    setTexto(e.target.value);
                    s.editado("texto");
                  }}
                />
              </Campo>
              <CamposEnlace
                s={s}
                ruta="boton"
                etiqueta="Botón (opcional)"
                ayuda="Por ejemplo, Cómo llegar. Sin texto no se muestra."
                boton={boton}
                onChange={(campo, valor) => {
                  setBoton((actual) => ({ ...actual, [campo]: valor }));
                  s.editado(`boton.${campo}`);
                }}
              />
            </div>
            <div className="min-w-0 space-y-6 border-t pt-5 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-8">
              <Campo
                {...s.campo("direccion")}
                etiqueta="Dirección del local (opcional)"
                ayuda="Escríbela como la buscarías en Google Maps, por ejemplo: Av. Bolognesi 123, Tacna. Con dirección se ve el mapa en lugar de la foto."
              >
                <Input
                  {...s.entrada("direccion", true)}
                  maxLength={LARGO.direccion}
                  value={direccion}
                  onChange={(e) => {
                    setDireccion(e.target.value);
                    s.editado("direccion");
                  }}
                />
              </Campo>
              <CampoFoto s={s} ruta="imagen" nombre="foto-nosotros" sinFoto="Sin dirección ni foto queda un recuadro gris." foto={foto} onChange={setFoto} />
            </div>
          </div>
        </CardContent>
        <PieSeccion estado={s.estado} texto="Guardar quiénes somos" />
      </Card>
    </form>
  );
}
