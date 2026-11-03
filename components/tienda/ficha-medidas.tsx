import { type CampoMedida, MEDIDAS } from "@/lib/perfil";
import { Vestido } from "./vestido";

// Ficha de medidas: la silueta del vestido sirena con líneas de costurera en busto,
// cintura y cadera, y la altura a un lado. La usan Mi cuenta (datos guardados) y Mi perfil
// (lo que se va escribiendo, con la medida enfocada resaltada).

// Alturas en el viewBox 300×400 de <Vestido forma="sirena">: busto, cintura (lo más angosto)
// y cadera (lo más ancho). `desde` es donde empieza la línea, un poco antes del borde del vestido.
const LINEAS = [
  { campo: "busto", y: 106, desde: 112 },
  { campo: "cintura", y: 152, desde: 122 },
  { campo: "cadera", y: 214, desde: 114 },
] as const;

// Se recorta el viewBox a x 40–260 para que la silueta ocupe el ancho del recuadro
const RECORTE = { x: 40, ancho: 220, alto: 400 };
const ALTURA = { x: 52, arriba: 46, abajo: 392 };

const formatoCm = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 1 });
const etiquetaDe = (campo: CampoMedida) => MEDIDAS.find((m) => m.campo === campo)?.etiqueta ?? campo;
const texto = (valor: number | null) => (valor === null ? "—" : `${formatoCm.format(valor)} cm`);

export function FichaMedidas({
  medidas,
  copa,
  resaltar = null,
  decorativa = false,
}: {
  medidas: Record<CampoMedida, number | null>;
  copa: string | null;
  // Campo que se está editando; la copa resalta la línea del busto
  resaltar?: CampoMedida | "copa" | null;
  // En el formulario los valores ya están en los campos: la ficha es solo visual
  decorativa?: boolean;
}) {
  const activa = resaltar === "copa" ? "busto" : resaltar;
  const linea = (campo: CampoMedida) =>
    activa === campo
      ? { stroke: "#111111", strokeWidth: 3, strokeDasharray: undefined, opacity: 1 }
      : { stroke: "#111111", strokeWidth: 1.5, strokeDasharray: "5 5", opacity: 0.55 };

  const dato = (activo: boolean) => ({
    dt: `text-[14px] leading-[20px] ${activo ? "text-tinta" : "text-topo"}`,
    dd: `text-[20px] leading-[26px] ${activo ? "font-normal" : "font-light"}`,
  });

  return (
    <div aria-hidden={decorativa || undefined}>
      <div className="grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)] gap-x-3 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,11.5rem)_minmax(0,1fr)]">
        <div className="relative aspect-[220/400] overflow-hidden">
          {/* 136.36% = 300/220 y -18.18% = -40/220: el vestido queda alineado con el recorte */}
          <Vestido
            forma="sirena"
            color="#c1ae9b"
            pliegues={false}
            brillo={0.3}
            className="absolute top-0 left-[-18.18%] h-full w-[136.36%] max-w-none"
          />
          <svg
            viewBox={`${RECORTE.x} 0 ${RECORTE.ancho} ${RECORTE.alto}`}
            className="absolute inset-0 size-full"
            fill="none"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <g className="motion-safe:[&_line]:transition-[stroke-width,opacity]">
              <line x1={ALTURA.x} y1={ALTURA.arriba} x2={ALTURA.x} y2={ALTURA.abajo} {...linea("altura")} />
              <line x1={ALTURA.x - 6} y1={ALTURA.arriba} x2={ALTURA.x + 6} y2={ALTURA.arriba} {...linea("altura")} strokeDasharray={undefined} />
              <line x1={ALTURA.x - 6} y1={ALTURA.abajo} x2={ALTURA.x + 6} y2={ALTURA.abajo} {...linea("altura")} strokeDasharray={undefined} />
              {LINEAS.map((l) => (
                <line key={l.campo} x1={l.desde} y1={l.y} x2={RECORTE.x + RECORTE.ancho} y2={l.y} {...linea(l.campo)} />
              ))}
            </g>
          </svg>
        </div>

        {/* Cada valor a la altura de su línea; altura y copa abajo, junto a la falda */}
        <dl className="relative">
          {LINEAS.map((l) => (
            <div
              key={l.campo}
              style={{ top: `${(l.y / RECORTE.alto) * 100}%` }}
              className="absolute left-0 flex -translate-y-1/2 items-baseline gap-2 whitespace-nowrap"
            >
              <dt className={dato(activa === l.campo).dt}>{etiquetaDe(l.campo)}</dt>
              <dd className={dato(activa === l.campo).dd}>{texto(medidas[l.campo])}</dd>
            </div>
          ))}
          <div className="absolute bottom-0 left-0 flex flex-col gap-1 border-l border-piedra pl-3 whitespace-nowrap">
            <div className="flex items-baseline gap-2">
              <dt className={dato(activa === "altura").dt}>Altura</dt>
              <dd className={dato(activa === "altura").dd}>{texto(medidas.altura)}</dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className={dato(resaltar === "copa").dt}>Copa</dt>
              <dd className={dato(resaltar === "copa").dd}>{copa ?? "—"}</dd>
            </div>
          </div>
        </dl>
      </div>
    </div>
  );
}
