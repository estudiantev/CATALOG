"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { invalidarCategorias } from "@/app/(admin)/admin/(panel)/contenido/acciones";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { categoriaConProductos, mensajeErrorDatos, tablaCategorias } from "@/components/admin/datos";
import {
  ANCHOS_MENU,
  type Categoria,
  type CategoriaEditada,
  LARGO_CATEGORIA,
  MAXIMO_EN_MENU,
  codigoDeSlug,
  escalonMenu,
  rutaCategoria,
  slugDeCategoria,
  validarCategorias,
} from "@/lib/categorias";
import { Campo, CasillaVisible, PieSeccion, idCampo, useFormulario } from "./comun";

// Las categorías del catálogo y cuáles van en el menú de la tienda. No son una fila de Content:
// cada una es una fila de la tabla Category, y Product.category guarda su código.

const FORMULARIO = "categorias";

// `guardada`: el código con que ya existe (las de siempre lo tienen aunque no tengan fila);
// null mientras sea nueva
type Fila = { id: string; guardada: string | null; nombre: string; plural: string; enMenu: boolean; base: boolean };

const aFila = (c: Categoria): Fila => ({ id: c.codigo, guardada: c.codigo, nombre: c.nombre, plural: c.plural, enMenu: c.enMenu, base: c.base });

// El slug y el código de una nueva salen de su plural; los de una guardada ya no cambian
function aEditada(fila: Fila, guardadas: Categoria[]): CategoriaEditada {
  const guardada = guardadas.find((g) => g.codigo === fila.guardada);
  const slug = guardada ? guardada.slug : slugDeCategoria(fila.plural);
  return {
    id: fila.id,
    codigo: guardada ? guardada.codigo : codigoDeSlug(slug),
    slug,
    nueva: !guardada,
    nombre: fila.nombre,
    plural: fila.plural,
    enMenu: fila.enMenu,
  };
}

const esCondicional = (errores: { message: string; errorType?: string }[]) => errores.some((e) => /conditional/i.test(`${e.errorType} ${e.message}`));

function Encabezado() {
  return (
    <CardHeader>
      <CardTitle>
        <h2>Categorías</h2>
      </CardTitle>
      <CardDescription>
        Cada categoría tiene su propio catálogo y es la que se elige al crear un producto. Las que marques salen en el menú de la tienda, después de Contacto, en el
        orden de esta lista (hasta {MAXIMO_EN_MENU}). Una categoría nueva se puede eliminar mientras no tenga productos.
      </CardDescription>
    </CardHeader>
  );
}

export function EditorCategorias({ inicial, error }: { inicial: Categoria[] | null; error: string }) {
  if (inicial) return <FormularioCategorias inicial={inicial} />;
  return (
    <Card>
      <Encabezado />
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Skeleton className="h-48 w-full" />
        )}
      </CardContent>
    </Card>
  );
}

