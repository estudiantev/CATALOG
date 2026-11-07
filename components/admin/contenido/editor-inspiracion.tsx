"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { LARGO, type SeccionContenido } from "@/lib/contenido";
import { Campo, CamposEnlace, CasillaVisible, PieSeccion, useSeccion } from "./comun";
import { CampoFoto, type FotoFormulario, aFormulario, aImagen, subirFoto, useFotosGuardadas } from "./foto";

// Un solo archivo: según lo que sea va en `video` o en `imagen`
const aDatos = (medio: FotoFormulario | null) => ({
  imagen: medio?.esVideo ? null : aImagen(medio),
  video: medio?.esVideo ? aImagen(medio) : null,
});

export function EditorInspiracion({
  inicial,
  vistasPrevias,
}: {
  inicial: SeccionContenido<"inspiracion">;
  vistasPrevias: Record<string, string>; // URL firmada de cada foto o video guardado
}) {
  const s = useSeccion("inspiracion", inicial);
  const [antetitulo, setAntetitulo] = useState(inicial.datos.antetitulo);
  const [texto, setTexto] = useState(inicial.datos.texto);
  const [boton, setBoton] = useState(inicial.datos.boton);
  const [medio, setMedio] = useState(() => aFormulario(inicial.datos.video, vistasPrevias, true) ?? aFormulario(inicial.datos.imagen, vistasPrevias));
  const limpiarFotos = useFotosGuardadas([inicial.datos.imagen, inicial.datos.video]);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let subido = medio;
    const guardado = await s.guardar({ antetitulo, texto, boton, ...aDatos(medio) }, async () => {
      subido = await subirFoto(medio);
      setMedio(subido); // si el guardado falla, al reintentar no se vuelve a subir
      return { antetitulo, texto, boton, ...aDatos(subido) };
    });
    if (guardado) await limpiarFotos([subido]);
  }

  return (
    <form noValidate onSubmit={enviar}>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Inspiración</h2>
          </CardTitle>
          <CardDescription>Un texto con un botón al lado de una foto o un video.</CardDescription>
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
              <CampoFoto
                s={s}
                ruta="imagen"
                nombre="foto-inspiracion"
                etiqueta="Foto o video (opcional)"
                sinFoto="Sin foto ni video se ven las ilustraciones de vestidos."
                recomendacion="El espacio es casi cuadrado: lo que quede fuera se recorta por los lados o por arriba y abajo. El video se reproduce solo, en bucle y sin sonido."
                foto={medio}
                onChange={setMedio}
                conVideo
              />
            </div>
          </div>
        </CardContent>
        <PieSeccion estado={s.estado} texto="Guardar inspiración" />
      </Card>
    </form>
  );
}
