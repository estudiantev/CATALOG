import Link from "next/link";

export const campoCuenta =
  "h-[46px] w-full border border-tinta bg-white px-3 text-[16px] text-tinta placeholder:text-topo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta";

export const botonCuenta =
  "flex h-[46px] w-56 cursor-pointer items-center justify-center rounded-lg bg-tinta text-[15px] font-semibold tracking-[0.06em] text-white uppercase transition-colors hover:bg-grafito disabled:cursor-wait disabled:opacity-70";

export const errorCuenta = "w-full text-center text-[14px] leading-[20px] text-vino";

// Recuadro de las páginas de cuenta (login y registro): el formulario a la izquierda
// y, en pantallas grandes, un espacio para una foto de la colección a la derecha
export function MarcoCuenta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-10">
      <div className="mx-auto flex max-w-260 items-stretch gap-8 border border-tinta bg-white p-4 sm:px-8 sm:py-8">
        <div className="flex flex-1 justify-center">
          <div className="flex w-full max-w-95 flex-col items-center gap-6">
            <div className="w-full border border-tinta px-6 pt-10 pb-8">
              <h1 className="text-center font-display text-[44px] leading-[1.1] font-bold text-tinta">{titulo}</h1>
              {children}
            </div>
            <p className="text-[15px]">
              <Link href="#" className="underline underline-offset-2">Términos</Link>
              {" y "}
              <Link href="#" className="underline underline-offset-2">Aviso de privacidad</Link>
            </p>
          </div>
        </div>
        <div aria-hidden="true" className="hidden w-px bg-tinta md:block" />
        <div aria-hidden="true" className="hidden flex-1 bg-lino md:block" />
      </div>
    </div>
  );
}
