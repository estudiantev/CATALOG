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
│   ├── layout.tsx             ← layout raíz: <html>, fuentes, menú, pie, Amplify
│   ├── tienda.css             ← Tailwind + paleta del rediseño (sin shadcn)
│   ├── page.tsx               ← / (portada)
│   ├── catalogo/page.tsx      ← /catalogo (productos con fotos y filtros)
│   └── login/page.tsx         ← /login
└── (admin)/                   ← zona del staff
    ├── layout.tsx             ← layout raíz: <html>, admin.css, Amplify, noindex
    ├── admin.css              ← Tailwind + tema de shadcn
    └── admin/
        ├── login/page.tsx     ← /admin/login (sin registro)
        └── (panel)/           ← páginas con el menú lateral; verifican la sesión
            ├── layout.tsx
            ├── page.tsx       ← /admin → /admin/productos
            ├── productos/     ← listar, nuevo, [productId] (editar)
            └── equipo/        ← agregar staff (solo ADMIN)

components/
├── admin/                     ← solo el panel
│   └── ui/                    ← componentes de shadcn (los crea el CLI)
├── tienda/                    ← solo la tienda: encabezado, pie, catálogo, vestido, datos
└── compartido/                ← lo usan ambas zonas

lib/
├── amplify-server.ts          ← runWithAmplifyServerContext (Amplify en el servidor)
├── sesion-servidor.ts         ← obtenerSesion() y requerirStaff() para el panel
├── catalogo.ts                ← lee el catálogo en el servidor, como visitante
├── productos.ts               ← tipos y etiquetas de Product (tienda y panel)
├── permisos.ts                ← qué grupo puede hacer cada acción
├── errores-auth.ts            ← mensajes de error del login
└── utils.ts                   ← cn() para combinar clases

middleware.ts                  ← primera barrera de /admin
```

Cada zona tiene su **propio layout raíz** (su propio `<html>`). Así cada una carga solo su CSS: la tienda nunca descarga los estilos de shadcn y el panel nunca descarga los de la tienda. Al pasar de una zona a otra el navegador recarga la página completa, lo cual está bien porque son dos experiencias distintas.

## Reglas de estilos

| | Tienda | Panel |
| --- | --- | --- |
| Tailwind | Sí | Sí |
| shadcn/ui | **No** | Sí |
| CSS | `app/(tienda)/tienda.css` | `app/(admin)/admin.css` |
| Colores | Del rediseño: `text-tinta`, `bg-crema`, `bg-lino`, `bg-arena`, `text-dorado`, `text-topo`, `text-grafito`… | De shadcn: `bg-primary`, `text-muted-foreground`, `border`… |
| Fuentes | Jost (`font-sans`) y Playfair Display (`font-display`) | Inter |
| Componentes | `components/tienda/` | `components/admin/` y `components/admin/ui/` |

- Cada CSS usa `@import "tailwindcss" source(none)` y declara con `@source` qué carpetas revisa. Si creas una carpeta nueva con componentes, agrégala con `@source` en el CSS que corresponda.
- La paleta de la tienda está en el bloque `@theme` de `tienda.css`. El menú cambia a la versión móvil por debajo de 861px (variante `menu:`).
- `components/compartido/` lo revisan ambos CSS, así que ahí solo van componentes con clases estándar de Tailwind (`flex`, `p-4`, `text-sm`…), nunca colores de marca ni de shadcn.
- ESLint lo hace cumplir: `npm run lint` marca error si la tienda importa algo de `components/admin` o de Radix, o si el panel importa de `components/tienda`.

## Agregar componentes de shadcn

```bash
npx shadcn@latest add card input table dialog sidebar
```

`components.json` ya está configurado: los componentes se crean en `components/admin/ui/` y sus variables se escriben en `app/(admin)/admin.css`.

## Catálogo y fotos

- **Fotos (panel):** en el formulario de producto, "Agregar imágenes" acepta imágenes de hasta 5 MB. Se suben a S3 al guardar, en `product-images/<productId>/`, y la marcada como principal es la que se ve en el catálogo y en la tabla. Al quitar una foto o eliminar un producto, las fotos se borran de S3 solo si eres ADMIN (es el único grupo con permiso de borrar en `amplify/storage/resource.ts`); para el resto se desvinculan del producto.
- **Catálogo (tienda):** `/catalogo` lee los productos en el servidor como visitante (Product y las fotos permiten lectura a invitados), con URLs firmadas de S3 que duran una hora; por eso la página se genera en cada visita.
- **Filtros:** búsqueda, categoría, color y talla se aplican en el navegador sobre los productos ya cargados. Los enlaces del menú llegan como filtros iniciales: `?color=` elige la familia de color, `?categoria=accesorios` la categoría, y `?coleccion=gala|xv|cortos|floreados` busca esa palabra en la ocasión, silueta, etiquetas y descripción. Para que un vestido salga en "De Gala", escribe "Gala" en su ocasión o etiquetas.

## Acceso al panel

El panel tiene tres capas, de afuera hacia adentro:

1. **`middleware.ts`**: en cada ruta `/admin`, sin sesión → `/admin/login`; con sesión pero sin grupo de staff (una clienta) → `/`.
2. **El servidor de cada página** (`requerirStaff()` en `lib/sesion-servidor.ts`): el layout y cada página del panel vuelven a leer la sesión desde las cookies. El adaptador de Amplify valida la firma de los tokens, así que una cookie alterada no pasa. Funciona aunque el middleware falle.
3. **AppSync y S3**: aplican las reglas de `amplify/data/resource.ts` y `amplify/storage/resource.ts` en cada operación, aunque alguien llame a la API sin pasar por la web.

| Acción | ADMIN | INVENTORY | MARKETING |
| --- | --- | --- | --- |
| Ver y editar productos | Sí | Sí | Sí |
| Crear productos | Sí | Sí | No |
| Eliminar productos | Sí | No | No |
| Subir fotos | Sí | Sí | Sí |
| Borrar fotos de S3 | Sí | No | No |
| Agregar staff (Equipo) | Sí | No | No |

`lib/permisos.ts` refleja esta tabla para mostrar u ocultar botones y bloquear páginas; si cambias las reglas del backend, actualízalo también. El staff entra por `/admin/login`; quien recibe una invitación cambia ahí su contraseña temporal en el primer ingreso.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint (incluye las reglas tienda/panel) |
| `npm run typecheck` | Revisión de tipos con TypeScript |

Basado en la plantilla de AWS Amplify para Next.js (licencia MIT-0, ver `LICENSE`).