function FormularioCategorias({ inicial }: { inicial: Categoria[] }) {
  // Lo que ya está en la tabla: si el guardado falla a la mitad, lo hecho no se repite
  const [guardadas, setGuardadas] = useState(inicial);
  const [filas, setFilas] = useState<Fila[]>(() => inicial.map(aFila));
  const [revisando, setRevisando] = useState<string | null>(null); // la que se revisa antes de quitarla
  const [avisos, setAvisos] = useState<Record<string, string>>({}); // por qué no se pudo quitar una
  const { setEstado, ...s } = useFormulario(FORMULARIO);

  const delMenu = filas.filter((f) => f.enMenu);
  const enMenu = delMenu.length;
  const lleno = enMenu >= MAXIMO_EN_MENU;
  // Desde qué ancho de pantalla entra el menú de escritorio con estos nombres
  const escalon = escalonMenu(delMenu.map((f) => f.plural));
  const errorMenu = s.errores.menu;

  // Cambiar un nombre del menú o qué categorías van en él puede arreglar el error de ancho
  const cambiar = (id: string, cambios: Partial<Fila>, ruta?: string) => {
    setFilas((actuales) => actuales.map((f) => (f.id === id ? { ...f, ...cambios } : f)));
    s.editado(ruta);
    if (errorMenu && (cambios.plural !== undefined || cambios.enMenu !== undefined)) s.editado("menu");
  };
  const mover = (indice: number, paso: -1 | 1) => {
    const lista = [...filas];
    [lista[indice], lista[indice + paso]] = [lista[indice + paso], lista[indice]];
    setFilas(lista);
    s.editado();
  };
  const agregar = () => {
    setFilas([...filas, { id: crypto.randomUUID(), guardada: null, nombre: "", plural: "", enMenu: !lleno, base: false }]);
    s.editado();
  };
  const sinAviso = (id: string) =>
    setAvisos((actuales) => {
      const copia = { ...actuales };
      delete copia[id];
      return copia;
    });

  // Una guardada se quita de la lista solo si no tiene productos; se elimina de la tabla al guardar
  async function quitar(fila: Fila) {
    sinAviso(fila.id);
    if (fila.guardada) {
      setRevisando(fila.id);
      try {
        if (await categoriaConProductos(fila.guardada)) {
          setAvisos((actuales) => ({ ...actuales, [fila.id]: "Tiene productos: cámbialos a otra categoría antes de eliminarla." }));
          return;
        }
      } catch (error) {
        console.error("No se pudo revisar si la categoría tiene productos:", error);
        setAvisos((actuales) => ({ ...actuales, [fila.id]: "No se pudo revisar si tiene productos. Inténtalo de nuevo." }));
        return;
      } finally {
        setRevisando(null);
      }
    }
    setFilas((actuales) => actuales.filter((f) => f.id !== fila.id));
    s.editado();
  }

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const editadas = filas.map((f) => aEditada(f, guardadas));
    const encontrados = validarCategorias(editadas);
    s.setErrores(encontrados);
    const primero = Object.keys(encontrados)[0];
    if (primero) {
      setEstado({ tipo: "error", mensaje: "Revisa los campos marcados en rojo." });
      document.getElementById(idCampo(FORMULARIO, primero))?.focus();
      return;
    }

    setEstado({ tipo: "guardando", mensaje: "Guardando…" });
    let hechas = guardadas;
    const creadas: Record<string, string> = {}; // id de la fila → código con que se creó
    try {
      const tabla = tablaCategorias();
      // Las quitadas de la lista, si siguen sin productos
      for (const g of guardadas) {
        if (g.base || filas.some((f) => f.guardada === g.codigo)) continue;
        if (await categoriaConProductos(g.codigo)) throw new Error(`«${g.plural}» ya tiene productos y no se puede eliminar. Recarga la página.`);
        const { errors } = await tabla.delete({ code: g.codigo });
        if (errors?.length) throw new Error(mensajeErrorDatos(errors));
        hechas = hechas.filter((h) => h.codigo !== g.codigo);
      }
      // Las nuevas y las que cambiaron; la posición es su lugar en la lista
      for (let i = 0; i < editadas.length; i++) {
        const c = editadas[i];
        const anterior = c.nueva ? undefined : hechas.find((h) => h.codigo === c.codigo);
        const lista: Categoria = {
          codigo: c.codigo,
          nombre: c.nombre.trim(),
          plural: c.plural.trim(),
          slug: c.slug,
          enMenu: c.enMenu,
          posicion: i + 1,
          base: anterior?.base ?? false,
          existe: true,
        };
        if (
          anterior &&
          anterior.nombre === lista.nombre &&
          anterior.plural === lista.plural &&
          anterior.enMenu === lista.enMenu &&
          anterior.posicion === lista.posicion
        ) {
          continue;
        }
        const fila = { code: lista.codigo, name: lista.nombre, plural: lista.plural, inMenu: lista.enMenu, position: lista.posicion };
        let { errors } = anterior?.existe ? await tabla.update(fila) : await tabla.create({ ...fila, slug: lista.slug });
        // Una de las de siempre que alguien guardó mientras tanto (otra pestaña): se actualiza
        if (anterior && !anterior.existe && errors && esCondicional(errors)) ({ errors } = await tabla.update(fila));
        if (errors?.length) {
          throw new Error(
            c.nueva && esCondicional(errors)
              ? `Ya hay una categoría con el enlace ${rutaCategoria(c.slug)}. Recarga la página o usa otro nombre en plural.`
              : mensajeErrorDatos(errors),
          );
        }
        hechas = anterior ? hechas.map((h) => (h.codigo === lista.codigo ? lista : h)) : [...hechas, lista];
        if (c.nueva) creadas[c.id] = lista.codigo;
      }
    } catch (error) {
      console.error("No se pudieron guardar las categorías:", error);
      setEstado({ tipo: "error", mensaje: error instanceof Error ? error.message : "No se pudo guardar. Inténtalo de nuevo." });
      return;
    } finally {
      setGuardadas(hechas);
      setFilas((actuales) => actuales.map((f) => (creadas[f.id] ? { ...f, guardada: creadas[f.id] } : f)));
    }

    // Si esto falla, la tienda igual se actualiza sola en 10 minutos
    const invalidada = await invalidarCategorias().then(
      () => true,
      () => false,
    );
    setEstado({
      tipo: "guardado",
      aviso: invalidada ? "Cambios guardados. Ya se ven en la tienda." : "Cambios guardados. La tienda puede tardar hasta 10 minutos en mostrarlos.",
    });
  }

  return (
    <form noValidate onSubmit={guardar}>
      <Card>
        <Encabezado />
        <CardContent className="space-y-6">
          <div id={idCampo(FORMULARIO, "menu")} tabIndex={-1} className="space-y-1 text-sm outline-none">
            <p className="text-muted-foreground">
              En el menú: {enMenu} de {MAXIMO_EN_MENU}.{lleno && " Para mostrar otra, desmarca una."}
              {escalon > 0 &&
                ` Con estos nombres, en pantallas de menos de ${ANCHOS_MENU[escalon]} px de ancho el menú se abre con el botón ☰, como en el celular.`}
            </p>
            {errorMenu && <p className="text-destructive">{errorMenu}</p>}
          </div>
          <ol aria-label="Categorías" className="grid gap-4 xl:grid-cols-2">
            {filas.map((fila, i) => {
              const { slug } = aEditada(fila, guardadas);
              const titulo = fila.plural.trim() || guardadas.find((g) => g.codigo === fila.guardada)?.plural || "Nueva categoría";
              const ruta = (campo: string) => `${fila.id}.${campo}`;
              const ayudaPlural = fila.guardada
                ? `Así sale en el menú y en su catálogo (${rutaCategoria(slug)}).`
                : slug
                  ? `Así sale en el menú y en su catálogo. Su enlace será ${rutaCategoria(slug)} y ya no cambia.`
                  : "Así sale en el menú y en su catálogo.";
              return (
                <li key={fila.id} className="min-w-0">
                  <fieldset className="min-w-0 space-y-4 rounded-lg border p-4">
                    <legend className="sr-only">{titulo}</legend>
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-sm text-muted-foreground tabular-nums">{i + 1}</span>
                      <p aria-hidden="true" className="min-w-0 flex-1 truncate font-medium">
                        {titulo}
                      </p>
                      <div className="flex flex-none">
                        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Subir ${titulo}`} disabled={i === 0} onClick={() => mover(i, -1)}>
                          <ChevronUp />
                        </Button>
                        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Bajar ${titulo}`} disabled={i === filas.length - 1} onClick={() => mover(i, 1)}>
                          <ChevronDown />
                        </Button>
                        {!fila.base && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Eliminar ${titulo}`}
                            disabled={revisando === fila.id}
                            onClick={() => quitar(fila)}
                          >
                            <Trash2 />
                          </Button>
                        )}
                      </div>
                    </div>
                    {avisos[fila.id] && (
                      <p role="alert" className="text-sm text-destructive">
                        {avisos[fila.id]}
                      </p>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Campo {...s.campo(ruta("nombre"))} etiqueta="Nombre" ayuda="En singular, como «Vestido». Es el que se elige en cada producto.">
                        <Input
                          {...s.entrada(ruta("nombre"), true)}
                          maxLength={LARGO_CATEGORIA.nombre}
                          value={fila.nombre}
                          onChange={(e) => cambiar(fila.id, { nombre: e.target.value }, ruta("nombre"))}
                        />
                      </Campo>
                      <Campo {...s.campo(ruta("plural"))} etiqueta="En plural" ayuda={ayudaPlural}>
                        <Input
                          {...s.entrada(ruta("plural"), true)}
                          maxLength={LARGO_CATEGORIA.plural}
                          value={fila.plural}
                          onChange={(e) => cambiar(fila.id, { plural: e.target.value }, ruta("plural"))}
                        />
                      </Campo>
                    </div>
                    <CasillaVisible
                      id={idCampo(FORMULARIO, ruta("menu"))}
                      visible={fila.enMenu}
                      onChange={(valor) => cambiar(fila.id, { enMenu: valor })}
                      etiqueta="Mostrar en el menú de la tienda"
                      disabled={!fila.enMenu && lleno}
                    />
                  </fieldset>
                </li>
              );
            })}
          </ol>
          <Button type="button" variant="outline" onClick={agregar}>
            <Plus />
            Agregar categoría
          </Button>
        </CardContent>
        <PieSeccion estado={s.estado} texto="Guardar categorías" />
      </Card>
    </form>
  );
}
