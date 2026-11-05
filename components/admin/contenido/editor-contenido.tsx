"use client";

import { useEffect, useState } from "react";
import { getUrl } from "aws-amplify/storage";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { cargarProductos, clienteDatos, mensajeErrorDatos } from "@/components/admin/datos";
import { type ContenidoInicio, OCASIONES, PAGINA_INICIO, armarContenido } from "@/lib/contenido";
import { CATEGORIAS, leerJson } from "@/lib/productos";
import type { ResumenVariante } from "@/lib/variantes";
import { EnlacesSugeridos } from "./comun";
import { EditorAnuncios } from "./editor-anuncios";
import { EditorDestacados, type OpcionProducto } from "./editor-destacados";
import { EditorInspiracion } from "./editor-inspiracion";
import { EditorNosotros } from "./editor-nosotros";
import { EditorOcasiones } from "./editor-ocasiones";
import { EditorPasos } from "./editor-pasos";
import { EditorPie } from "./editor-pie";
import { EditorPortada } from "./editor-portada";

// Las filas de la página de inicio, con la sesión de quien edita (AppSync aplica sus permisos)
async function cargarContenido(): Promise<ContenidoInicio> {
  // El modelo existe en el cliente solo después de desplegar el backend con la tabla Content
  if (!clienteDatos.models.Content) {
    throw new Error(
      "La tabla Content todavía no existe en el backend. Despliega los cambios de amplify/ (npx ampx sandbox o el pipeline de Amplify) y recarga la página.",
    );
  }
  const { data, errors } = await clienteDatos.models.Content.list({ page: PAGINA_INICIO });
  if (errors?.length) throw new Error(mensajeErrorDatos(errors));
  return armarContenido(data);
}

// Vista previa de las fotos ya guardadas
async function firmarVistasPrevias({ portada, ocasiones, nosotros, inspiracion }: ContenidoInicio) {
  const rutas = [
    ...portada.datos.diapositivas.map((d) => d.imagen),
    ...OCASIONES.map(({ clave }) => ocasiones.datos[clave].imagen),
    nosotros.datos.imagen,
    inspiracion.datos.imagen,
  ].flatMap((imagen) => (imagen ? [imagen.key] : []));
  const firmadas = await Promise.all(
    rutas.map((path) =>
      getUrl({ path }).then(
        ({ url }) => [path, url.toString()] as const,
        () => [path, ""] as const,
      ),
    ),
  );
  return Object.fromEntries(firmadas);
}

export function EditorContenido() {
  const [contenido, setContenido] = useState<{ datos: ContenidoInicio; vistasPrevias: Record<string, string> } | null>(null);
  const [error, setError] = useState("");
  const [productos, setProductos] = useState<OpcionProducto[] | null>(null);
  const [errorProductos, setErrorProductos] = useState("");

  useEffect(() => {
    cargarContenido()
      .then(async (datos) => setContenido({ datos, vistasPrevias: await firmarVistasPrevias(datos) }))
      .catch((err: unknown) => {
        console.error("No se pudo cargar el contenido:", err);
        setError(err instanceof Error ? err.message : "No se pudo cargar el contenido. Recarga la página.");
      });
    // Para elegir los destacados; si falla, las demás secciones se pueden editar igual
    cargarProductos()
      .then((lista) =>
        setProductos(
          lista.map((p) => ({
            productId: p.productId,
            nombre: p.name,
            categoria: CATEGORIAS.find((c) => c.valor === p.category)?.nombre ?? p.category,
            conStock: leerJson<ResumenVariante[]>(p.variantSummary, []).some((v) => v.inStock),
          })),
        ),
      )
      .catch((err: unknown) => {
        console.error("No se pudieron cargar los productos:", err);
        setErrorProductos("No se pudieron cargar los productos. Recarga la página para elegir los destacados.");
      });
  }, []);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  if (!contenido) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { datos, vistasPrevias } = contenido;
  return (
    <div className="space-y-8">
      <EnlacesSugeridos />
      <EditorAnuncios inicial={datos.anuncios} />
      <EditorPortada inicial={datos.portada} vistasPrevias={vistasPrevias} />
      <EditorDestacados inicial={datos.destacados} productos={productos} errorProductos={errorProductos} />
      <EditorOcasiones inicial={datos.ocasiones} vistasPrevias={vistasPrevias} />
      <EditorPasos inicial={datos.pasos} />
      <EditorNosotros inicial={datos.nosotros} vistasPrevias={vistasPrevias} />
      <EditorInspiracion inicial={datos.inspiracion} vistasPrevias={vistasPrevias} />
      <EditorPie inicial={datos.pie} />
    </div>
  );
}
