"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { fetchAuthSession, updateUserAttributes } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { botonCuenta, campoCuenta, errorCuenta, etiquetaCuenta } from "@/components/tienda/marco-cuenta";
import {
  type CampoPerfil,
  type ErroresPerfil,
  LARGO_NOMBRE,
  MEDIDAS,
  type Perfil,
  TALLAS_COPA,
  type ValoresPerfil,
  validarPerfil,
  valoresIniciales,
} from "@/lib/perfil";
// Configura Amplify antes de crear el cliente
import "@/components/compartido/configurar-amplify";

// Cliente de AppSync con la sesión de la clienta: la regla allow.owner() de Customer
// solo le deja crear, leer y editar su propio perfil. Vive aquí para que el resto de la
// tienda no cargue el cliente de datos.
const clienteDatos = generateClient<Schema>();

const textoAyuda = "mt-1.5 text-[13px] leading-[18px] text-topo";

// El encabezado muestra el nombre del token de Cognito: se actualiza para que coincida.
// Si falla, el perfil igual queda guardado (Customer es el dato que vale).
async function sincronizarNombre(nombre: string) {
  try {
    await updateUserAttributes({ userAttributes: { given_name: nombre } });
    // Token nuevo con el nombre nuevo; el encabezado escucha el evento tokenRefresh
    await fetchAuthSession({ forceRefresh: true });
  } catch (error) {
    console.warn("No se pudo actualizar el nombre en Cognito:", error);
  }
}

function Campo({
  id,
  etiqueta,
  ayuda,
  error,
  children,
}: {
  id: CampoPerfil;
  etiqueta: string;
  ayuda?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <label htmlFor={id} className={etiquetaCuenta}>
        {etiqueta}
      </label>
      <div className="mt-1.5">{children}</div>
      {ayuda && (
        <p id={`${id}-ayuda`} className={textoAyuda}>
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] leading-[18px] text-vino">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormularioPerfil({
  perfil,
  customerId,
  nombreEnToken,
  hoy,
}: {
  perfil: Perfil;
  customerId: string;
  nombreEnToken: string;
  hoy: string; // AAAA-MM-DD en Perú: límite de la fecha de nacimiento
}) {
  const router = useRouter();
  const [valores, setValores] = useState<ValoresPerfil>(() => valoresIniciales(perfil));
  const [errores, setErrores] = useState<ErroresPerfil>({});
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Props de cada campo: su valor, el cambio (que borra su error) y la accesibilidad del error
  const campo = (id: CampoPerfil, conAyuda = false) => ({
    id,
    name: id,
    value: valores[id],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const valor = e.target.value;
      setValores((actuales) => ({ ...actuales, [id]: valor }));
      if (errores[id]) setErrores((actuales) => ({ ...actuales, [id]: undefined }));
    },
    "aria-invalid": errores[id] ? true : undefined,
    "aria-describedby": [conAyuda && `${id}-ayuda`, errores[id] && `${id}-error`].filter(Boolean).join(" ") || undefined,
    // aria-invalid: gana al border-tinta de campoCuenta por especificidad
    className: `${campoCuenta} aria-invalid:border-vino`,
  });

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const resultado = validarPerfil(valores, hoy);
    if (!resultado.ok) {
      setErrores(resultado.errores);
      const primero = Object.keys(resultado.errores)[0];
      if (primero) document.getElementById(primero)?.focus();
      return;
    }

    setErrores({});
    setEnviando(true);
    try {
      const { datos } = resultado;
      // Normalmente el Customer ya existe (lo crea post-confirmation); si no, se crea aquí
      const { errors } = perfil.existe
        ? await clienteDatos.models.Customer.update({ customerId, ...datos })
        : await clienteDatos.models.Customer.create({ customerId, email: perfil.correo, ...datos });
      if (errors?.length) throw new Error(errors.map((x) => x.message).join("; "));

      if (datos.firstName !== nombreEnToken) await sincronizarNombre(datos.firstName);
      // replace: el botón Atrás no vuelve al formulario con los datos de antes
      router.replace("/cuenta?guardado=1");
      router.refresh();
    } catch (err) {
      console.error("No se pudo guardar el perfil:", err);
      setError("No se pudieron guardar tus datos. Inténtalo de nuevo.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={guardar} noValidate className="mt-6 flex flex-col gap-8">
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-4 text-[18px]">Datos personales</legend>
        <Campo id="nombre" etiqueta="Nombre" error={errores.nombre}>
          <input {...campo("nombre")} autoComplete="given-name" maxLength={LARGO_NOMBRE} required />
        </Campo>
        <Campo id="apellido" etiqueta="Apellido" error={errores.apellido}>
          <input {...campo("apellido")} autoComplete="family-name" maxLength={LARGO_NOMBRE} />
        </Campo>
        <div>
          <p className={etiquetaCuenta}>Correo</p>
          <p className="mt-1.5 text-[16px] leading-[24px] break-all">{perfil.correo || "—"}</p>
          <p className={textoAyuda}>Es con el que inicias sesión; no se cambia aquí.</p>
        </div>
        <Campo
          id="telefono"
          etiqueta="Celular"
          ayuda="9 dígitos. Si es de otro país, empieza con su código (+…)."
          error={errores.telefono}
        >
          <input {...campo("telefono", true)} type="tel" inputMode="tel" autoComplete="tel" placeholder="987 654 321" />
        </Campo>
        <Campo id="nacimiento" etiqueta="Fecha de nacimiento" error={errores.nacimiento}>
          <input {...campo("nacimiento")} type="date" min="1900-01-01" max={hoy} autoComplete="bday" />
        </Campo>
      </fieldset>

      <fieldset>
        <legend className="text-[18px]">Mis medidas</legend>
        <p className={`${textoAyuda} mb-4`}>
          Opcionales, en centímetros. Nos ayudan a recomendarte la talla y el largo de cada vestido.
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          {MEDIDAS.map((m) => (
            <Campo key={m.campo} id={m.campo} etiqueta={m.etiqueta} error={errores[m.campo]}>
              <input {...campo(m.campo)} inputMode="decimal" autoComplete="off" placeholder="cm" />
            </Campo>
          ))}
          <Campo id="copa" etiqueta="Copa" error={errores.copa}>
            <select {...campo("copa")}>
              <option value="">Sin indicar</option>
              {TALLAS_COPA.map((talla) => (
                <option key={talla} value={talla}>
                  {talla}
                </option>
              ))}
            </select>
          </Campo>
        </div>
      </fieldset>

      <div className="flex flex-col items-center gap-3">
        {error && (
          <p role="alert" className={errorCuenta}>
            {error}
          </p>
        )}
        <button type="submit" disabled={enviando} className={botonCuenta}>
          {enviando ? "Guardando…" : "Guardar cambios"}
        </button>
        <Link href="/cuenta" className="text-[15px] hover:underline">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
