import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { agregarStaff } from './agregar-staff/resource'; // NUEVO

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
  ProductColor: a.customType({
    name: a.string().required(),             // "Rosa palo" → lo que ve la clienta
    hex: a.string(),                         // "#F4C2C2" → para pintar el círculo
    family: a.ref('ColorFamily').required(), // PINK → agrupa tonos parecidos
  }),
  ProductImage: a.customType({
    key: a.string().required(), // ruta en S3, ej. "product-images/123/front.jpg" (debe coincidir con Storage)
    alt: a.string(),
    position: a.integer(),      // orden en la galería
    color: a.string(),          // nombre del ProductColor al que corresponde la foto
    isPrimary: a.boolean(),
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

  // Tabla: Productos de la empresa
  Product: a
    .model({
      productId: a.id().required(),
      name: a.string(),
      category: a.enum(['DRESS', 'JEWELRY', 'ACCESSORY']),
      description: a.string(),
      // marca: a.string(),
      occasion: a.string(),
      // collection: a.string(),
      tags: a.string().array(),
      material: a.string(),
      silhouette: a.string(),
      priceSale: a.float().required(),
      priceRent: a.float().required(),
      availableSizes: a.ref('Size').array(),
      availableColors: a.ref('ProductColor').array(),
      colorFamilies: a.ref('ColorFamily').array(), // copia plana de las familias, para filtrar
      imagenes: a.ref('ProductImage').array(),
    })
    .identifier(['productId'])
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
      allow.groups(['INVENTORY']).to(['create', 'read', 'update']), // NUEVO
      allow.groups(['MARKETING']).to(['read', 'update']),           // NUEVO
      allow.group('ADMIN'), // solo ADMIN puede borrar productos
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
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});