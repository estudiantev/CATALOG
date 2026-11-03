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
│   ├── catalogo/[productId]/  ← detalle: fotos a la izquierda, atributos a la derecha
│   ├── login/page.tsx         ← /login (si ya hay sesión, redirige)
│   ├── registro/page.tsx      ← /registro (clientas, sin grupo)
│   ├── cuenta/page.tsx        ← /cuenta (Mi cuenta: resumen del perfil y cerrar sesión)
│   └── cuenta/perfil/page.tsx ← /cuenta/perfil (editar nombre, celular, nacimiento y medidas)
└── (admin)/                   ← zona del staff
    ├── layout.tsx             ← layout raíz: <html>, admin.css, Amplify, noindex
    ├── admin.css              ← Tailwind + tema de shadcn
    └── admin/
        ├── login/page.tsx     ← /admin/login (sin registro)
        └── (panel)/           ← páginas con el menú lateral; verifican la sesión
            ├── layout.tsx
            ├── page.tsx       ← /admin → /admin/productos
            ├── productos/     ← listar, nuevo, [productId] (datos y variantes), [productId]/variantes/…
            ├── clientes/      ← clientes registrados (solo ADMIN)
            └── equipo/        ← agregar staff (solo ADMIN)

components/
├── admin/                     ← solo el panel
│   └── ui/                    ← componentes de shadcn (los crea el CLI)
├── tienda/                    ← solo la tienda: encabezado, pie, catálogo, vestido, datos y el área de la clienta
└── compartido/                ← lo usan ambas zonas

lib/
├── amplify-server.ts          ← runWithAmplifyServerContext (Amplify en el servidor)
├── sesion-servidor.ts         ← obtenerSesion() (tienda y panel) y requerirStaff() (panel)
├── cuenta.ts                  ← lee el Customer de la clienta con sus cookies (Mi cuenta)
├── redireccion.ts             ← a dónde volver después de entrar (?siguiente=, solo rutas internas)
├── perfil.ts                  ← tipos, tallas de copa, rangos de medidas y validación del perfil
├── catalogo.ts                ← lee el catálogo y el detalle en el servidor, como visitante
├── productos.ts               ← tipos, listas fijas (tallas, largos, escotes…) y etiquetas
├── variantes.ts               ← resumen de variantes, tarjeta del catálogo y selector del detalle
├── resumen.ts                 ← guarda en Product el resumen de sus variantes
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

## Productos y variantes

Los datos están en dos tablas (`amplify/data/resource.ts`):

- **`Product`**: los datos generales (nombre, categoría, descripción, marca, diseñador, ocasión, material, características) y un **resumen** de sus variantes que el panel recalcula solo: precios "desde", `available*` (tallas, largos, escotes, mangas, siluetas con stock), `colorFamilies` y `variantSummary` (una fila por variante con sus opciones, precios, si tiene stock y las rutas de su portada y contraportada). El resumen nunca se edita a mano.
- **`ProductVariant`**: cada combinación vendible. Sus 6 opciones (talla, largo, escote, manga, silueta, familia de color, más el nombre y el tono del color), precio de venta, alquiler por día, stock, posición, SKU y hasta 6 fotos en orden (1 = portada, 2 = contraportada).

Qué cambia con cada opción lo deciden los datos, no el código: si dos variantes solo difieren en la talla y tienen las mismas fotos, la talla cambia solo el precio; si el largo trae otras fotos y otro precio, cambia ambos; si el color solo trae otras fotos, cambia solo las fotos. Por eso conviene llenar todas las opciones que apliquen aunque se repitan entre variantes.

**Consultas (nunca un Scan):**

| Para qué | Cómo |
| --- | --- |
| Catálogo de una categoría | Query al índice `listProductByCategory`; solo lee `Product` (el resumen trae todo lo necesario) |
| Detalle | `Product.get` + Query al índice `listVariantsByProduct`, en paralelo y paginando |
| Panel: variantes de un producto y recálculo del resumen | Query a `listVariantsByProduct` (el cargador `producto.variants()` de Amplify hace un Scan con filtro, por eso no se usa) |

