"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUrl, remove } from "aws-amplify/storage";
import { recalcularResumen } from "@/app/(admin)/admin/(panel)/productos/acciones";
import { EditorImagenes, type ImagenFormulario, subirImagenes } from "@/components/admin/editor-imagenes";
import { rutasEnUso } from "@/components/admin/variantes-producto";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { cargarVariantes, clienteDatos, mensajeErrorDatos } from "@/components/admin/datos";
import {
  ESCOTES,
  FAMILIAS_COLOR,
  type FamiliaColor,
  LARGOS,
  MANGAS,
  SILUETAS,
  TALLAS,
  type Talla,
  type Variante,
  describirOpciones,
  formatoSoles,
  opcionesDeVariante,
} from "@/lib/productos";
import { fotosOrdenadas } from "@/lib/variantes";

const NINGUNO = "__ninguno"; // los Select de Radix no aceptan "" como valor

type Formulario = {
  size: string;
  length: string;
  neckline: string;
  sleeve: string;
  silhouette: string;
  colorFamily: string;
  colorName: string;
  colorHex: string;
  priceSale: string;
  priceRent: string;
  stock: string;
  position: string;
  sku: string;
  imagenes: ImagenFormulario[];
};

// Las fotos guardadas se muestran con su versión liviana
async function imagenesDe(v: Variante): Promise<ImagenFormulario[]> {
  return Promise.all(
    fotosOrdenadas(v.images).map(async (f) => ({
      id: crypto.randomUUID(),
      key: f.key,
      thumbKey: f.thumbKey ?? null,
      archivo: null,
      vistaPrevia: await getUrl({ path: f.thumbKey ?? f.key }).then(({ url }) => url.toString(), () => ""),
    })),
  );
}

async function desdeVariante(v: Variante, posicion: string): Promise<Formulario> {
  return {
    size: v.size ?? NINGUNO,
    length: v.length ?? NINGUNO,
    neckline: v.neckline ?? NINGUNO,
    sleeve: v.sleeve ?? NINGUNO,
    silhouette: v.silhouette ?? NINGUNO,
    colorFamily: v.colorFamily ?? NINGUNO,
    colorName: v.colorName ?? "",
    colorHex: v.colorHex ?? "#000000",
    priceSale: String(v.priceSale),
    priceRent: String(v.priceRent),
    stock: String(v.stock ?? 0),
    position: posicion,
    sku: v.sku ?? "",
    imagenes: await imagenesDe(v),
  };
}

const vacio = (posicion: string): Formulario => ({
  size: NINGUNO,
  length: NINGUNO,
  neckline: NINGUNO,
  sleeve: NINGUNO,
  silhouette: NINGUNO,
  colorFamily: NINGUNO,
  colorName: "",
  colorHex: "#000000",
  priceSale: "",
  priceRent: "",
  stock: "1",
  position: posicion,
  sku: "",
  imagenes: [],
});

const valor = (v: string) => (v === NINGUNO ? null : v);
const nombreVariante = (v: Variante) => describirOpciones(opcionesDeVariante(v)) || `Variante ${v.position ?? ""}`;

