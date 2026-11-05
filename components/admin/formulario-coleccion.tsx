"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { getUrl } from "aws-amplify/storage";
import { invalidarColecciones } from "@/app/(admin)/admin/(panel)/colecciones/acciones";
import { Campo, CasillaVisible, PieSeccion, idCampo, useFormulario } from "@/components/admin/contenido/comun";
import { CampoFoto, type FotoFormulario, subirFoto, useFotosGuardadas } from "@/components/admin/contenido/foto";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { Textarea } from "@/components/admin/ui/textarea";
import { type OpcionProducto, cargarOpcionesProducto, mensajeErrorDatos, tablaColecciones } from "@/components/admin/datos";
import {
  CARPETA_COLECCIONES,
  type Coleccion,
  type FormularioColeccion as Formulario,
  LARGO_COLECCION,
  MAXIMO_COLECCIONES_MENU,
  ORDENES,
  type OrdenColeccion,
  aFechaIso,
  aFechaLocal,
  crearSlug,
  idsDeColeccion,
  normalizarTexto,
  rutaColeccion,
  validarColeccion,
} from "@/lib/colecciones";

const ID_FORMULARIO = "coleccion";

// Nace sin publicar: Marketing la arma y la publica cuando está lista
const VACIO: Formulario = {
  title: "",
  slug: "",
  description: "",
  productIds: [],
  sortOrder: "MANUAL",
  isPublished: false,
  startsAt: "",
  endsAt: "",
  position: "",
  seoTitle: "",
  seoDescription: "",
};

const desdeColeccion = (c: Coleccion): Formulario => ({
  title: c.title,
  slug: c.slug,
  description: c.description ?? "",
  productIds: idsDeColeccion(c),
  sortOrder: c.sortOrder ?? "MANUAL",
  isPublished: c.isPublished ?? false,
  startsAt: aFechaLocal(c.startsAt),
  endsAt: aFechaLocal(c.endsAt),
  position: c.position?.toString() ?? "",
  seoTitle: c.seoTitle ?? "",
  seoDescription: c.seoDescription ?? "",
});

async function cargarColeccion(id: string) {
  const { data, errors } = await tablaColecciones().get({ id });
  if (errors?.length) throw new Error(mensajeErrorDatos(errors));
  if (!data) throw new Error("No encontramos esta colección.");
  const vistaPrevia = data.imageKey
    ? await getUrl({ path: data.imageKey }).then(
        ({ url }) => url.toString(),
        () => "",
      )
    : "";
  const foto: FotoFormulario | null = data.imageKey ? { key: data.imageKey, archivo: null, vistaPrevia } : null;
  return { form: desdeColeccion(data), foto };
}

async function slugOcupado(slug: string) {
  const { data, errors } = await tablaColecciones().listCollectionBySlug({ slug });
  if (errors?.length) throw new Error(mensajeErrorDatos(errors));
  return data.length > 0;
}

// Texto vacío → null, para que AppSync borre el valor al editar
const textoONulo = (valor: string) => valor.trim() || null;

// Carga la colección antes de montar el formulario: las fotos guardadas se leen al montarlo
export function FormularioColeccion({ id }: { id?: string }) {
  const [inicial, setInicial] = useState<Awaited<ReturnType<typeof cargarColeccion>> | null>(id ? null : { form: VACIO, foto: null });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    cargarColeccion(id)
      .then(setInicial)
      .catch((err: unknown) => {
        console.error("No se pudo cargar la colección:", err);
        setError(err instanceof Error ? err.message : "No se pudo cargar la colección. Recarga la página.");
      });
  }, [id]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  if (!inicial) return <Skeleton className="h-96 w-full max-w-3xl" />;
  return <Campos id={id} inicial={inicial} />;
}