### Panel

1. **Nuevo producto**: solo los datos generales. Al guardarlo se abre su página para agregar variantes; sin al menos una variante con stock no aparece en la tienda.
2. **Variantes** (en la página del producto): tabla con las columnas de las opciones que el producto usa, precios, stock (o "Agotada") y acciones para editar, **duplicar** (abre una copia con las mismas fotos para cambiar, por ejemplo, solo la talla) y eliminar (solo ADMIN).
3. **Fotos**: hasta 6 por variante, de hasta 5 MB. Al guardar se suben a `product-images/<productId>/` junto con una **versión liviana** (600 px, WebP) que usan el catálogo y las miniaturas. "Usar las fotos de otra variante" reutiliza las de otra combinación sin subirlas de nuevo. Una foto se borra de S3 solo cuando ninguna variante la usa y quien edita es ADMIN.
4. No se pueden guardar dos variantes con la misma combinación de opciones.
5. Después de cada cambio de variantes, la acción de servidor `recalcularResumen` (en `productos/acciones.ts`) relee todas las variantes, guarda el resumen en `Product` y ejecuta `revalidateTag("catalogo")`. Si algo falla, el botón **Actualizar resumen** del producto lo vuelve a hacer.

### Catálogo (tienda)

- `/catalogo?categoria=vestidos|joyas|accesorios` (vestidos si no se indica). Los datos de DynamoDB se guardan en caché 10 minutos por categoría y el panel la invalida al guardar; las URLs de las fotos se firman en cada visita (duran una hora), así nunca llegan vencidas.
- **Filtros** en el navegador, sin volver a consultar la base: talla, largo, escote, manga, silueta y color (se pueden marcar varios valores), más ocasión, marca, diseñador, características y búsqueda de texto (sin importar tildes ni mayúsculas). Solo aparecen los valores que tienen stock.
- Cada tarjeta muestra la variante con stock que cumple **todos** los filtros: su portada (y la contraportada al pasar el cursor), el menor precio de venta y de alquiler por día entre las que cumplen ("Desde" si quedan precios distintos) y un enlace a `/catalogo/<productId>?v=<variantId>` con esa combinación ya elegida. Si ninguna variante con stock cumple, el producto no se muestra.
- Los enlaces del menú llegan como filtros iniciales: `?color=` marca la familia de color y `?coleccion=gala|xv|cortos|floreados` busca esa palabra en la ocasión, descripción, características y siluetas. Para que un vestido salga en "De Gala", escribe "Gala" en su ocasión o características.

## Detalle del producto

- `/catalogo/<productId>?v=<variantId>` abre la combinación del enlace (o la primera con stock). A la izquierda, las fotos de esa variante; a la derecha categoría, nombre, descripción, precio de venta y de alquiler por día, el selector de opciones, **Contactar** y los datos generales.
- **Selector**: al tocar un valor se pasa a la variante con stock que lo tiene y que más opciones comparte con la actual, así nunca queda en una combinación que no existe. Los valores con borde punteado cambian también otras opciones; los agotados no se pueden elegir. La URL se actualiza (`?v=`) para poder compartir esa combinación.
- **Contactar** abre WhatsApp con el producto y la combinación elegida (por ejemplo "Hola, quisiera consultar sobre Vestido Aurora (Talla: M, Largo: Midi, Color: Vino) en Fara Collection."). El usuario de WhatsApp de la empresa está en `WHATSAPP_FARA` (`components/tienda/datos.ts`): reemplaza `519XXXXXXXX` por el número real.

### Productos creados antes de las variantes