// Para copiar una parte de otra variante (la combinación, el precio y stock o las fotos). Después
// de elegir vuelve a quedar vacío, así se puede volver a usar.
function CopiarDeVariante({
  id,
  etiqueta,
  placeholder,
  opciones,
  onElegir,
}: {
  id: string;
  etiqueta: string;
  placeholder: string;
  opciones: { id: string; nombre: string }[];
  onElegir: (id: string) => void;
}) {
  if (!opciones.length) return null;
  return (
    <div className="max-w-sm space-y-2">
      <Label htmlFor={id}>{etiqueta}</Label>
      <Select value="" onValueChange={onElegir}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {opciones.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
const entero = (v: string) => (/^\d+$/.test(v.trim()) ? Number(v.trim()) : NaN);

export function FormularioVariante({
  productId,
  variantId,
  desde,
  puedeBorrarImagenes,
}: {
  productId: string;
  variantId?: string;
  // Duplicar: la nueva variante empieza como copia de esta (con sus mismas fotos)
  desde?: string;
  puedeBorrarImagenes: boolean;
}) {
  const router = useRouter();
  const [variantes, setVariantes] = useState<Variante[]>([]);
  const [nombreProducto, setNombreProducto] = useState("");
  const [form, setForm] = useState<Formulario | null>(null);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState("");
  // Al crear pasa a tener id: si el resumen falla y se vuelve a guardar, se actualiza la misma
  // variante en vez de crear otra igual
  const [idGuardado, setIdGuardado] = useState(variantId);

  useEffect(() => {
    cargarVariantes(productId)
      .then(async (cargado) => {
        if (!cargado) return setError("No encontramos este producto.");
        setVariantes(cargado.variantes);
        setNombreProducto(cargado.producto.name);
        const siguiente = String(Math.max(0, ...cargado.variantes.map((v) => v.position ?? 0)) + 1);
        const actual = cargado.variantes.find((v) => v.id === variantId);
        const original = cargado.variantes.find((v) => v.id === desde);
        if (variantId && !actual) return setError("No encontramos esta variante.");
        setForm(
          actual
            ? await desdeVariante(actual, String(actual.position ?? ""))
            : original
              ? { ...(await desdeVariante(original, siguiente)), sku: "" }
              : vacio(siguiente),
        );
      })
      .catch((err: Error) => setError(err.message));
  }, [productId, variantId, desde]);

  if (!form) {
    return error ? (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    ) : (
      <Skeleton className="h-96 w-full max-w-3xl" />
    );
  }

  const cambiar = <K extends keyof Formulario>(campo: K, v: Formulario[K]) => setForm({ ...form, [campo]: v });

  // El tono de la familia sirve de punto de partida para que la muestra no quede en negro
  const muestraDe = (familia: string) => {
    const muestra = FAMILIAS_COLOR.find((f) => f.valor === familia)?.muestra;
    return muestra?.startsWith("#") ? muestra : null; // Multicolor es un degradado
  };
  function elegirFamilia(familia: string) {
    if (!form) return;
    const sinTocar = form.colorHex === "#000000" || form.colorHex === muestraDe(form.colorFamily);
    setForm({ ...form, colorFamily: familia, colorHex: sinTocar ? (muestraDe(familia) ?? form.colorHex) : form.colorHex });
  }
  const otras = variantes.filter((v) => v.id !== idGuardado);

  async function usarFotosDe(id: string) {
    const origen = variantes.find((v) => v.id === id);
    if (origen && form) setForm({ ...form, imagenes: await imagenesDe(origen) });
  }
  // Las 6 opciones y el nombre y tono del color. Quedan iguales a los de esa variante: hay que
  // cambiar al menos una antes de guardar (dos variantes no pueden tener la misma combinación).
  function usarCombinacionDe(id: string) {
    const origen = variantes.find((v) => v.id === id);
    if (!origen || !form) return;
    setForm({
      ...form,
      size: origen.size ?? NINGUNO,
      length: origen.length ?? NINGUNO,
      neckline: origen.neckline ?? NINGUNO,
      sleeve: origen.sleeve ?? NINGUNO,
      silhouette: origen.silhouette ?? NINGUNO,
      colorFamily: origen.colorFamily ?? NINGUNO,
      colorName: origen.colorName ?? "",
      colorHex: origen.colorHex ?? "#000000",
    });
  }
  // El SKU y la posición no: son propios de cada variante
  function usarPrecioDe(id: string) {
    const origen = variantes.find((v) => v.id === id);
    if (origen && form) setForm({ ...form, priceSale: String(origen.priceSale), priceRent: String(origen.priceRent), stock: String(origen.stock ?? 0) });
  }

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form) return;
    setError("");

    const priceSale = Number.parseFloat(form.priceSale);
    const priceRent = Number.parseFloat(form.priceRent);
    const stock = entero(form.stock);
    const position = entero(form.position);
    if (!(priceSale >= 0) || !(priceRent >= 0)) return setError("Escribe el precio de venta y el de alquiler por día.");
    if (Number.isNaN(stock)) return setError("El stock debe ser un número entero, 0 o más.");
    if (Number.isNaN(position)) return setError("La posición debe ser un número entero.");
    if (form.colorFamily !== NINGUNO && !form.colorName.trim()) return setError("Escribe el nombre del color (por ejemplo «Rojo vino»).");

    const opciones = {
      size: valor(form.size) as Talla | null,
      length: valor(form.length),
      neckline: valor(form.neckline),
      sleeve: valor(form.sleeve),
      silhouette: valor(form.silhouette),
      colorFamily: valor(form.colorFamily) as FamiliaColor | null,
    };
    // RNF-08: dos variantes con las mismas 6 opciones no se podrían elegir en la tienda
    const clave = JSON.stringify(opcionesDeVariante(opciones));
    const repetida = otras.find((v) => JSON.stringify(opcionesDeVariante(v)) === clave);
    if (repetida) {
      return setError(`Ya existe una variante con esa misma combinación (${describirOpciones(opcionesDeVariante(opciones)) || "sin opciones"}). Cambia la talla, el largo, el color u otra opción.`);
    }

    let imagenes: ImagenFormulario[];
    try {
      setGuardando("Subiendo fotos…");
      imagenes = await subirImagenes(productId, form.imagenes);
      setForm({ ...form, imagenes }); // si el guardado falla, al reintentar no se vuelven a subir
    } catch {
      setGuardando("");
      return setError("No se pudieron subir las fotos. Inténtalo de nuevo.");
    }

    const datos = {
      ...opciones,
      colorName: form.colorFamily === NINGUNO ? null : form.colorName.trim(),
      colorHex: form.colorFamily === NINGUNO ? null : form.colorHex,
      priceSale,
      priceRent,
      stock,
      position,
      sku: form.sku.trim() || null,
      images: imagenes.map((imagen, i) => ({
        key: imagen.key as string,
        thumbKey: imagen.thumbKey,
        position: i + 1,
      })),
    };

    setGuardando("Guardando…");
    const { data: guardada, errors } = idGuardado
      ? await clienteDatos.models.ProductVariant.update({ id: idGuardado, ...datos })
      : await clienteDatos.models.ProductVariant.create({ productId, ...datos });
    if (errors?.length || !guardada) {
      setGuardando("");
      return setError(errors?.length ? mensajeErrorDatos(errors) : "No se pudo guardar la variante.");
    }
    setIdGuardado(guardada.id);

    // Las fotos quitadas se borran de S3 si ninguna otra variante las usa (solo ADMIN puede borrar)
    if (puedeBorrarImagenes && idGuardado) {
      const actual = variantes.find((v) => v.id === idGuardado);
      const enUso = rutasEnUso(otras);
      const nuevas = new Set(imagenes.flatMap((i) => [i.key, i.thumbKey]));
      const quitadas = actual ? Array.from(rutasEnUso([actual])).filter((r) => !nuevas.has(r) && !enUso.has(r)) : [];
      await Promise.allSettled(quitadas.map((path) => remove({ path })));
    }

    setGuardando("Actualizando el catálogo…");
    const resultado = await recalcularResumen(productId).catch(
      (err: Error): { ok: false; error: string } => ({ ok: false, error: err.message }),
    );
    setGuardando("");
    if (!resultado.ok) {
      return setError(`La variante se guardó, pero no se pudo actualizar el catálogo: ${resultado.error}. Usa «Actualizar resumen» en el producto.`);
    }
    router.push(`/admin/productos/${productId}`);
    router.refresh();
  }

  const selector = (id: string, etiqueta: string, campo: keyof Formulario, lista: readonly { valor: string; nombre: string }[], sinValor: string) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{etiqueta}</Label>
      <Select value={form[campo] as string} onValueChange={(v) => (campo === "colorFamily" ? elegirFamilia(v) : cambiar(campo, v as never))}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NINGUNO}>{sinValor}</SelectItem>
          {lista.map((opcion) => (
            <SelectItem key={opcion.valor} value={opcion.valor}>{opcion.nombre}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <form onSubmit={guardar} noValidate className="max-w-3xl space-y-6">
      {nombreProducto && <p className="text-sm text-muted-foreground">Producto: {nombreProducto}</p>}
      {desde && !variantId && (
        <Alert>
          <AlertDescription>Copia de otra variante, con sus mismas fotos. Cambia la talla, el color u otra opción antes de guardar.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Combinación</CardTitle>
          <CardDescription>Llena todas las opciones que apliquen, aunque se repitan entre variantes: así los filtros coinciden.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CopiarDeVariante
            id="copiarCombinacion"
            etiqueta="Usar la combinación de otra variante"
            placeholder="Elige una variante (luego cambia la talla u otra opción)"
            opciones={otras.map((v) => ({ id: v.id, nombre: nombreVariante(v) }))}
            onElegir={usarCombinacionDe}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {selector("size", "Talla", "size", TALLAS, "Sin talla (joyas y accesorios)")}
            {selector("length", "Largo", "length", LARGOS, "Sin largo")}
            {selector("neckline", "Escote", "neckline", ESCOTES, "Sin escote")}
            {selector("sleeve", "Manga", "sleeve", MANGAS, "Sin manga")}
            {selector("silhouette", "Silueta", "silhouette", SILUETAS, "Sin silueta")}
            {selector("colorFamily", "Familia de color", "colorFamily", FAMILIAS_COLOR, "Sin color")}
            {form.colorFamily !== NINGUNO && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="colorName">Nombre del color</Label>
                  <Input id="colorName" placeholder="Rojo vino" value={form.colorName} onChange={(e) => cambiar("colorName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="colorHex">Tono</Label>
                  <Input id="colorHex" type="color" className="w-16 p-1" value={form.colorHex} onChange={(e) => cambiar("colorHex", e.target.value)} />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Precio y stock</CardTitle>
          <CardDescription>En soles (S/). El alquiler es por día.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CopiarDeVariante
            id="copiarPrecio"
            etiqueta="Usar el precio y stock de otra variante"
            placeholder="Elige una variante"
            opciones={otras.map((v) => ({
              id: v.id,
              nombre: `${nombreVariante(v)} — ${formatoSoles.format(v.priceSale)} · ${formatoSoles.format(v.priceRent)} por día · stock ${v.stock ?? 0}`,
            }))}
            onElegir={usarPrecioDe}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priceSale">Precio de venta</Label>
              <Input id="priceSale" type="number" min="0" step="0.01" inputMode="decimal" value={form.priceSale} onChange={(e) => cambiar("priceSale", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceRent">Alquiler por día</Label>
              <Input id="priceRent" type="number" min="0" step="0.01" inputMode="decimal" value={form.priceRent} onChange={(e) => cambiar("priceRent", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" type="number" min="0" step="1" inputMode="numeric" value={form.stock} onChange={(e) => cambiar("stock", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Posición</Label>
              <Input id="position" type="number" min="0" step="1" inputMode="numeric" value={form.position} onChange={(e) => cambiar("position", e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" placeholder="Opcional" value={form.sku} onChange={(e) => cambiar("sku", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fotos</CardTitle>
          <CardDescription>
            Hasta 6, en orden: la 1 es la portada y la 2 la contraportada (se ve al pasar el cursor en el catálogo).
            Al subirlas se crea también una versión liviana para el catálogo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CopiarDeVariante
            id="copiarFotos"
            etiqueta="Usar las fotos de otra variante"
            placeholder="Elige una variante (misma prenda, otra talla)"
            opciones={otras.filter((v) => fotosOrdenadas(v.images).length > 0).map((v) => ({ id: v.id, nombre: nombreVariante(v) }))}
            onElegir={usarFotosDe}
          />
          <EditorImagenes imagenes={form.imagenes} onChange={(imagenes) => cambiar("imagenes", imagenes)} onError={setError} />
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={guardando !== ""}>
          {guardando || (idGuardado ? "Guardar variante" : "Crear variante")}
        </Button>
        <Button asChild variant="outline">
          <Link href={`/admin/productos/${productId}`}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
