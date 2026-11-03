import Link from "next/link";
import {
  alineadoConPanel,
  botonPrincipal,
  botonSecundario,
  contenedorCuenta,
  etiquetaDato,
  rellenoPanel,
  textoAyuda,
  tituloBloque,
} from "@/components/tienda/estilos-cuenta";
import { FichaMedidas } from "@/components/tienda/ficha-medidas";
import { MEDIDAS, type Perfil, formatoFecha, formatoTelefono } from "@/lib/perfil";

// Cuerpo de Mi cuenta: tus datos a la izquierda y la ficha de medidas a la derecha
export function ResumenCuenta({ perfil, guardado = false }: { perfil: Perfil; guardado?: boolean }) {
  const { medidas } = perfil;
  const hayMedidas = Boolean(medidas.copa) || MEDIDAS.some((m) => medidas[m.campo] !== null);

  const datos = [
    { etiqueta: "Nombre", valor: [perfil.nombre, perfil.apellido].filter(Boolean).join(" ") },
    { etiqueta: "Correo", valor: perfil.correo },
    { etiqueta: "Celular", valor: perfil.telefono && formatoTelefono(perfil.telefono) },
    { etiqueta: "Fecha de nacimiento", valor: perfil.nacimiento && formatoFecha(perfil.nacimiento) },
  ];

  return (
    <div className={`${contenedorCuenta} py-[clamp(36px,5vw,64px)]`}>
      {guardado && (
        <p role="status" className="mb-8 flex items-center gap-2.5 border border-tinta bg-white px-4 py-3 text-[15px] leading-[22px]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          Cambios guardados.
        </p>
      )}

      <div className="grid items-start gap-x-[clamp(32px,5vw,80px)] gap-y-12 lg:grid-cols-2">
        <section aria-labelledby="titulo-datos" className={alineadoConPanel}>
          <h2 id="titulo-datos" className={tituloBloque}>
            Tus datos
          </h2>
          <dl className="mt-5 border-t border-tinta">
            {datos.map((dato) => (
              <div key={dato.etiqueta} className="grid gap-x-4 gap-y-0.5 border-b border-arena py-4 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]">
                <dt className={etiquetaDato}>{dato.etiqueta}</dt>
                <dd className={`text-[17px] leading-[24px] break-words ${dato.valor ? "" : "text-topo"}`}>
                  {dato.valor || "Sin registrar"}
                </dd>
              </div>
            ))}
          </dl>
          <Link href="/cuenta/perfil" className={`${botonPrincipal} mt-8`}>
            Editar mis datos
          </Link>
        </section>

        <section aria-labelledby="titulo-medidas" className={`bg-lino ${rellenoPanel}`}>
          <h2 id="titulo-medidas" className={tituloBloque}>
            Tus medidas
          </h2>
          <p className={`${textoAyuda} mt-1.5 max-w-[46ch]`}>Con ellas te recomendamos la talla y el largo de cada vestido.</p>
          <div className="mt-6">
            <FichaMedidas medidas={medidas} copa={medidas.copa} />
          </div>
          <Link href="/cuenta/perfil#medidas" className={`${botonSecundario} mt-8`}>
            {hayMedidas ? "Editar mis medidas" : "Agregar mis medidas"}
          </Link>
        </section>
      </div>
    </div>
  );
}