Los productos guardados con el modelo anterior (precios, tallas, colores y fotos en `Product`) no tienen variantes, así que no se muestran en la tienda. Ábrelos en el panel y agrega sus variantes (o vuelve a crearlos). Los que no tenían categoría tampoco aparecen en el índice por categoría: edítalos y elige una.

## Registro de clientas

- `/registro` pide nombre, apellido, correo y contraseña. Cognito envía un código al correo; al confirmarlo la cuenta inicia sesión sola y va a Mi cuenta.
- La cuenta se crea **sin grupo**: es una clienta y no tiene acceso al panel. El trigger `post-confirmation` crea su perfil `Customer`.
- **Google:** el botón "Continuar con Google" del login y del registro usa `signInWithRedirect`. Cognito devuelve a la usuaria a la URL de `callbackUrls` y `RetornoGoogle` (en el layout de la tienda) termina el inicio de sesión y la lleva a su destino (ver "Sesión de las clientas"); si falla o se cancela, vuelve a `/login` con un aviso. La primera vez, Cognito crea la cuenta sin grupo y `post-confirmation` crea su `Customer`. `callbackUrls` y `logoutUrls` deben incluir el origen exacto de cada entorno (por ejemplo `http://localhost:3000/` en desarrollo).
- Si alguien se registró pero no confirmó su correo, al intentar iniciar sesión ve el enlace "Confirmar mi correo", que retoma el paso del código (`/registro?confirmar=<correo>`).

## Sesión de las clientas

- **Dónde vive:** Amplify guarda la sesión en **cookies** (`ssr: true` en `components/compartido/configurar-amplify.tsx`): `CognitoIdentityServiceProvider.<clientId>.<usuario>.idToken`, `.accessToken` y `.refreshToken`. Así la leen el navegador y el servidor.
- **Mi cuenta (`/cuenta`):** el servidor lee la sesión con `obtenerSesion()` y el perfil `Customer` con las cookies de la clienta (`lib/cuenta.ts`; `allow.owner()` solo le deja leer el suyo) y muestra un resumen: nombre, correo, celular, fecha de nacimiento y medidas. Si no hay `Customer` (por ejemplo, una cuenta del staff), usa el nombre y el correo del token. Sin sesión, manda a `/login`.
- **Encabezado:** revisa la sesión en el navegador (`components/tienda/use-sesion.ts`) y escucha los eventos `signedIn` y `signedOut` de Amplify. Con sesión, el ícono de la persona lleva a `/cuenta` y muestra el nombre (en pantallas chicas, un punto dorado). Se hace en el navegador para que las páginas de la tienda sigan siendo estáticas: el servidor solo lee la sesión en `/cuenta`, `/login` y `/registro`.
- **`/login` y `/registro`** redirigen si ya hay sesión, así nunca se muestra el formulario a alguien que ya entró.
- **A dónde vuelve:** después de entrar (correo, registro o Google) va a `?siguiente=<ruta>` o, si no hay, a `/cuenta`. El ícono del encabezado agrega la página actual (salvo la portada), así quien inicia sesión desde un vestido vuelve a ese vestido. `lib/redireccion.ts` solo acepta rutas internas, para que nadie arme un enlace que saque a la clienta del sitio. Con Google, el destino viaja en el `customState` de OAuth y `RetornoGoogle` lo usa al volver a la portada.

## Área de la clienta

`/cuenta` y `/cuenta/perfil` no usan el marco del login (`MarcoCuenta`, que queda solo para `/login` y `/registro`): son páginas propias, más aireadas, con el lenguaje de la portada.

