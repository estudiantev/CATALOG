import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { agregarStaff } from './agregar-staff/resource'; // NUEVO
import { postConfirmation } from '../auth/post-confirmation/resource';

const schema = a.schema({

  ColorFamily: a.enum([
    'BLACK', 'WHITE', 'IVORY', 'NUDE', 'PINK', 'RED', 'BLUE',
    'GREEN', 'PURPLE', 'GOLD', 'SILVER', 'MULTI',
  ]),
  Size: a.enum(['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONE_SIZE']),

  // Tipos personalizados
  Address: a.customType({
    label: a.string(), // "Casa", "Trabajo"
    street: a.string().required(),
    district: a.string(),
    city: a.string().required(),
    province: a.string(),
    state: a.string(),
    zipCode: a.string(),
    country: a.string().required(),
    reference: a.string(),
    isDefault: a.boolean(),
  }),
  ProductImage: a.customType({
    key: a.string().required(), // foto grande para el detalle, en S3: "product-images/<productId>/..."
    thumbKey: a.string(),       // versión liviana para el catálogo; si no hay, se usa key
    alt: a.string(),
    position: a.integer(),      // 1 = portada, 2 = contraportada, 3..6 = resto
  }),

  // Tabla: Clientes de la aplicación
  Customer: a
    .model({
      customerId: a.id().required(),
      // NUEVO: evita que una clienta reasigne su registro a otro usuario
      owner: a.string().authorization((allow) => [
        allow.owner().to(['read', 'delete']),
        allow.group('ADMIN'),
      ]),
      email: a.email().required(),
      firstName: a.string(),
      lastName: a.string(),
      phone: a.phone(),
      birthdate: a.date(),
      measurements: a.customType({
        cupSize: a.string(),
        heightCm: a.float(),
        bustCm: a.float(),
        waistCm: a.float(),
        hipsCm: a.float(),
      }),
      addresses: a.ref('Address').array(),
      /* Preferencias y marketing: pendiente
      marketingEmail: a.enum(['OPT_IN', 'OPT_OUT']),
      marketingEmailUpdatedAt: a.datetime(),
      currency: a.enum(['PEN', 'USD']),
      language: a.enum(['ES', 'EN']),
      theme: a.enum(['LIGHT', 'DARK', 'SYSTEM']),
      */
    })
    .identifier(['customerId'])
    .authorization((allow) => [allow.owner(), allow.group('ADMIN')]),

  // Tabla: Productos. Datos generales + un RESUMEN de sus variantes para el catálogo.
  // El resumen lo calcula el panel desde ProductVariant (lib/variantes.ts); nunca se edita a mano.
  Product: a
    .model({
      productId: a.id().required(),
      category: a.string().required(), // "DRESS" | "JEWELRY" | "ACCESSORY" (lib/productos.ts)
      name: a.string().required(),
      description: a.string(),
      brand: a.string(),
      designer: a.string(),
      occasion: a.string(),
      material: a.string(),
      tags: a.string().array(), // características

      // Resumen
      priceSale: a.float().required(), // "desde", sin filtros
      priceRent: a.float().required(),
      availableSizes: a.ref('Size').array(),
      availableLengths: a.string().array(),
      availableNecklines: a.string().array(),
      availableSleeves: a.string().array(),
      availableSilhouettes: a.string().array(),
      colorFamilies: a.ref('ColorFamily').array(),
      variantSummary: a.json(), // una fila por variante: opciones, precio, stock, portada y contraportada

      variants: a.hasMany('ProductVariant', 'productId'),
    })
    .identifier(['productId'])
    .secondaryIndexes((index) => [index('category').queryField('listProductByCategory')])
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
      allow.groups(['INVENTORY']).to(['create', 'read', 'update']),
      allow.groups(['MARKETING']).to(['read', 'update']),
      allow.group('ADMIN'), // solo ADMIN puede borrar
    ]),

  // Tabla: cada combinación real de un producto, con su precio, su stock y sus fotos.
  // Joyas y accesorios llevan una sola variante, sin talla.
  ProductVariant: a
    .model({
      productId: a.id().required(),
      product: a.belongsTo('Product', 'productId'),
      position: a.integer(), // orden; la primera es la que se ve sin filtros
      sku: a.string(),

      // Los 6 valores que filtra el catálogo (se llenan aunque se repitan entre variantes)
      size: a.ref('Size'),
      length: a.string(),     // largo
      neckline: a.string(),   // escote
      sleeve: a.string(),     // manga
      silhouette: a.string(),
      colorFamily: a.ref('ColorFamily'),
      colorName: a.string(),  // "Rojo vino", para el detalle
      colorHex: a.string(),

      priceSale: a.float().required(),
      priceRent: a.float().required(), // por día
      stock: a.integer().default(0),
      images: a.ref('ProductImage').array(), // ~6, en orden
    })
    // AP-09: las variantes de un producto con un Query a este índice. El cargador
    // producto.variants() del cliente hace un Scan de toda la tabla con filtro, por eso no se usa.
    .secondaryIndexes((index) => [index('productId').queryField('listVariantsByProduct')])
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
      allow.groups(['INVENTORY']).to(['create', 'read', 'update']),
      allow.groups(['MARKETING']).to(['read', 'update']),
      allow.group('ADMIN'), // solo ADMIN puede borrar
    ]),

  // NUEVO: el ADMIN crea cuentas de INVENTORY o MARKETING
  agregarStaff: a
    .mutation()
    .arguments({
      email: a.email().required(),
      grupo: a.string().required(), // "INVENTORY" | "MARKETING"
    })
    .returns(a.string()) // "creado" | "promovido"
    .authorization((allow) => [allow.group('ADMIN')])
    .handler(a.handler.function(agregarStaff)),
})
  // El trigger post-confirmation crea el Customer: necesita acceso a la API de datos
  .authorization((allow) => [allow.resource(postConfirmation)]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});