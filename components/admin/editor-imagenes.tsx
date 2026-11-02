"use client";

import Image from "next/image";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, Upload, X } from "lucide-react";
import { uploadData } from "aws-amplify/storage";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { carpetaImagenes } from "@/lib/productos";

const TAMANO_MAXIMO = 5 * 1024 * 1024;
// Formatos que todos los navegadores muestran (HEIC, por ejemplo, no se ve en Chrome)
const TIPOS = ["image/jpeg", "image/png", "image/webp"];
export const MAXIMO_FOTOS = 6;
// Ancho de la versión liviana que usa el catálogo
const ANCHO_MINIATURA = 600;

export type ImagenFormulario = {
  id: string;
  // Rutas en S3; null mientras la foto no se haya subido
  key: string | null;
  thumbKey: string | null;
  archivo: File | null;
  vistaPrevia: string;
  alt: string;
};

const ETIQUETAS = ["Portada", "Contraportada"];

// Versión liviana de una foto: 600 px de ancho en WebP (JPEG si el navegador no sabe hacer WebP)
async function crearMiniatura(archivo: File) {
  const imagen = await createImageBitmap(archivo);
  const escala = Math.min(1, ANCHO_MINIATURA / imagen.width);
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(imagen.width * escala);
  lienzo.height = Math.round(imagen.height * escala);
  lienzo.getContext("2d")!.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  imagen.close();
  const comoBlob = (tipo: string) =>
    new Promise<Blob | null>((resolve) => lienzo.toBlob(resolve, tipo, 0.8));
  const webp = await comoBlob("image/webp");
  if (webp?.type === "image/webp") return { blob: webp, extension: "webp" };
  const jpeg = await comoBlob("image/jpeg");
  if (!jpeg) throw new Error("No se pudo crear la miniatura.");
  return { blob: jpeg, extension: "jpg" };
}

// Sube a S3 las fotos nuevas (grande + liviana) y devuelve la lista con sus rutas, en orden
export async function subirImagenes(productId: string, imagenes: ImagenFormulario[]) {
  return Promise.all(
    imagenes.map(async (imagen) => {
      if (!imagen.archivo) return imagen;
      const nombre = `${carpetaImagenes(productId)}${crypto.randomUUID()}`;
      const extension = imagen.archivo.name.split(".").pop()?.toLowerCase() ?? "";
      const miniatura = await crearMiniatura(imagen.archivo);
      const [grande, liviana] = await Promise.all([
        uploadData({
          path: `${nombre}.${/^[a-z0-9]{1,5}$/.test(extension) ? extension : "jpg"}`,
          data: imagen.archivo,
          options: { contentType: imagen.archivo.type },
        }).result,
        uploadData({
          path: `${nombre}-thumb.${miniatura.extension}`,
          data: miniatura.blob,
          options: { contentType: miniatura.blob.type },
        }).result,
      ]);
      return { ...imagen, key: grande.path, thumbKey: liviana.path, archivo: null };
    }),
  );
}

export function EditorImagenes({
  imagenes,
  onChange,
  onError,
}: {
  imagenes: ImagenFormulario[];
  onChange: (imagenes: ImagenFormulario[]) => void;
  onError: (mensaje: string) => void;
}) {
  const selector = useRef<HTMLInputElement>(null);
  const espacio = MAXIMO_FOTOS - imagenes.length;

  function agregar(archivos: FileList | null) {
    onError("");
    const elegidos = Array.from(archivos ?? []);
    if (elegidos.length > espacio) onError(`Cada variante lleva hasta ${MAXIMO_FOTOS} fotos; se agregaron las primeras ${espacio}.`);
    const validos = elegidos.slice(0, espacio).filter((archivo) => {
      if (!TIPOS.includes(archivo.type)) {
        onError(`«${archivo.name}» no es JPG, PNG ni WebP.`);
        return false;
      }
      if (archivo.size > TAMANO_MAXIMO) {
        onError(`«${archivo.name}» pesa más de 5 MB.`);
        return false;
      }
      return true;
    });
    onChange([
      ...imagenes,
      ...validos.map((archivo) => ({
        id: crypto.randomUUID(),
        key: null,
        thumbKey: null,
        archivo,
        vistaPrevia: URL.createObjectURL(archivo),
        alt: "",
      })),
    ]);
    if (selector.current) selector.current.value = "";
  }

  function quitar(id: string) {
    const imagen = imagenes.find((i) => i.id === id);
    if (imagen?.archivo) URL.revokeObjectURL(imagen.vistaPrevia);
    onChange(imagenes.filter((i) => i.id !== id));
  }

  // El orden es el de la galería: la 1 es la portada y la 2 la contraportada
  function mover(indice: number, paso: -1 | 1) {
    const nuevas = [...imagenes];
    [nuevas[indice], nuevas[indice + paso]] = [nuevas[indice + paso], nuevas[indice]];
    onChange(nuevas);
  }

  return (
    <div className="space-y-4">
      {imagenes.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {imagenes.map((imagen, i) => (
            <li key={imagen.id} className="space-y-2">
              <div className="relative aspect-[3/4] overflow-hidden rounded-md border bg-muted">
                {imagen.vistaPrevia ? (
                  <Image src={imagen.vistaPrevia} alt={imagen.alt} fill unoptimized sizes="200px" className="object-cover" />
                ) : (
                  <ImageIcon className="absolute inset-0 m-auto size-8 text-muted-foreground" />
                )}
                <Badge className="absolute top-2 left-2">{ETIQUETAS[i] ?? `Foto ${i + 1}`}</Badge>
                {!imagen.key && <Badge variant="secondary" className="absolute bottom-2 left-2">Sin subir</Badge>}
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  aria-label={`Quitar foto ${i + 1}`}
                  className="absolute top-2 right-2"
                  onClick={() => quitar(imagen.id)}
                >
                  <X />
                </Button>
              </div>
              <Input
                aria-label={`Texto alternativo de la foto ${i + 1}`}
                placeholder="Descripción de la foto"
                value={imagen.alt}
                onChange={(e) => onChange(imagenes.map((x) => (x.id === imagen.id ? { ...x, alt: e.target.value } : x)))}
              />
              <div className="flex justify-between">
                <Button type="button" variant="ghost" size="icon-sm" aria-label={`Mover foto ${i + 1} antes`} disabled={i === 0} onClick={() => mover(i, -1)}>
                  <ChevronLeft />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" aria-label={`Mover foto ${i + 1} después`} disabled={i === imagenes.length - 1} onClick={() => mover(i, 1)}>
                  <ChevronRight />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <input
        ref={selector}
        type="file"
        accept={TIPOS.join(",")}
        multiple
        hidden
        onChange={(e) => agregar(e.target.files)}
      />
      <Button type="button" variant="outline" disabled={espacio <= 0} onClick={() => selector.current?.click()}>
        <Upload />
        {espacio > 0 ? `Agregar fotos (quedan ${espacio})` : `Ya tiene ${MAXIMO_FOTOS} fotos`}
      </Button>
    </div>
  );
}