- **`CabeceraCuenta`:** franja con el rosa de la portada, el título grande en Jost liviano ("Hola, María" o "Mi perfil") y las pestañas Resumen y Mi perfil, más Cerrar sesión y, para el staff, Panel de administración. Va a todo el ancho, así Cerrar sesión queda bajo los íconos del encabezado.
- **`ResumenCuenta`:** tus datos como lista a la izquierda y tus medidas en un panel lino a la derecha (una sola columna en celular).
- **`FichaMedidas`:** la silueta del vestido sirena con líneas de costurera en busto, cintura y cadera, cada una con su valor, y la altura con su línea vertical. En Mi perfil muestra lo que se va escribiendo y resalta la línea de la medida enfocada; ahí es decorativa (`aria-hidden`) porque los valores ya están en los campos. Las alturas de las líneas son coordenadas del `viewBox` de `<Vestido forma="sirena">`: si cambia el dibujo, hay que moverlas.
- **`estilos-cuenta.ts`:** clases compartidas (contenedor, botones de la portada, campos, títulos en minúsculas). `alineadoConPanel` da a "Tus datos" el mismo relleno superior que el panel de medidas para que los títulos queden a la misma altura.

## Perfil de la clienta

`/cuenta/perfil` edita su `Customer`: nombre (obligatorio), apellido, celular, fecha de nacimiento y medidas (altura, busto, cintura y cadera en cm, y talla de copa). El correo no se edita porque es el usuario de Cognito.

- **Lectura:** en el servidor (`leerPerfil()` en `lib/cuenta.ts`). Si la lectura falla, la página muestra un aviso en vez del formulario, para no guardar campos vacíos encima de los datos reales.
- **Guardado:** desde el navegador con `generateClient` (`components/tienda/formulario-perfil.tsx`), como el panel: AppSync aplica `allow.owner()`. Si la clienta todavía no tiene `Customer` (el trigger falló o es una cuenta del staff), se crea al guardar; Amplify llena `owner` solo. Al terminar vuelve a `/cuenta` con el aviso "Cambios guardados".
- **Validación** (`lib/perfil.ts`, la misma lista de errores en el orden del formulario):
  - Celular: 9 dígitos que empiezan en 9 → se guarda como `+51…`; otros países con su código (`+…`). Se guarda sin espacios porque `AWSPhone` toma los números sin código como de EE. UU.
  - Fecha de nacimiento: fecha real entre 1900 y hoy (hora de Perú).
  - Medidas: acepta coma o punto, redondea a 1 decimal y revisa rangos (altura 100–220, busto 50–200, cintura 40–200, cadera 50–200). Las vacías se guardan como `null`; sin ninguna, `measurements` queda en `null`.
  - Copa: una de `TALLAS_COPA` (AA a G).
- **Nombre en el encabezado:** sale del token de Cognito, así que al cambiar el nombre también se actualiza `given_name` en Cognito y se renueva el token. Si eso falla, el perfil igual queda guardado. Con Google, Cognito vuelve a poner el nombre de Google en cada inicio de sesión: el encabezado mostrará ese, pero Mi cuenta muestra el del perfil.

## Acceso al panel

El panel tiene tres capas, de afuera hacia adentro:

1. **`middleware.ts`**: en cada ruta `/admin`, sin sesión → `/admin/login`; con sesión pero sin grupo de staff (una clienta) → `/`.
2. **El servidor de cada página** (`requerirStaff()` en `lib/sesion-servidor.ts`): el layout y cada página del panel vuelven a leer la sesión desde las cookies. El adaptador de Amplify valida la firma de los tokens, así que una cookie alterada no pasa. Funciona aunque el middleware falle.
3. **AppSync y S3**: aplican las reglas de `amplify/data/resource.ts` y `amplify/storage/resource.ts` en cada operación, aunque alguien llame a la API sin pasar por la web.

| Acción | ADMIN | INVENTORY | MARKETING |
| --- | --- | --- | --- |
| Ver y editar productos y variantes | Sí | Sí | Sí |
| Crear productos y variantes | Sí | Sí | No |
| Eliminar productos y variantes | Sí | No | No |
| Subir fotos | Sí | Sí | Sí |
| Borrar fotos de S3 | Sí | No | No |
| Ver clientes | Sí | No | No |
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
