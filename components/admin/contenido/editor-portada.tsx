"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, ImageIcon, Plus, Trash2, Upload, X } from "lucide-react";
import { remove, uploadData } from "aws-amplify/storage";
import { TIPOS_IMAGEN, reducirImagen } from "@/components/admin/editor-imagenes";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import {
  type Boton,
  CARPETA_IMAGENES,
  type Diapositiva,
  type Imagen,
  LARGO,
  MAXIMO_DIAPOSITIVAS,
  type SeccionContenido,
} from "@/lib/contenido";
import { Campo, PieSeccion, useSeccion } from "./comun";

// La foto se reduce antes de subirla: la portada no necesita más de 2000 px de ancho
const TAMANO_MAXIMO = 10 * 1024 * 1024;
const ANCHO_FOTO = 2000;

type FotoFormulario = {
  key: string | null; // ruta en S3; null mientras no se haya subido
  archivo: File | null;
  vistaPrevia: string;
  alt: string;
};
type DiapositivaFormulario = Omit<Diapositiva, "imagen"> & { id: string; imagen: FotoFormulario | null };
type CualBoton = "botonPrincipal" | "botonSecundario";

const NUEVA: Omit<Diapositiva, "imagen"> = {
  antetitulo: "",
  titulo: "",
  texto: "",
  botonPrincipal: { texto: "Comprar", enlace: "/catalogo" },
  botonSecundario: { texto: "", enlace: "" },
};

// Sugerencias para los enlaces de los botones (se puede escribir cualquier otro válido)
const ENLACES_SUGERIDOS = [
  { valor: "/catalogo", nombre: "Catálogo completo" },
  { valor: "/catalogo?coleccion=gala", nombre: "Vestidos de gala" },
  { valor: "/catalogo?coleccion=xv", nombre: "Vestidos de XV" },
  { valor: "/catalogo?coleccion=cortos", nombre: "Vestidos cortos" },
  { valor: "/catalogo?coleccion=floreados", nombre: "Vestidos floreados" },
  { valor: "#pasos", nombre: "Sección Alquiler en 3 pasos" },
  { valor: "#catalogo", nombre: "Sección Nuestro catálogo" },
];

const aDatos = (d: DiapositivaFormulario, imagen: Imagen | null): Diapositiva => ({
  antetitulo: d.antetitulo,
  titulo: d.titulo,
  texto: d.texto,
  botonPrincipal: d.botonPrincipal,
  botonSecundario: d.botonSecundario,
  imagen,
});

const rutasDe = (lista: { imagen: { key: string | null } | null }[]) =>
  new Set(lista.flatMap((d) => (d.imagen?.key ? [d.imagen.key] : [])));

