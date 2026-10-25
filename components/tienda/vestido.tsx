// Ilustraciones de vestidos del diseño (marcadores hasta tener fotos de productos)

type Forma = "sirena" | "xv" | "corto" | "floreado";

type Props = {
  forma: Forma;
  color: string;
  className?: string;
  // Texto alternativo; sin él la ilustración es decorativa
  etiqueta?: string;
  // Color de los tirantes (sirena), si es distinto al del vestido
  tirantes?: string;
  // Opacidad de los brillos blancos
  brillo?: number;
  // Color de los pliegues oscuros (sirena); false para no dibujarlos
  pliegues?: string | false;
};

// Centros de las flores del vestido floreado
const FLORES = [
  [134, 100], [166, 104], [142, 136], [144, 186], [136, 226], [168, 236],
  [128, 270], [156, 276], [184, 290], [118, 318], [146, 320], [176, 334],
];

export function Vestido({
  forma,
  color,
  className,
  etiqueta,
  tirantes = color,
  brillo,
  pliegues = "#000000",
}: Props) {
  const accesible = etiqueta
    ? { role: "img", "aria-label": etiqueta }
    : { "aria-hidden": true };

  return (
    <svg className={className} viewBox="0 0 300 400" {...accesible}>
      {forma === "sirena" && (
        <>
          <ellipse cx="152" cy="390" rx="96" ry="6" fill="#000000" opacity="0.1" />
          <path d="M131 46 C129 62 127 78 124.5 92" stroke={tirantes} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M169 46 C171 62 173 78 175.5 92" stroke={tirantes} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path fill={color} d="M124 94 C131 86 143 87 150 99 C157 87 169 86 176 94 C179 112 175 134 168 152 C174 172 178 200 176 222 C174 246 168 268 166 282 C180 320 208 350 238 372 C200 392 120 398 64 382 C96 356 122 320 134 282 C132 268 126 246 124 222 C122 200 126 172 132 152 C125 134 121 112 124 94 Z" />
          <g fill="none" stroke="#ffffff" strokeLinecap="round" strokeWidth="2.2" opacity={brillo ?? 0.2}>
            <path d="M140 104 C137 126 139 146 142 158" />
            <path d="M143 168 C140 200 140 240 143 280" />
            <path d="M144 296 C144 330 140 360 132 388" />
            <path d="M126 302 C116 330 100 354 84 374" />
          </g>
          {pliegues && (
            <g fill="none" stroke={pliegues} strokeLinecap="round" strokeWidth="2" opacity="0.3">
              <path d="M132 152 C142 156 158 156 168 152" />
              <path d="M134 282 C142 288 158 288 166 282" />
              <path d="M158 292 C170 326 190 354 214 382" />
            </g>
          )}
        </>
      )}

      {forma === "xv" && (
        <>
          <ellipse cx="150" cy="386" rx="122" ry="7" fill="#000000" opacity="0.1" />
          <path fill={color} d="M122 92 C112 90 104 96 105 106 C112 110 119 107 123 101 Z" />
          <path fill={color} d="M178 92 C188 90 196 96 195 106 C188 110 181 107 177 101 Z" />
          <path fill={color} d="M122 92 C130 83 143 84 150 96 C157 84 170 83 178 92 L177 101 C179 122 174 144 166 160 C188 196 224 262 256 352 C230 370 208 374 196 366 C180 380 164 382 150 372 C136 382 120 380 104 366 C92 374 70 370 44 352 C76 262 112 196 134 160 C126 144 121 122 123 101 Z" />
          <g fill="none" stroke="#000000" strokeLinecap="round" strokeWidth="2" opacity="0.14">
            <path d="M134 160 L150 172 L166 160" />
            <path d="M78 270 C98 284 116 286 126 280 C136 290 144 292 150 286 C156 292 164 290 174 280 C184 286 202 284 222 270" />
            <path d="M138 178 C124 230 110 290 104 362" />
            <path d="M162 178 C176 230 190 290 196 362" />
          </g>
          <g fill="none" stroke="#ffffff" strokeLinecap="round" strokeWidth="2.6" opacity={brillo ?? 0.35}>
            <path d="M141 106 C139 126 141 146 145 158" />
            <path d="M118 206 C104 246 94 292 86 338" />
            <path d="M150 190 C150 240 150 300 150 356" />
          </g>
        </>
      )}

      {forma === "corto" && (
        <>
          <ellipse cx="153" cy="362" rx="80" ry="6" fill="#000000" opacity="0.12" />
          <path fill={color} d="M116 132 C134 116 154 92 174 68 C180 70 184 74 186 80 C188 110 184 142 176 184 C188 228 206 278 226 330 C188 348 118 348 80 330 C100 278 116 228 126 184 C120 170 116 152 116 132 Z" />
          <path fill={color} d="M176 70 C164 58 150 62 156 74 C161 82 171 78 176 70 Z" />
          <path fill={color} d="M176 70 C186 56 202 58 198 70 C195 78 184 78 176 70 Z" />
          <path d="M176 70 C172 82 168 92 162 100" stroke={color} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M177 71 C183 84 186 94 190 102" stroke={color} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <g fill="none" stroke="#000000" strokeLinecap="round" strokeWidth="2" opacity="0.28">
            <path d="M126 184 C141 189 161 189 176 184" />
            <path d="M162 194 C174 246 188 292 200 336" />
          </g>
          <g fill="none" stroke="#ffffff" strokeLinecap="round" strokeWidth="2.4" opacity={brillo ?? 0.22}>
            <path d="M134 136 C134 152 136 168 140 180" />
            <path d="M140 196 C130 246 118 292 106 334" />
            <path d="M152 196 C152 246 153 292 154 338" />
          </g>
        </>
      )}

      {forma === "floreado" && (
        <>
          <ellipse cx="150" cy="370" rx="80" ry="6" fill="#000000" opacity="0.1" />
          <path fill={color} d="M128 66 L150 116 L172 66 C186 68 196 78 202 94 C192 98 182 96 176 90 C177 114 173 138 166 158 C176 220 192 290 208 352 C174 366 126 366 92 352 C108 290 124 220 134 158 C127 138 123 114 124 90 C118 96 108 98 98 94 C104 78 114 68 128 66 Z" />
          <g fill="none" stroke="#3d5a78" strokeLinecap="round" strokeWidth="1.6" opacity="0.3">
            <path d="M134 158 C144 162 156 162 166 158" />
            <path d="M166 162 C160 232 146 300 120 360" />
            <path d="M160 160 C163 176 161 190 156 202" />
            <path d="M163 160 C171 172 174 186 172 198" />
          </g>
          <g fill="#ffffff">
            {FLORES.map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <circle cx={x - 3.6} cy={y} r="3" />
                <circle cx={x + 3.6} cy={y} r="3" />
                <circle cx={x} cy={y - 3.6} r="3" />
                <circle cx={x} cy={y + 3.6} r="3" />
              </g>
            ))}
          </g>
          <g fill="#e3b448">
            {FLORES.map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" />
            ))}
          </g>
        </>
      )}
    </svg>
  );
}
