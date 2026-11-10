import Link from "next/link";

export default function ColeccionNoEncontrada() {
  return (
    <section className="px-4 py-24 text-center">
      <h1 className="font-titulo text-[clamp(36px,4vw,56px)] leading-[1.1]">Colección no disponible</h1>
      <p className="mt-4 text-[18px] text-grafito">Esta colección no existe o ya terminó.</p>
      <Link href="/catalogo" className="mt-8 inline-flex min-h-13 items-center justify-center bg-white px-7 text-[15px] font-semibold tracking-[0.06em] uppercase transition-colors hover:bg-arena active:bg-dorado">
        Ver el catálogo
      </Link>
    </section>
  );
}
