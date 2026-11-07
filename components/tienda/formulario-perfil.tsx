"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { fetchAuthSession, updateUserAttributes } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import {
  campo as estiloCampo,
  etiquetaCampo,
  etiquetaDato,
  margenCuenta,
  panelCuenta,
  panelesCuenta,
  textoAyuda,
  textoError,
  valorDato,
} from "@/components/tienda/estilos-cuenta";
import { botonAzul, botonBlanco, tituloCaja, tituloCajaAzul } from "@/components/tienda/estilos-inicio";
import { FichaMedidas } from "@/components/tienda/ficha-medidas";
import {
  type CampoMedida,
  type CampoPerfil,
  type ErroresPerfil,
  LARGO_NOMBRE,
  MEDIDAS,
  type Perfil,
  TALLAS_COPA,
  type ValoresPerfil,
  leerNumero,
  validarPerfil,
  valoresIniciales,
} from "@/lib/perfil";
// Configura Amplify antes de crear el cliente
import "@/components/compartido/configurar-amplify";

// Cliente de AppSync con la sesión de la clienta: la regla allow.owner() de Customer
// solo le deja crear, leer y editar su propio perfil. Vive aquí para que el resto de la
// tienda no cargue el cliente de datos.
const clienteDatos = generateClient<Schema>();

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
  className = "",
  children,
}: {
  id: CampoPerfil;
  etiqueta: string;
  ayuda?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex min-w-0 flex-col ${className}`}>
      <label htmlFor={id} className={etiquetaCampo}>
        {etiqueta}
      </label>
      <div className="mt-2">{children}</div>
      {/* Con error se muestra solo el error: ya explica qué escribir */}
      {ayuda && !error && (
        <p id={`${id}-ayuda`} className={`${textoAyuda} mt-1.5`}>
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={`${textoError} mt-1.5`}>
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
  // Medida que se está llenando: la ficha resalta su línea
  const [enfocada, setEnfocada] = useState<CampoMedida | "copa" | null>(null);

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
    "aria-describedby": (errores[id] ? `${id}-error` : conAyuda ? `${id}-ayuda` : undefined),
    className: estiloCampo,
  });

  // Lo que se va escribiendo, para la ficha (los rangos se revisan al guardar)
  const medidasEnVivo = Object.fromEntries(MEDIDAS.map((m) => [m.campo, leerNumero(valores[m.campo])])) as Record<
    CampoMedida,
    number | null
  >;

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
      setError("No se guardaron los cambios. Revisa tu conexión e inténtalo de nuevo.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={guardar} noValidate>
      <div className={panelesCuenta}>
        {/* El relleno va en un div: en un <fieldset> quedaría debajo del <legend> */}
        <div className={`${panelCuenta} bg-white`}>
          <fieldset className="w-full min-w-0">
            <legend className={tituloCaja}>Tus datos</legend>
            <div className="mt-7 grid gap-x-4 gap-y-6 sm:grid-cols-2">
              <Campo id="nombre" etiqueta="Nombre" error={errores.nombre}>
                <input {...campo("nombre")} autoComplete="given-name" maxLength={LARGO_NOMBRE} required />
              </Campo>
              <Campo id="apellido" etiqueta="Apellido" error={errores.apellido}>
                <input {...campo("apellido")} autoComplete="family-name" maxLength={LARGO_NOMBRE} />
              </Campo>
              <div className="flex min-w-0 flex-col gap-0.5 border-y border-tinta py-[18px] sm:col-span-2">
                <p className={etiquetaDato}>Correo</p>
                <p className={valorDato}>{perfil.correo || "—"}</p>
                <p className={`${textoAyuda} mt-1`}>Es tu usuario para iniciar sesión, por eso no se cambia aquí.</p>
              </div>
              <Campo id="telefono" etiqueta="Celular" ayuda="9 dígitos. De otro país, con su código (+…)." error={errores.telefono}>
                <input {...campo("telefono", true)} type="tel" inputMode="tel" autoComplete="tel" placeholder="987 654 321" />
              </Campo>
              <Campo id="nacimiento" etiqueta="Fecha de nacimiento" error={errores.nacimiento}>
                <input {...campo("nacimiento")} type="date" min="1900-01-01" max={hoy} autoComplete="bday" />
              </Campo>
            </div>
          </fieldset>
        </div>

        {/* El fondo va en un div: un <fieldset> con fondo y relleno descoloca su <legend> */}
        <div id="medidas" className={`${panelCuenta} scroll-mt-6 bg-tinte-azul`}>
          <fieldset className="w-full min-w-0">
            <legend className={tituloCajaAzul}>Tus medidas</legend>
            <p className="mt-4 max-w-[46ch] text-[15px] leading-[1.5] text-[#444444]">Todas son opcionales y van en centímetros.</p>
            <div className="mt-6 border border-tinta bg-white p-[clamp(16px,2vw,24px)]">
              <FichaMedidas medidas={medidasEnVivo} copa={valores.copa || null} resaltar={enfocada} decorativa />
            </div>
            <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-6">
              {MEDIDAS.map((m) => (
                <Campo key={m.campo} id={m.campo} etiqueta={m.etiqueta} error={errores[m.campo]}>
                  <input
                    {...campo(m.campo)}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="cm"
                    onFocus={() => setEnfocada(m.campo)}
                    onBlur={() => setEnfocada(null)}
                  />
                </Campo>
              ))}
              <Campo id="copa" etiqueta="Copa" error={errores.copa}>
                <select {...campo("copa")} onFocus={() => setEnfocada("copa")} onBlur={() => setEnfocada(null)}>
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
        </div>
      </div>

      <div className={`flex flex-wrap items-center gap-2 border-b border-tinta py-6 ${margenCuenta}`}>
        <button type="submit" disabled={enviando} className={`${botonAzul} cursor-pointer disabled:cursor-wait disabled:opacity-70`}>
          {enviando ? "Guardando…" : "Guardar cambios"}
        </button>
        <Link href="/cuenta" className={botonBlanco}>
          Cancelar
        </Link>
        {error && (
          <p role="alert" className={`${textoError} basis-full pt-2`}>
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
