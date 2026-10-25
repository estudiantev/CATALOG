"use client";

import Image from "next/image";
import { useRef } from "react";
import { ImageIcon, Star, Upload, X } from "lucide-react";
import { uploadData } from "aws-amplify/storage";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { carpetaImagenes } from "@/lib/productos";

const TAMANO_MAXIMO = 5 * 1024 * 1024;
// Formatos que todos los navegadores muestran (HEIC, por ejemplo, no se ve en Chrome)
const TIPOS = ["image/jpeg", "image/png", "image/webp"];

export type ImagenFormulario = {
  id: string;
  // Ruta en S3; null mientras la foto no se haya subido
  key: string | null;
  archivo: File | null;
  vistaPrevia: string;
  alt: string;
  isPrimary: boolean;
  color: string | null;
};

// Sube a S3 las fotos nuevas y devuelve la lista con sus rutas, en el orden en que se ven
export async function subirImagenes(productId: string, imagenes: ImagenFormulario[]) {
  const hayPrincipal = imagenes.some((imagen) => imagen.isPrimary);
  return Promise.all(
    imagenes.map(async (imagen, posicion) => {
      let key = imagen.key;
      if (imagen.archivo) {
        const extension = imagen.archivo.name.split(".").pop()?.toLowerCase() ?? "";
        const ruta = `${carpetaImagenes(productId)}${crypto.randomUUID()}.${/^[a-z0-9]{1,5}$/.test(extension) ? extension : "jpg"}`;
        const { path } = await uploadData({
          path: ruta,
          data: imagen.archivo,
          options: { contentType: imagen.archivo.type },
        }).result;
        key = path;
      }
      return {
        ...imagen,
        key: key as string,
        archivo: null,
        isPrimary: hayPrincipal ? imagen.isPrimary : posicion === 0,
      };
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

  function agregar(archivos: FileList | null) {
    onError("");
    const validos = Array.from(archivos ?? []).filter((archivo) => {
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
    const nuevas = validos.map((archivo) => ({
      id: crypto.randomUUID(),
      key: null,
      archivo,
      vistaPrevia: URL.createObjectURL(archivo),
      alt: "",
      isPrimary: false,
      color: null,
    }));
    const todas = [...imagenes, ...nuevas];
    // La primera foto del producto queda como principal
    if (todas.length > 0 && !todas.some((imagen) => imagen.isPrimary)) todas[0] = { ...todas[0], isPrimary: true };
    onChange(todas);
    if (selector.current) selector.current.value = "";
  }

  function quitar(id: string) {
    const imagen = imagenes.find((i) => i.id === id);
    if (imagen?.archivo) URL.revokeObjectURL(imagen.vistaPrevia);
    const restantes = imagenes.filter((i) => i.id !== id);
    if (imagen?.isPrimary && restantes.length > 0) restantes[0] = { ...restantes[0], isPrimary: true };
    onChange(restantes);
  }

  const cambiar = (id: string, cambios: Partial<ImagenFormulario>) =>
    onChange(imagenes.map((imagen) => (imagen.id === id ? { ...imagen, ...cambios } : imagen)));

  return (
    <div className="space-y-4">
      {imagenes.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {imagenes.map((imagen) => (
            <li key={imagen.id} className="space-y-2">
              <div className="relative aspect-[3/4] overflow-hidden rounded-md border bg-muted">
                {imagen.vistaPrevia ? (
                  <Image src={imagen.vistaPrevia} alt={imagen.alt} fill unoptimized sizes="200px" className="object-cover" />
                ) : (
                  <ImageIcon className="absolute inset-0 m-auto size-8 text-muted-foreground" />
                )}
                {imagen.isPrimary && <Badge className="absolute top-2 left-2">Principal</Badge>}
                {!imagen.key && <Badge variant="secondary" className="absolute bottom-2 left-2">Sin subir</Badge>}
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  aria-label="Quitar imagen"
                  className="absolute top-2 right-2"
                  onClick={() => quitar(imagen.id)}
                >
                  <X />
                </Button>
              </div>
              <Input
                aria-label="Texto alternativo"
                placeholder="Descripción de la foto"
                value={imagen.alt}
                onChange={(e) => cambiar(imagen.id, { alt: e.target.value })}
              />
              {!imagen.isPrimary && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => onChange(imagenes.map((i) => ({ ...i, isPrimary: i.id === imagen.id })))}
                >
                  <Star />
                  Hacer principal
                </Button>
              )}
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
      <Button type="button" variant="outline" onClick={() => selector.current?.click()}>
        <Upload />
        Agregar imágenes
      </Button>
    </div>
  );
}
