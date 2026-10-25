# FARA Collections: catálogo y panel de administración

Tienda (catálogo público) y panel interno para el staff, en una sola app de Next.js con backend de AWS Amplify Gen 2.

- **Next.js 15** (App Router) + **React 19**
- **AWS Amplify Gen 2**: Cognito, AppSync/DynamoDB y S3 (carpeta `amplify/`)
- **Tailwind CSS v4** en las dos zonas
- **shadcn/ui** solo en el panel de administración

## Cómo correrlo

Requiere Node.js 20 o superior.

```bash
npm install
npx ampx sandbox   # crea tu backend de pruebas y genera amplify_outputs.json
npm run dev        # en otra terminal
```

- Tienda: http://localhost:3000
- Panel: http://localhost:3000/admin

`amplify_outputs.json` no se sube al repo: lo genera `ampx sandbox` en tu máquina y `ampx pipeline-deploy` en Amplify Hosting.

## Estructura: tienda y panel separados

```
app/
├── (tienda)/                  ← zona pública (la URL no incluye "(tienda)")
│   ├── layout.tsx             ← layout raíz: <html>, tienda.css, Amplify
│   ├── tienda.css             ← Tailwind + colores de marca (sin shadcn)
│   └── page.tsx               ← /
└── (admin)/                   ← zona del staff
    ├── layout.tsx             ← layout raíz: <html>, admin.css, Amplify, noindex
    ├── admin.css              ← Tailwind + tema de shadcn
    └── admin/
        ├── login/page.tsx     ← /admin/login (sin menú, sin registro)
        └── (panel)/           ← páginas con el menú del panel
            ├── layout.tsx     ← aquí irá el sidebar
            └── page.tsx       ← /admin (dashboard)

components/
├── admin/                     ← solo el panel
│   └── ui/                    ← componentes de shadcn (los crea el CLI)
├── tienda/                    ← solo la tienda (Tailwind puro)
└── compartido/                ← lo usan ambas zonas

lib/
├── amplify-server.ts          ← runWithAmplifyServerContext (Amplify en el servidor)
└── utils.ts                   ← cn() para combinar clases

middleware.ts                  ← redirige /admin según la sesión y el grupo
```

Cada zona tiene su **propio layout raíz** (su propio `<html>`). Así cada una carga solo su CSS: la tienda nunca descarga los estilos de shadcn y el panel nunca descarga los de la tienda. Al pasar de una zona a otra el navegador recarga la página completa, lo cual está bien porque son dos experiencias distintas.

## Reglas de estilos

| | Tienda | Panel |
| --- | --- | --- |
| Tailwind | Sí | Sí |
| shadcn/ui | **No** | Sí |
| CSS | `app/(tienda)/tienda.css` | `app/(admin)/admin.css` |
| Colores | De marca: `bg-crema`, `text-bronce`, `text-negro`, `text-cafe`, `text-gris` | De shadcn: `bg-primary`, `text-muted-foreground`, `border`… |
| Componentes | `components/tienda/` | `components/admin/` y `components/admin/ui/` |

- Cada CSS usa `@import "tailwindcss" source(none)` y declara con `@source` qué carpetas revisa. Si creas una carpeta nueva con componentes, agrégala con `@source` en el CSS que corresponda.
- Los colores de marca son los mismos de los correos (`amplify/auth/custom-message/base.ts`). Para agregar o cambiar uno, edita el bloque `@theme` de `tienda.css`.
- `components/compartido/` lo revisan ambos CSS, así que ahí solo van componentes con clases estándar de Tailwind (`flex`, `p-4`, `text-sm`…), nunca colores de marca ni de shadcn.
- ESLint lo hace cumplir: `npm run lint` marca error si la tienda importa algo de `components/admin` o de Radix, o si el panel importa de `components/tienda`.

## Agregar componentes de shadcn

```bash
npx shadcn@latest add card input table dialog sidebar
```

`components.json` ya está configurado: los componentes se crean en `components/admin/ui/` y sus variables se escriben en `app/(admin)/admin.css`. Ya está instalado `button`.

## Acceso al panel

`middleware.ts` revisa la sesión en cada ruta `/admin`:

- Sin sesión → `/admin/login`
- Con sesión pero sin grupo de staff (una clienta) → `/`
- Grupo `ADMIN`, `INVENTORY` o `MARKETING` → entra

Esto es experiencia de usuario, no seguridad: los permisos reales los aplican AppSync y S3 con las reglas de `amplify/data/resource.ts` y `amplify/storage/resource.ts`.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint (incluye las reglas tienda/panel) |
| `npm run typecheck` | Revisión de tipos con TypeScript |

Basado en la plantilla de AWS Amplify para Next.js (licencia MIT-0, ver `LICENSE`).