// Sube a S3 las fotos nuevas y devuelve las portadas con sus rutas
async function subirFotos(lista: DiapositivaFormulario[]) {
  try {
    return await Promise.all(
      lista.map(async (d) => {
        if (!d.imagen?.archivo) return d;
        const { blob, extension } = await reducirImagen(d.imagen.archivo, ANCHO_FOTO);
        const { path } = await uploadData({
          path: `${CARPETA_IMAGENES}${crypto.randomUUID()}.${extension}`,
          data: blob,
          options: { contentType: blob.type },
        }).result;
        return { ...d, imagen: { ...d.imagen, key: path, archivo: null } };
      }),
    );
  } catch (error) {
    console.error("No se pudieron subir las fotos de la portada:", error);
    throw new Error("No se pudieron subir las fotos. Revisa tu conexión e inténtalo de nuevo.");
  }
}

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
      imagen: imagen ? { key: imagen.key, archivo: null, vistaPrevia: vistasPrevias[imagen.key] ?? "", alt: imagen.alt } : null,
    })),
  );
  // Fotos de la versión guardada: al guardar, las que ya no se usan se borran de S3
  const guardadas = useRef(rutasDe(inicial.datos.diapositivas));
  // Selector de archivo de cada portada (oculto; lo abre el botón "Subir foto")
  const selectores = useRef<Record<string, HTMLInputElement | null>>({});

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

  function elegirFoto(indice: number, archivo: File | undefined) {
    if (!archivo) return;
    const ruta = `diapositivas.${indice}.imagen`;
    if (!TIPOS_IMAGEN.includes(archivo.type)) {
      return s.setErrores((e) => ({ ...e, [ruta]: `«${archivo.name}» no es JPG, PNG ni WebP.` }));
    }
    if (archivo.size > TAMANO_MAXIMO) {
      return s.setErrores((e) => ({ ...e, [ruta]: `«${archivo.name}» pesa más de 10 MB.` }));
    }
    const anterior = diapositivas[indice].imagen;
    if (anterior?.archivo) URL.revokeObjectURL(anterior.vistaPrevia);
    cambiar(indice, { imagen: { key: null, archivo, vistaPrevia: URL.createObjectURL(archivo), alt: anterior?.alt ?? "" } }, "imagen");
  }

  function quitarFoto(indice: number) {
    const foto = diapositivas[indice].imagen;
    if (foto?.archivo) URL.revokeObjectURL(foto.vistaPrevia);
    cambiar(indice, { imagen: null }, "imagen.alt");
  }

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Para validar basta con la descripción de cada foto; la ruta se conoce al subirla
    const paraValidar = {
      diapositivas: diapositivas.map((d) => aDatos(d, d.imagen ? { key: d.imagen.key ?? "", alt: d.imagen.alt } : null)),
    };
    let subidas = diapositivas;
    const guardado = await s.guardar(paraValidar, async () => {
      subidas = await subirFotos(diapositivas);
      setDiapositivas(subidas); // si el guardado falla, al reintentar no se vuelven a subir
      return {
        diapositivas: subidas.map((d) => aDatos(d, d.imagen?.key ? { key: d.imagen.key, alt: d.imagen.alt } : null)),
      };
    });
    if (!guardado) return;

    const enUso = rutasDe(subidas);
    const sobrantes = Array.from(guardadas.current).filter((ruta) => !enUso.has(ruta));
    guardadas.current = enUso;
    await Promise.allSettled(sobrantes.map((path) => remove({ path })));
  }

  const campoBoton = (i: number, cual: CualBoton, etiqueta: string, opcional: boolean) => {
    const ruta = `diapositivas.${i}.${cual}`;
    const boton = diapositivas[i][cual];
    return (
      <>
        <Campo {...s.campo(`${ruta}.texto`)} etiqueta={etiqueta} ayuda={opcional ? "Déjalo vacío si no quieres un segundo botón." : undefined}>
          <Input
            {...s.entrada(`${ruta}.texto`, opcional)}
            maxLength={LARGO.boton}
            value={boton.texto}
            onChange={(e) => cambiarBoton(i, cual, "texto", e.target.value)}
          />
        </Campo>
        <Campo {...s.campo(`${ruta}.enlace`)} etiqueta="Lleva a" ayuda="Una página (/catalogo), una sección (#pasos) o una dirección https://">
          <Input
            {...s.entrada(`${ruta}.enlace`, true)}
            list="enlaces-portada"
            maxLength={LARGO.enlace}
            spellCheck={false}
            autoCapitalize="none"
            value={boton.enlace}
            onChange={(e) => cambiarBoton(i, cual, "enlace", e.target.value)}
          />
        </Campo>
      </>
    );
  };

  return (
    <form noValidate onSubmit={enviar}>
      <datalist id="enlaces-portada">
        {ENLACES_SUGERIDOS.map((enlace) => (
          <option key={enlace.valor} value={enlace.valor}>
            {enlace.nombre}
          </option>
        ))}
      </datalist>
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
            const errorFoto = s.errores[`${ruta}.imagen`];
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

                <div className="space-y-3 border-t pt-4">
                  <p className="text-sm font-medium">Foto (opcional)</p>
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="relative aspect-[4/3] w-44 shrink-0 overflow-hidden rounded-md border bg-muted">
                      {d.imagen?.vistaPrevia ? (
                        <Image src={d.imagen.vistaPrevia} alt="" fill unoptimized sizes="176px" className="object-cover" />
                      ) : (
                        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 text-center text-xs text-muted-foreground">
                          <ImageIcon className="size-6" />
                          {d.imagen ? "Vista previa no disponible" : "Sin foto"}
                        </span>
                      )}
                      {d.imagen && !d.imagen.key && (
                        <Badge variant="secondary" className="absolute bottom-2 left-2">
                          Se sube al guardar
                        </Badge>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" onClick={() => selectores.current[d.id]?.click()}>
                          <Upload />
                          {d.imagen ? "Cambiar foto" : "Subir foto"}
                        </Button>
                        {d.imagen && (
                          <Button type="button" variant="ghost" onClick={() => quitarFoto(i)}>
                            <X />
                            Quitar foto
                          </Button>
                        )}
                      </div>
                      <input
                        ref={(elemento) => {
                          selectores.current[d.id] = elemento;
                        }}
                        name={`foto-${i + 1}`}
                        type="file"
                        accept={TIPOS_IMAGEN.join(",")}
                        hidden
                        onChange={(e) => {
                          elegirFoto(i, e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                      {errorFoto ? (
                        <p role="alert" className="text-sm text-destructive">
                          {errorFoto}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Sin foto se ven las ilustraciones de vestidos. JPG, PNG o WebP de hasta 10 MB.</p>
                      )}
                    </div>
                  </div>
                  {d.imagen && (
                    <Campo
                      {...s.campo(`${ruta}.imagen.alt`)}
                      etiqueta="Descripción de la foto"
                      ayuda="Para quienes no pueden verla, por ejemplo «Modelo con un vestido de gala esmeralda»."
                    >
                      <Input
                        {...s.entrada(`${ruta}.imagen.alt`, true)}
                        maxLength={LARGO.alt}
                        value={d.imagen.alt}
                        onChange={(e) => cambiar(i, { imagen: { ...d.imagen!, alt: e.target.value } }, "imagen.alt")}
                      />
                    </Campo>
                  )}
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
