import { runtime, util } from '@aws-appsync/utils';

// La consulta vestidosPorId (resource.ts): hasta 100 vestidos por su id con un solo BatchGetItem,
// en vez de un pedido a AppSync por vestido. La usan los destacados del inicio y las colecciones
// (lib/catalogo.ts). Los que no existen no vuelven, y el orden lo pone quien pregunta: DynamoDB
// no lo respeta.

// BatchGetItem lee hasta 100 claves por pedido, y no acepta claves repetidas
const MAXIMO = 100;

// Amplify nombra las tablas "<modelo>-<id de la API>-NONE"
function tabla(ctx) {
  return `Product-${ctx.stash.awsAppsyncApiId}-${ctx.stash.amplifyApiEnvironmentName}`;
}

export function request(ctx) {
  const ids = ctx.args.ids;
  if (ids.length > MAXIMO) {
    util.error(`Se piden como máximo ${MAXIMO} vestidos a la vez.`, 'BadRequest');
  }
  if (ids.length === 0) {
    runtime.earlyReturn([]);
  }
  return {
    operation: 'BatchGetItem',
    tables: {
      [tabla(ctx)]: {
        keys: ids.map((productId) => util.dynamodb.toMapValues({ productId })),
        consistentRead: false,
      },
    },
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  const nombre = tabla(ctx);
  // Si DynamoDB dejó claves sin leer (pasa al superar su capacidad), se avisa con un error junto a
  // los datos: lib/catalogo.ts pide esos de a uno
  const pendientes = ctx.result.unprocessedKeys ? ctx.result.unprocessedKeys[nombre] : null;
  if (pendientes && pendientes.length > 0) {
    util.appendError(`Quedaron ${pendientes.length} vestidos sin leer.`, 'UnprocessedKeys');
  }
  return ctx.result.data[nombre] || [];
}
