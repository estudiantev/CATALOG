"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { LARGO, type SeccionContenido } from "@/lib/contenido";
import { CasillaVisible, Campo, PieSeccion, useSeccion } from "./comun";
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
  const [lema, setLema] = useState(inicial.datos.lema);
  const [texto, setTexto] = useState(inicial.datos.texto);
  const [foto, setFoto] = useState(() => aFormulario(inicial.datos.imagen, vistasPrevias));
  const limpiarFotos = useFotosGuardadas([inicial.datos.imagen]);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let subida = foto;
    const guardado = await s.guardar({ titulo, lema, texto, imagen: aImagen(foto) }, async () => {
      subida = await subirFoto(foto);
      setFoto(subida); // si el guardado falla, al reintentar no se vuelve a subir
      return { titulo, lema, texto, imagen: aImagen(subida) };
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
          <CardDescription>El recuadro que presenta a la tienda, sobre un fondo de color o sobre una foto.</CardDescription>
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
              <Campo {...s.campo("lema")} etiqueta="Lema (opcional)">
                <Input
                  {...s.entrada("lema")}
                  maxLength={LARGO.lema}
                  value={lema}
                  onChange={(e) => {
                    setLema(e.target.value);
                    s.editado("lema");
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
            </div>
            <div className="min-w-0 border-t pt-5 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-8">
              <CampoFoto s={s} ruta="imagen" nombre="foto-nosotros" sinFoto="Sin foto se ve el fondo de color." foto={foto} onChange={setFoto} />
            </div>
          </div>
        </CardContent>
        <PieSeccion estado={s.estado} texto="Guardar quiénes somos" />
      </Card>
    </form>
  );
}
