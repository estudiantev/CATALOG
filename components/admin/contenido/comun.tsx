"use client";

import { useState } from "react";
import { invalidarContenido } from "@/app/(admin)/admin/(panel)/contenido/acciones";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { CardFooter } from "@/components/admin/ui/card";
import { Checkbox } from "@/components/admin/ui/checkbox";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { clienteDatos, mensajeErrorDatos } from "@/components/admin/datos";
import {
  type Boton,
  type DatosSeccion,
  type Errores,
  LARGO,
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

export const idCampo = (formulario: string, ruta: string) => `${formulario}-${ruta}`;

const ID_ENLACES = "enlaces-sugeridos";

// Sugerencias para los enlaces de los botones (se puede escribir cualquier otro válido)
const ENLACES_SUGERIDOS = [
  { valor: "/catalogo", nombre: "Catálogo completo" },
  { valor: "/catalogo?coleccion=gala", nombre: "Vestidos de gala" },
  { valor: "/catalogo?coleccion=xv", nombre: "Vestidos de XV" },
  { valor: "/catalogo?coleccion=cortos", nombre: "Vestidos cortos" },
  { valor: "/catalogo?coleccion=floreados", nombre: "Vestidos floreados" },
  { valor: "/colecciones", nombre: "Todas las colecciones" },
  { valor: "/#catalogo", nombre: "Sección Catálogo" },
  { valor: "/#colecciones", nombre: "Sección Colecciones" },
  { valor: "/#pasos", nombre: "Sección Alquiler en 3 pasos" },
  { valor: "/#nosotros", nombre: "Sección Quiénes somos" },
  { valor: "/#inspiracion", nombre: "Sección Inspiración" },
];

// Va una sola vez en la página: la comparten todos los campos de enlace
export function EnlacesSugeridos() {
  return (
    <datalist id={ID_ENLACES}>
      {ENLACES_SUGERIDOS.map((enlace) => (
        <option key={enlace.valor} value={enlace.valor}>
          {enlace.nombre}
        </option>
      ))}
    </datalist>
  );
}

// Estado de un formulario y lo que sus campos necesitan para mostrar los errores
export function useFormulario(formulario: string) {
  const [errores, setErrores] = useState<Errores>({});
  const [estado, setEstado] = useState<Estado>({ tipo: "editando" });

  return {
    errores,
    setErrores,
    estado,
    setEstado,
    // Al cambiar algo se quita el aviso de "guardado" y el error de ese campo
    editado: (ruta?: string) => {
      setEstado((actual) => (actual.tipo === "guardando" ? actual : { tipo: "editando" }));
      if (ruta && errores[ruta]) {
        setErrores((actuales) => {
          const copia = { ...actuales };
          delete copia[ruta];
          return copia;
        });
      }
    },
    // Para <Campo>: el id del control y su error
    campo: (ruta: string) => ({ id: idCampo(formulario, ruta), error: errores[ruta] }),
    // Para el control: su id y la accesibilidad del error (o de la ayuda)
    entrada: (ruta: string, conAyuda = false) => {
      const id = idCampo(formulario, ruta);
      return {
        id,
        "aria-invalid": errores[ruta] ? true : undefined,
        "aria-describedby": errores[ruta] ? `${id}-error` : conAyuda ? `${id}-ayuda` : undefined,
      };
    },
  };
}

// Estado y guardado de una sección. Cada sección es una fila de Content y se guarda por separado.
export function useSeccion<S extends Seccion>(seccion: S, inicial: SeccionContenido<S>) {
  const [visible, setVisible] = useState(inicial.visible);
  const [existe, setExiste] = useState(inicial.existe);
  const { setEstado, ...formulario } = useFormulario(seccion);
  const { setErrores, editado, estado } = formulario;

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
    ...formulario,
    visible,
    cambiarVisible: (valor: boolean) => {
      setVisible(valor);
      editado();
    },
    ocupado: estado.tipo === "guardando",
    guardar,
  };
}

// Lo que los campos compartidos necesitan del formulario
export type Controles = Pick<ReturnType<typeof useFormulario>, "errores" | "setErrores" | "editado" | "campo" | "entrada">;

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

// El texto y a dónde lleva un botón. `ruta` es la del botón en la sección, como "boton"
export function CamposEnlace({
  s,
  ruta,
  etiqueta,
  ayuda,
  boton,
  onChange,
}: {
  s: Controles;
  ruta: string;
  etiqueta: string;
  ayuda?: string;
  boton: Boton;
  onChange: (campo: keyof Boton, valor: string) => void;
}) {
  return (
    <>
      <Campo {...s.campo(`${ruta}.texto`)} etiqueta={etiqueta} ayuda={ayuda}>
        <Input {...s.entrada(`${ruta}.texto`, Boolean(ayuda))} maxLength={LARGO.boton} value={boton.texto} onChange={(e) => onChange("texto", e.target.value)} />
      </Campo>
      <Campo {...s.campo(`${ruta}.enlace`)} etiqueta="Lleva a" ayuda="Una página (/catalogo), una sección (/#pasos) o una dirección https://">
        <Input
          {...s.entrada(`${ruta}.enlace`, true)}
          list={ID_ENLACES}
          maxLength={LARGO.enlace}
          spellCheck={false}
          autoCapitalize="none"
          value={boton.enlace}
          onChange={(e) => onChange("enlace", e.target.value)}
        />
      </Campo>
    </>
  );
}

export function CasillaVisible({
  id,
  visible,
  onChange,
  etiqueta = "Mostrar esta sección en la página de inicio",
}: {
  id: string;
  visible: boolean;
  onChange: (visible: boolean) => void;
  etiqueta?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} name={id} checked={visible} onCheckedChange={(valor) => onChange(valor === true)} />
      <Label htmlFor={id}>{etiqueta}</Label>
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
