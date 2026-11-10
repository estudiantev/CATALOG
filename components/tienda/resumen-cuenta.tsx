import Link from "next/link";
import { etiquetaDato, margenCuenta, panelCuenta, panelesCuenta, tituloPanelAzul, tituloPanelVerde, valorDato } from "@/components/tienda/estilos-cuenta";
import { botonAzul, botonBlanco } from "@/components/tienda/estilos-inicio";
import { FichaMedidas } from "@/components/tienda/ficha-medidas";
import { MEDIDAS, type Perfil, formatoFecha, formatoTelefono } from "@/lib/perfil";

// Cuerpo de Mi cuenta: tus datos a la izquierda y la ficha de medidas a la derecha
export function ResumenCuenta({ perfil, guardado = false }: { perfil: Perfil; guardado?: boolean }) {
  const { medidas } = perfil;
  const hayMedidas = Boolean(medidas.copa) || MEDIDAS.some((m) => medidas[m.campo] !== null);

  const datos = [
    { etiqueta: "Nombre", valor: [perfil.nombre, perfil.apellido].filter(Boolean).join(" ") },
    { etiqueta: "Celular", valor: perfil.telefono && formatoTelefono(perfil.telefono) },
    { etiqueta: "Correo", valor: perfil.correo },
    { etiqueta: "Fecha de nacimiento", valor: perfil.nacimiento && formatoFecha(perfil.nacimiento) },
  ];

  return (
    <>
      {guardado && (
        <p role="status" className={`flex items-center gap-2.5 bg-tinte-verde py-3 text-[15px] font-medium text-acento2-oscuro ${margenCuenta}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none">
            <path d="M5 12l5 5 9-10" />
          </svg>
          Cambios guardados.
        </p>
      )}

      <div className={panelesCuenta}>
        <section aria-labelledby="titulo-datos" className={`${panelCuenta} bg-white`}>
          <h2 id="titulo-datos" className={tituloPanelVerde}>
            Tus datos
          </h2>
          <dl className="mt-5 grid w-full grid-cols-1 gap-x-6 gap-y-3.5 py-3.5 sm:grid-cols-2">
            {datos.map((dato) => (
              <div key={dato.etiqueta} className="flex min-w-0 flex-col gap-0.5">
                <dt className={etiquetaDato}>{dato.etiqueta}</dt>
                <dd className={`${valorDato} ${dato.valor ? "" : "text-[#8a8a8a]"}`}>{dato.valor || "Sin registrar"}</dd>
              </div>
            ))}
          </dl>
          <Link href="/cuenta/perfil" className={`${botonAzul} mt-6`}>
            Editar mis datos
          </Link>
        </section>

        <section aria-labelledby="titulo-medidas" className={`${panelCuenta} bg-tinte-azul`}>
          <h2 id="titulo-medidas" className={tituloPanelAzul}>
            Tus medidas
          </h2>
          <p className="mt-3 max-w-[46ch] text-[14px] leading-[1.5] text-[#444444]">Con ellas te recomendamos la talla y el largo de cada vestido.</p>
          <div className="mt-4 w-full max-w-[22rem] bg-white p-3.5">
            <FichaMedidas medidas={medidas} copa={medidas.copa} />
          </div>
          <Link href="/cuenta/perfil#medidas" className={`${botonBlanco} mt-6`}>
            {hayMedidas ? "Editar mis medidas" : "Agregar mis medidas"}
          </Link>
        </section>
      </div>
    </>
  );
}
