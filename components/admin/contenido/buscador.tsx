"use client";

import { type ComponentProps, useEffect, useId, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/admin/ui/badge";
import { Input } from "@/components/admin/ui/input";
import { normalizarTexto } from "@/lib/colecciones";

export type OpcionBuscador = { id: string; nombre: string; aviso?: string };

// Un campo que filtra una lista mientras se escribe. Las flechas recorren la lista, Enter elige y
// Escape la cierra.
export function Buscador({
  opciones,
  onElegir,
  sinResultados,
  ...entrada
}: {
  opciones: OpcionBuscador[];
  onElegir: (id: string) => void;
  sinResultados: string;
} & Pick<ComponentProps<"input">, "id" | "aria-invalid" | "aria-describedby" | "placeholder" | "disabled">) {
  const [texto, setTexto] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activa, setActiva] = useState(0);
  const idLista = useId();
  const lista = useRef<HTMLUListElement>(null);

  const buscado = normalizarTexto(texto.trim());
  const resultados = opciones.filter((o) => normalizarTexto(o.nombre).includes(buscado));
  const elegida = resultados[Math.min(activa, resultados.length - 1)];

  useEffect(() => {
    if (abierto) lista.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [abierto, activa]);

  function elegir(id: string) {
    onElegir(id);
    setTexto("");
    setActiva(0);
    setAbierto(false);
  }

  function teclear(e: React.KeyboardEvent<HTMLInputElement>) {
    const total = resultados.length;
    if (e.key === "Enter") {
      e.preventDefault(); // Enter no debe guardar el formulario mientras se busca
      if (abierto && elegida) elegir(elegida.id);
    } else if (e.key === "Escape") {
      setAbierto(false);
    } else if ((e.key === "ArrowDown" || e.key === "ArrowUp") && total > 0) {
      e.preventDefault();
      if (abierto) setActiva((actual) => (actual + (e.key === "ArrowDown" ? 1 : total - 1)) % total);
      setAbierto(true);
    }
  }

  return (
    <div className="relative">
      <Search aria-hidden="true" className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
      <Input
        {...entrada}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={abierto}
        aria-controls={idLista}
        aria-activedescendant={abierto && elegida ? `${idLista}-${elegida.id}` : undefined}
        autoComplete="off"
        className="pl-8"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setActiva(0);
          setAbierto(true);
        }}
        onClick={() => setAbierto(true)}
        onBlur={() => setAbierto(false)}
        onKeyDown={teclear}
      />
      {abierto && (
        <ul ref={lista} id={idLista} role="listbox" aria-label="Resultados" className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {resultados.map((o) => (
            <li
              key={o.id}
              id={`${idLista}-${o.id}`}
              role="option"
              aria-selected={o === elegida}
              // Sin esto el campo pierde el foco y la lista se cierra antes del clic
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => elegir(o.id)}
              onMouseEnter={() => setActiva(resultados.indexOf(o))}
              className={`flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${o === elegida ? "bg-accent text-accent-foreground" : ""}`}
            >
              <span className="min-w-0 flex-1 truncate">{o.nombre}</span>
              {o.aviso && <Badge variant="secondary">{o.aviso}</Badge>}
            </li>
          ))}
          {resultados.length === 0 && (
            <li role="option" aria-selected="false" aria-disabled="true" className="px-2 py-1.5 text-sm text-muted-foreground">
              {sinResultados}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
