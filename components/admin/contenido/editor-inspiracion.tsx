"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { LARGO, type SeccionContenido } from "@/lib/contenido";
import { Campo, CamposEnlace, CasillaVisible, PieSeccion, useSeccion } from "./comun";
import { CampoFoto, aFormulario, aImagen, subirFoto, useFotosGuardadas } from "./foto";

export function EditorInspiracion({
  inicial,
  vistasPrevias,
}: {
  inicial: SeccionContenido<"inspiracion">;
  vistasPrevias: Record<string, string>; // URL firmada de cada foto guardada
}) {
  const s = useSeccion("inspiracion", inicial);
  const [antetitulo, setAntetitulo] = useState(inicial.datos.antetitulo);
  const [texto, setTexto] = useState(inicial.datos.texto);
  const [boton, setBoton] = useState(inicial.datos.boton);
  const [foto, setFoto] = useState(() => aFormulario(inicial.datos.imagen, vistasPrevias));
  const limpiarFotos = useFotosGuardadas([inicial.datos.imagen]);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let subida = foto;
    const guardado = await s.guardar({ antetitulo, texto, boton, imagen: aImagen(foto) }, async () => {
      subida = await subirFoto(foto);
      setFoto(subida); // si el guardado falla, al reintentar no se vuelve a subir
      return { antetitulo, texto, boton, imagen: aImagen(subida) };
    });
    if (guardado) await limpiarFotos([subida]);
  }

  return (
    <form noValidate onSubmit={enviar}>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Inspiración</h2>
          </CardTitle>
          <CardDescription>Un texto con un botón al lado de una foto grande.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CasillaVisible id="inspiracion-visible" visible={s.visible} onChange={s.cambiarVisible} />
          <div className="grid gap-x-8 gap-y-5 xl:grid-cols-2">
            <div className="min-w-0 space-y-6">
              <Campo {...s.campo("antetitulo")} etiqueta="Antetítulo (opcional)" ayuda="El texto pequeño sobre el texto principal.">
                <Input
                  {...s.entrada("antetitulo", true)}
                  maxLength={LARGO.antetitulo}
                  value={antetitulo}
                  onChange={(e) => {
                    setAntetitulo(e.target.value);
                    s.editado("antetitulo");
                  }}
                />
              </Campo>
              <Campo {...s.campo("texto")} etiqueta="Texto">
                <Textarea
                  {...s.entrada("texto")}
                  maxLength={LARGO.textoInspiracion}
                  rows={2}
                  value={texto}
                  onChange={(e) => {
                    setTexto(e.target.value);
                    s.editado("texto");
                  }}
                />
              </Campo>
              <div className="grid gap-4 sm:grid-cols-2">
                <CamposEnlace
                  s={s}
                  ruta="boton"
                  etiqueta="Botón"
                  boton={boton}
                  onChange={(campo, valor) => {
                    setBoton((actual) => ({ ...actual, [campo]: valor }));
                    s.editado(`boton.${campo}`);
                  }}
                />
              </div>
            </div>
            <div className="min-w-0 border-t pt-5 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-8">
              <CampoFoto s={s} ruta="imagen" nombre="foto-inspiracion" sinFoto="Sin foto se ven las ilustraciones de vestidos." foto={foto} onChange={setFoto} />
            </div>
          </div>
        </CardContent>
        <PieSeccion estado={s.estado} texto="Guardar inspiración" />
      </Card>
    </form>
  );
}