function Campos({ id, inicial }: { id?: string; inicial: { form: Formulario; foto: FotoFormulario | null } }) {
  const router = useRouter();
  const s = useFormulario(ID_FORMULARIO);
  const [form, setForm] = useState(inicial.form);
  const [foto, setFoto] = useState(inicial.foto);
  // Mientras no se escriba a mano, el enlace sigue al título
  const [slugEscrito, setSlugEscrito] = useState(false);
  const [productos, setProductos] = useState<OpcionProducto[] | null>(null);
  const [errorProductos, setErrorProductos] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const limpiarFotos = useFotosGuardadas(inicial.foto?.key ? [{ key: inicial.foto.key }] : []);

  useEffect(() => {
    cargarOpcionesProducto()
      .then(setProductos)
      .catch((err: unknown) => {
        console.error("No se pudieron cargar los productos:", err);
        setErrorProductos("No se pudieron cargar los productos. Recarga la página para elegirlos.");
      });
  }, []);

  const cambiar = <K extends keyof Formulario>(campo: K, valor: Formulario[K]) => {
    setForm((actual) => ({ ...actual, [campo]: valor }));
    s.editado(campo);
  };
  const cambiarTitulo = (title: string) => {
    setForm((actual) => ({ ...actual, title, slug: id || slugEscrito ? actual.slug : crearSlug(title) }));
    s.editado("title");
    if (!id && !slugEscrito) s.editado("slug");
  };
  const mover = (indice: number, paso: -1 | 1) => {
    const lista = [...form.productIds];
    [lista[indice], lista[indice + paso]] = [lista[indice + paso], lista[indice]];
    cambiar("productIds", lista);
  };

  const manual = form.sortOrder === "MANUAL";
  const texto = normalizarTexto(busqueda.trim());
  const resultados = (productos ?? []).filter((p) => !form.productIds.includes(p.productId) && normalizarTexto(p.nombre).includes(texto));

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const encontrados = validarColeccion(form);
    s.setErrores(encontrados);
    const primero = Object.keys(encontrados)[0];
    if (primero) {
      s.setEstado({ tipo: "error", mensaje: "Revisa los campos marcados en rojo." });
      document.getElementById(idCampo(ID_FORMULARIO, primero))?.focus();
      return;
    }

    let subida = foto;
    try {
      // DynamoDB no impide repetir el enlace: se revisa antes de crear
      if (!id) {
        s.setEstado({ tipo: "guardando", mensaje: "Revisando el enlace…" });
        if (await slugOcupado(form.slug)) {
          s.setErrores({ slug: "Ya hay una colección con este enlace. Escribe otro." });
          s.setEstado({ tipo: "error", mensaje: "Revisa los campos marcados en rojo." });
          document.getElementById(idCampo(ID_FORMULARIO, "slug"))?.focus();
          return;
        }
      }
      if (foto?.archivo) {
        s.setEstado({ tipo: "guardando", mensaje: "Subiendo la foto…" });
        subida = await subirFoto(foto, CARPETA_COLECCIONES);
        setFoto(subida); // si el guardado falla, al reintentar no se vuelve a subir
      }
      s.setEstado({ tipo: "guardando", mensaje: "Guardando…" });
      const datos = {
        title: form.title.trim(),
        description: textoONulo(form.description),
        productIds: form.productIds,
        sortOrder: form.sortOrder,
        isPublished: form.isPublished,
        startsAt: aFechaIso(form.startsAt),
        endsAt: aFechaIso(form.endsAt),
        position: form.position ? Number(form.position) : null,
        imageKey: subida?.key ?? null,
        seoTitle: textoONulo(form.seoTitle),
        seoDescription: textoONulo(form.seoDescription),
      };
      // El enlace solo se escribe al crearla
      const { errors } = id ? await tablaColecciones().update({ id, ...datos }) : await tablaColecciones().create({ ...datos, slug: form.slug });
      if (errors?.length) throw new Error(mensajeErrorDatos(errors));
    } catch (error) {
      console.error("No se pudo guardar la colección:", error);
      s.setEstado({ tipo: "error", mensaje: error instanceof Error ? error.message : "No se pudo guardar. Inténtalo de nuevo." });
      return;
    }

    await limpiarFotos([subida]);
    // Si esto falla, el menú de la tienda igual se actualiza solo en 10 minutos
    const invalidada = await invalidarColecciones().then(
      () => true,
      () => false,
    );
    if (!id) return router.push("/admin/colecciones");
    s.setEstado({
      tipo: "guardado",
      aviso: invalidada ? "Cambios guardados. Ya se ven en la tienda." : "Cambios guardados. El menú de la tienda puede tardar hasta 10 minutos en mostrarlos.",
    });
  }

  return (
    <form noValidate onSubmit={enviar} className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Datos generales</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo {...s.campo("title")} etiqueta="Nombre">
              <Input {...s.entrada("title")} maxLength={LARGO_COLECCION.title} value={form.title} onChange={(e) => cambiarTitulo(e.target.value)} />
            </Campo>
            <Campo
              {...s.campo("slug")}
              etiqueta="Enlace"
              ayuda={`${rutaColeccion(form.slug || "novias-2027")}. ${id ? "No cambia aunque edites el nombre" : "Después de crearla no cambia"}, para que sigan funcionando los enlaces que ya se compartieron.`}
            >
              <Input
                {...s.entrada("slug", true)}
                maxLength={LARGO_COLECCION.slug}
                spellCheck={false}
                autoCapitalize="none"
                readOnly={Boolean(id)}
                value={form.slug}
                onChange={(e) => {
                  setSlugEscrito(true);
                  cambiar("slug", e.target.value);
                }}
              />
            </Campo>
            <Campo {...s.campo("description")} etiqueta="Descripción (opcional)" className="sm:col-span-2">
              <Textarea {...s.entrada("description")} maxLength={LARGO_COLECCION.description} rows={3} value={form.description} onChange={(e) => cambiar("description", e.target.value)} />
            </Campo>
          </div>
          <div className="border-t pt-5">
            <CampoFoto s={s} ruta="imageKey" nombre="foto-coleccion" sinFoto="Se ve arriba, en la página de la colección." foto={foto} onChange={setFoto} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Productos</h2>
          </CardTitle>
          <CardDescription>Pueden ser de cualquier categoría. El precio y la foto salen de cada producto, y los que no tienen stock no se muestran.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="coleccion-sortOrder">Orden en la tienda</Label>
            <Select name="coleccion-sortOrder" value={form.sortOrder} onValueChange={(valor) => cambiar("sortOrder", valor as OrdenColeccion)}>
              <SelectTrigger id="coleccion-sortOrder" className="w-full sm:w-80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDENES.map((orden) => (
                  <SelectItem key={orden.valor} value={orden.valor}>
                    {orden.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {errorProductos ? (
            <Alert variant="destructive">
              <AlertDescription>{errorProductos}</AlertDescription>
            </Alert>
          ) : productos === null ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="space-y-2">
              <Campo {...s.campo("productIds")} etiqueta="Agregar productos">
                <Input
                  {...s.entrada("productIds")}
                  type="search"
                  placeholder="Busca por nombre"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  // Enter no debe guardar el formulario mientras se busca
                  onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                />
              </Campo>
              {resultados.length > 0 ? (
                <ul aria-label="Productos para agregar" className="max-h-56 divide-y overflow-y-auto rounded-md border">
                  {resultados.map((p) => (
                    <li key={p.productId}>
                      <button
                        type="button"
                        aria-label={`Agregar ${p.nombre}`}
                        onClick={() => cambiar("productIds", [...form.productIds, p.productId])}
                        className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        <Plus className="size-4 flex-none text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate">{p.nombre}</span>
                        <Badge variant="outline">{p.categoria}</Badge>
                        {!p.conStock && <Badge variant="secondary">Sin stock</Badge>}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{productos.length === 0 ? "Todavía no hay productos en el catálogo." : "No hay más productos con ese nombre."}</p>
              )}
            </div>
          )}

          {form.productIds.length > 0 && (
            <div className="space-y-2 border-t pt-5">
              <h3 className="text-sm font-medium">En esta colección ({form.productIds.length})</h3>
              <ol aria-label="Productos de la colección" className="divide-y rounded-md border">
                {form.productIds.map((productId, i) => {
                  const producto = productos?.find((p) => p.productId === productId);
                  const nombre = producto?.nombre ?? (productos ? "Producto eliminado" : "Cargando…");
                  return (
                    <li key={productId} className="flex items-center gap-3 px-3 py-2">
                      <span className="w-6 text-sm text-muted-foreground tabular-nums">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{nombre}</p>
                        {producto && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Badge variant="outline">{producto.categoria}</Badge>
                            {!producto.conStock && <Badge variant="secondary">Sin stock: no se muestra</Badge>}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-none">
                        {manual && (
                          <>
                            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Subir ${nombre}`} disabled={i === 0} onClick={() => mover(i, -1)}>
                              <ChevronUp />
                            </Button>
                            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Bajar ${nombre}`} disabled={i === form.productIds.length - 1} onClick={() => mover(i, 1)}>
                              <ChevronDown />
                            </Button>
                          </>
                        )}
                        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Quitar ${nombre}`} onClick={() => cambiar("productIds", form.productIds.filter((x) => x !== productId))}>
                          <X />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Publicación</h2>
          </CardTitle>
          <CardDescription>Publicada, se ve en la tienda y en el menú de Catálogo. Sin publicar, solo se ve aquí.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CasillaVisible id="coleccion-isPublished" visible={form.isPublished} onChange={(valor) => {
            cambiar("isPublished", valor);
            s.editado("productIds");
          }} etiqueta="Publicar en la tienda" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo {...s.campo("startsAt")} etiqueta="Inicio (opcional)" ayuda="Para una temporada: aparece sola a esta hora. Vacío, se ve desde que se publica.">
              <Input {...s.entrada("startsAt", true)} type="datetime-local" value={form.startsAt} onChange={(e) => cambiar("startsAt", e.target.value)} />
            </Campo>
            <Campo {...s.campo("endsAt")} etiqueta="Fin (opcional)" ayuda="Desaparece sola a esta hora. Vacío, sigue visible.">
              <Input {...s.entrada("endsAt", true)} type="datetime-local" value={form.endsAt} onChange={(e) => cambiar("endsAt", e.target.value)} />
            </Campo>
            <Campo {...s.campo("position")} etiqueta="Posición en el menú (opcional)" ayuda={`La 1 va primero. Sin posición van al final, y en el menú entran ${MAXIMO_COLECCIONES_MENU}.`}>
              <Input {...s.entrada("position", true)} type="number" min={0} max={9999} step={1} inputMode="numeric" value={form.position} onChange={(e) => cambiar("position", e.target.value)} />
            </Campo>
          </div>
          <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
            <Campo {...s.campo("seoTitle")} etiqueta="Título para Google (opcional)" ayuda="También se ve al compartir el enlace por WhatsApp. Vacío, se usa el nombre.">
              <Input {...s.entrada("seoTitle", true)} maxLength={LARGO_COLECCION.seoTitle} value={form.seoTitle} onChange={(e) => cambiar("seoTitle", e.target.value)} />
            </Campo>
            <Campo {...s.campo("seoDescription")} etiqueta="Descripción para Google (opcional)" ayuda="Vacía, se usa la descripción de la colección.">
              <Textarea {...s.entrada("seoDescription", true)} maxLength={LARGO_COLECCION.seoDescription} rows={3} value={form.seoDescription} onChange={(e) => cambiar("seoDescription", e.target.value)} />
            </Campo>
          </div>
        </CardContent>
        <PieSeccion estado={s.estado} texto={id ? "Guardar colección" : "Crear colección"} />
      </Card>

      <Button asChild variant="outline">
        <Link href="/admin/colecciones">Volver a colecciones</Link>
      </Button>
    </form>
  );
}
