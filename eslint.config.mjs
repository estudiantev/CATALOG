import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // La tienda solo usa Tailwind: sin shadcn ni componentes del panel
    files: ["app/(tienda)/**", "components/tienda/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/components/admin", "@/components/admin/**", "radix-ui", "@radix-ui/*"],
              message:
                "La tienda no usa shadcn. Crea el componente en components/tienda (o components/compartido).",
            },
          ],
        },
      ],
    },
  },
  {
    // El panel no usa componentes de la tienda: sus clases de marca no existen en admin.css
    files: ["app/(admin)/**", "components/admin/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/components/tienda", "@/components/tienda/**"],
              message:
                "El panel no usa componentes de la tienda. Muévelo a components/compartido si lo necesitan ambos.",
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [".next/**", ".amplify/**", "amplify/**", "node_modules/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
