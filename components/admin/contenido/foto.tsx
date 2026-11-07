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

// El video no se puede reducir en el navegador: se sube tal cual, por eso se limita su peso.
// MP4 y WebM son los que se reproducen en todos los navegadores (el MOV del iPhone no).
const TIPOS_VIDEO = ["video/mp4", "video/webm"];
const TAMANO_MAXIMO_VIDEO = 50 * 1024 * 1024;

export type FotoFormulario = {
  key: string | null; // ruta en S3; null mientras no se haya subido
  archivo: File | null;
  vistaPrevia: string;
  esVideo?: boolean; // solo en los campos con `conVideo`
};

export const aFormulario = (imagen: Imagen | null, vistasPrevias: Record<string, string>, esVideo = false): FotoFormulario | null =>
  imagen && { key: imagen.key, archivo: null, vistaPrevia: vistasPrevias[imagen.key] ?? "", esVideo };

// La ruta se conoce al subirla: hasta entonces va vacía
export const aImagen = (foto: FotoFormulario | null): Imagen | null => foto && { key: foto.key ?? "" };

// Sube la foto o el video si es nuevo y lo devuelve con su ruta
export async function subirFoto(foto: FotoFormulario | null, carpeta = CARPETA_IMAGENES): Promise<FotoFormulario | null> {
  if (!foto?.archivo) return foto;
  try {
    const { blob, extension } = foto.esVideo
      ? { blob: foto.archivo, extension: foto.archivo.type === "video/webm" ? "webm" : "mp4" }
      : await reducirImagen(foto.archivo, ANCHO_FOTO);
    const { path } = await uploadData({
      path: `${carpeta}${crypto.randomUUID()}.${extension}`,
      data: blob,
      options: { contentType: blob.type },
    }).result;
    return { ...foto, key: path, archivo: null };
  } catch (error) {
    console.error("No se pudo subir el archivo:", error);
    throw new Error(`${foto.esVideo ? "No se pudo subir el video" : "No se pudieron subir las fotos"}. Revisa tu conexión e inténtalo de nuevo.`);
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
// imagen en la sección, por ejemplo "gala.imagen". Con `conVideo` acepta también un video.
export function CampoFoto({
  s,
  ruta,
  nombre,
  sinFoto,
  foto,
  onChange,
  recomendacion,
  etiqueta = "Foto (opcional)",
  vertical = false,
  conVideo = false,
}: {
  s: Controles;
  ruta: string;
  nombre: string; // del control de archivo
  sinFoto: string; // qué se ve mientras no haya foto
  foto: FotoFormulario | null;
  onChange: (foto: FotoFormulario | null) => void;
  recomendacion?: string; // aviso que no bloquea, como la medida ideal
  etiqueta?: string;
  vertical?: boolean; // la vista previa con la forma de una foto para celular
  conVideo?: boolean;
}) {
  const selector = useRef<HTMLInputElement>(null);
  const error = s.errores[ruta];
  const queSube = conVideo ? "foto o video" : "foto";

  function elegir(archivo: File | undefined) {
    if (!archivo) return;
    const esVideo = conVideo && TIPOS_VIDEO.includes(archivo.type);
    if (!esVideo && !TIPOS_IMAGEN.includes(archivo.type)) {
      return s.setErrores((e) => ({ ...e, [ruta]: `«${archivo.name}» no es JPG, PNG ni WebP${conVideo ? ", ni un video MP4 o WebM" : ""}.` }));
    }
    if (archivo.size > (esVideo ? TAMANO_MAXIMO_VIDEO : TAMANO_MAXIMO)) {
      return s.setErrores((e) => ({ ...e, [ruta]: `«${archivo.name}» pesa más de ${esVideo ? 50 : 10} MB.` }));
    }
    if (foto?.archivo) URL.revokeObjectURL(foto.vistaPrevia);
    onChange({ key: null, archivo, vistaPrevia: URL.createObjectURL(archivo), esVideo });
    s.editado(ruta);
  }

  function quitar() {
    if (foto?.archivo) URL.revokeObjectURL(foto.vistaPrevia);
    onChange(null);
    s.editado(ruta);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{etiqueta}</p>
      <div className="flex flex-wrap items-start gap-4">
        <div className={`relative shrink-0 overflow-hidden rounded-md border bg-muted ${vertical ? "aspect-[4/5] w-36" : "aspect-[4/3] w-44"}`}>
          {foto?.vistaPrevia ? (
            foto.esVideo ? (
              <video src={foto.vistaPrevia} muted playsInline controls preload="metadata" className="absolute inset-0 size-full object-cover" />
            ) : (
              <Image src={foto.vistaPrevia} alt="" fill unoptimized sizes="176px" className="object-cover" />
            )
          ) : (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 text-center text-xs text-muted-foreground">
              <ImageIcon className="size-6" />
              {foto ? "Vista previa no disponible" : conVideo ? "Sin foto ni video" : "Sin foto"}
            </span>
          )}
          {foto && !foto.key && (
            <Badge variant="secondary" className={`absolute left-2 ${foto.esVideo ? "top-2" : "bottom-2"}`}>
              Se sube al guardar
            </Badge>
          )}
        </div>
        <div className="min-w-0 flex-1 basis-48 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => selector.current?.click()}>
              <Upload />
              {foto ? `Cambiar ${queSube}` : `Subir ${queSube}`}
            </Button>
            {foto && (
              <Button type="button" variant="ghost" onClick={quitar}>
                <X />
                {foto.esVideo ? "Quitar video" : "Quitar foto"}
              </Button>
            )}
          </div>
          <input
            ref={selector}
            name={nombre}
            type="file"
            accept={(conVideo ? [...TIPOS_IMAGEN, ...TIPOS_VIDEO] : TIPOS_IMAGEN).join(",")}
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
            <p className="text-sm text-muted-foreground">
              {sinFoto} JPG, PNG o WebP de hasta 10 MB{conVideo && "; video MP4 o WebM de hasta 50 MB"}.
            </p>
          )}
          {recomendacion && <p className="text-sm text-muted-foreground">{recomendacion}</p>}
        </div>
      </div>
    </div>
  );
}
