"use client";

import Image from "next/image";
import { useRef } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import { remove, uploadData } from "aws-amplify/storage";
import { TIPOS_IMAGEN, reducirImagen } from "@/components/admin/editor-imagenes";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { CARPETA_IMAGENES, type Imagen } from "@/lib/contenido";
import type { Controles } from "./comun";

// La foto se reduce antes de subirla: la tienda no necesita más de 2000 px de ancho
const TAMANO_MAXIMO = 10 * 1024 * 1024;
const ANCHO_FOTO = 2000;

export type FotoFormulario = {
  key: string | null; // ruta en S3; null mientras no se haya subido
  archivo: File | null;
  vistaPrevia: string;
};

export const aFormulario = (imagen: Imagen | null, vistasPrevias: Record<string, string>): FotoFormulario | null =>
  imagen && { key: imagen.key, archivo: null, vistaPrevia: vistasPrevias[imagen.key] ?? "" };

// La ruta se conoce al subirla: hasta entonces va vacía
export const aImagen = (foto: FotoFormulario | null): Imagen | null => foto && { key: foto.key ?? "" };

// Sube la foto si es nueva y la devuelve con su ruta
export async function subirFoto(foto: FotoFormulario | null, carpeta = CARPETA_IMAGENES): Promise<FotoFormulario | null> {
  if (!foto?.archivo) return foto;
  try {
    const { blob, extension } = await reducirImagen(foto.archivo, ANCHO_FOTO);
    const { path } = await uploadData({
      path: `${carpeta}${crypto.randomUUID()}.${extension}`,
      data: blob,
      options: { contentType: blob.type },
    }).result;
    return { ...foto, key: path, archivo: null };
  } catch (error) {
    console.error("No se pudo subir la foto:", error);
    throw new Error("No se pudieron subir las fotos. Revisa tu conexión e inténtalo de nuevo.");
  }
}

const rutasDe = (fotos: ({ key: string | null } | null)[]) => new Set(fotos.flatMap((f) => (f?.key ? [f.key] : [])));

// Recuerda las fotos de la versión guardada. Después de guardar se le pasan las que quedaron
// en uso y borra de S3 las demás.
export function useFotosGuardadas(iniciales: (Imagen | null)[]) {
  const guardadas = useRef(rutasDe(iniciales));
  return async (enUso: (FotoFormulario | null)[]) => {
    const actuales = rutasDe(enUso);
    const sobrantes = Array.from(guardadas.current).filter((ruta) => !actuales.has(ruta));
    guardadas.current = actuales;
    await Promise.allSettled(sobrantes.map((path) => remove({ path })));
  };
}

// Vista previa y botones para subir y quitar la foto. `ruta` es la del campo
// imagen en la sección, por ejemplo "gala.imagen".
export function CampoFoto({
  s,
  ruta,
  nombre,
  sinFoto,
  foto,
  onChange,
  recomendacion,
}: {
  s: Controles;
  ruta: string;
  nombre: string; // del control de archivo
  sinFoto: string; // qué se ve mientras no haya foto
  foto: FotoFormulario | null;
  onChange: (foto: FotoFormulario | null) => void;
  recomendacion?: string; // aviso que no bloquea, como la medida ideal
}) {
  const selector = useRef<HTMLInputElement>(null);
  const error = s.errores[ruta];

  function elegir(archivo: File | undefined) {
    if (!archivo) return;
    if (!TIPOS_IMAGEN.includes(archivo.type)) {
      return s.setErrores((e) => ({ ...e, [ruta]: `«${archivo.name}» no es JPG, PNG ni WebP.` }));
    }
    if (archivo.size > TAMANO_MAXIMO) {
      return s.setErrores((e) => ({ ...e, [ruta]: `«${archivo.name}» pesa más de 10 MB.` }));
    }
    if (foto?.archivo) URL.revokeObjectURL(foto.vistaPrevia);
    onChange({ key: null, archivo, vistaPrevia: URL.createObjectURL(archivo) });
    s.editado(ruta);
  }

  function quitar() {
    if (foto?.archivo) URL.revokeObjectURL(foto.vistaPrevia);
    onChange(null);
    s.editado(ruta);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Foto (opcional)</p>
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative aspect-[4/3] w-44 shrink-0 overflow-hidden rounded-md border bg-muted">
          {foto?.vistaPrevia ? (
            <Image src={foto.vistaPrevia} alt="" fill unoptimized sizes="176px" className="object-cover" />
          ) : (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 text-center text-xs text-muted-foreground">
              <ImageIcon className="size-6" />
              {foto ? "Vista previa no disponible" : "Sin foto"}
            </span>
          )}
          {foto && !foto.key && (
            <Badge variant="secondary" className="absolute bottom-2 left-2">
              Se sube al guardar
            </Badge>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => selector.current?.click()}>
              <Upload />
              {foto ? "Cambiar foto" : "Subir foto"}
            </Button>
            {foto && (
              <Button type="button" variant="ghost" onClick={quitar}>
                <X />
                Quitar foto
              </Button>
            )}
          </div>
          <input
            ref={selector}
            name={nombre}
            type="file"
            accept={TIPOS_IMAGEN.join(",")}
            hidden
            onChange={(e) => {
              elegir(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">{sinFoto} JPG, PNG o WebP de hasta 10 MB.</p>
          )}
          {recomendacion && <p className="text-sm text-muted-foreground">{recomendacion}</p>}
        </div>
      </div>
    </div>
  );
}
