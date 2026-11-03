"use client";

import { useState } from "react";
import { invalidarContenido } from "@/app/(admin)/admin/(panel)/contenido/acciones";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { CardFooter } from "@/components/admin/ui/card";
import { Checkbox } from "@/components/admin/ui/checkbox";
import { Label } from "@/components/admin/ui/label";
import { clienteDatos, mensajeErrorDatos } from "@/components/admin/datos";
import {
  type DatosSeccion,
  type Errores,
  PAGINA_INICIO,
  type Seccion,
  type SeccionContenido,
  normalizarSeccion,
  validarSeccion,
} from "@/lib/contenido";
import { cn } from "@/lib/utils";

export type Estado =
  | { tipo: "editando" }
  | { tipo: "guardando"; mensaje: string }
  | { tipo: "guardado"; aviso: string }
  | { tipo: "error"; mensaje: string };

const idCampo = (seccion: Seccion, ruta: string) => `${seccion}-${ruta}`;

// Estado y guardado de una sección. Cada sección es una fila de Content y se guarda por separado.
export function useSeccion<S extends Seccion>(seccion: S, inicial: SeccionContenido<S>) {
  const [visible, setVisible] = useState(inicial.visible);
  const [existe, setExiste] = useState(inicial.existe);
  const [errores, setErrores] = useState<Errores>({});
  const [estado, setEstado] = useState<Estado>({ tipo: "editando" });

  // Al cambiar algo se quita el aviso de "guardado" y el error de ese campo
  function editado(ruta?: string) {
    setEstado((actual) => (actual.tipo === "guardando" ? actual : { tipo: "editando" }));
    if (ruta && errores[ruta]) {
      setErrores((actuales) => {
        const copia = { ...actuales };
        delete copia[ruta];
        return copia;
      });
    }
  }

  // `preparar` corre después de validar y antes de guardar: la portada sube ahí sus fotos
  async function guardar(datos: DatosSeccion[S], preparar?: () => Promise<DatosSeccion[S]>) {
    const encontrados = validarSeccion(seccion, datos);
    setErrores(encontrados);
    const primero = Object.keys(encontrados)[0];
    if (primero) {
      setEstado({ tipo: "error", mensaje: "Revisa los campos marcados en rojo." });
      document.getElementById(idCampo(seccion, primero))?.focus();
      return false;
    }

    try {
      let listos = datos;
      if (preparar) {
        setEstado({ tipo: "guardando", mensaje: "Subiendo fotos…" });
        listos = await preparar();
      }
      setEstado({ tipo: "guardando", mensaje: "Guardando…" });
      const fila = {
        page: PAGINA_INICIO,
        section: seccion,
        data: JSON.stringify(normalizarSeccion(seccion, listos)),
        visible,
      };
      const actualizar = () => clienteDatos.models.Content.update(fila);
      let { errors } = existe ? await actualizar() : await clienteDatos.models.Content.create(fila);
      // Si alguien la creó mientras tanto (otra pestaña), se actualiza
      if (!existe && errors?.some((e) => /conditional/i.test(`${e.errorType} ${e.message}`))) {
        ({ errors } = await actualizar());
      }
      if (errors?.length) throw new Error(mensajeErrorDatos(errors));
      setExiste(true);
    } catch (error) {
      console.error(`No se pudo guardar la sección ${seccion}:`, error);
      setEstado({ tipo: "error", mensaje: error instanceof Error ? error.message : "No se pudo guardar. Inténtalo de nuevo." });
      return false;
    }

    // Si esto falla, la página de inicio igual se actualiza sola en 10 minutos
    const invalidada = await invalidarContenido().then(
      () => true,
      () => false,
    );
    setEstado({
      tipo: "guardado",
      aviso: invalidada
        ? "Cambios guardados. Ya se ven en la página de inicio."
        : "Cambios guardados. La página de inicio puede tardar hasta 10 minutos en mostrarlos.",
    });
    return true;
  }

  return {
    visible,
    cambiarVisible: (valor: boolean) => {
      setVisible(valor);
      editado();
    },
    errores,
    setErrores,
    estado,
    ocupado: estado.tipo === "guardando",
    editado,
    guardar,
    // Para <Campo>: el id del control y su error
    campo: (ruta: string) => ({ id: idCampo(seccion, ruta), error: errores[ruta] }),
    // Para el control: su id y la accesibilidad del error (o de la ayuda)
    entrada: (ruta: string, conAyuda = false) => {
      const id = idCampo(seccion, ruta);
      return {
        id,
        "aria-invalid": errores[ruta] ? true : undefined,
        "aria-describedby": errores[ruta] ? `${id}-error` : conAyuda ? `${id}-ayuda` : undefined,
      };
    },
  };
}

// Etiqueta, control y error (o ayuda, si no hay error)
export function Campo({
  id,
  etiqueta,
  error,
  ayuda,
  className,
  children,
}: {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0 space-y-2", className)}>
      <Label htmlFor={id}>{etiqueta}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        ayuda && (
          <p id={`${id}-ayuda`} className="text-sm text-muted-foreground">
            {ayuda}
          </p>
        )
      )}
    </div>
  );
}

export function CasillaVisible({ id, visible, onChange }: { id: string; visible: boolean; onChange: (visible: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} name={id} checked={visible} onCheckedChange={(valor) => onChange(valor === true)} />
      <Label htmlFor={id}>Mostrar esta sección en la página de inicio</Label>
    </div>
  );
}

// Botón de guardar de la sección, con el aviso de guardado o el error
export function PieSeccion({ estado, texto }: { estado: Estado; texto: string }) {
  return (
    <CardFooter className="flex-col items-stretch gap-4 border-t">
      {estado.tipo === "error" && (
        <Alert variant="destructive">
          <AlertDescription>{estado.mensaje}</AlertDescription>
        </Alert>
      )}
      {estado.tipo === "guardado" && (
        <Alert>
          <AlertDescription>{estado.aviso}</AlertDescription>
        </Alert>
      )}
      <div>
        <Button type="submit" disabled={estado.tipo === "guardando"}>
          {estado.tipo === "guardando" ? estado.mensaje : texto}
        </Button>
      </div>
    </CardFooter>
  );
}
