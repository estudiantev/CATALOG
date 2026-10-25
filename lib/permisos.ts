// Grupos de Cognito del staff (amplify/auth/resource.ts)
export const GRUPOS_STAFF = ["ADMIN", "INVENTORY", "MARKETING"] as const;

export type GrupoStaff = (typeof GRUPOS_STAFF)[number];

// Qué grupo puede hacer cada acción. Es un reflejo de las reglas de
// amplify/data/resource.ts y amplify/storage/resource.ts, que son las que
// AppSync y S3 aplican de verdad.
const PERMISOS = {
  crearProducto: ["ADMIN", "INVENTORY"],
  editarProducto: ["ADMIN", "INVENTORY", "MARKETING"],
  eliminarProducto: ["ADMIN"],
  borrarImagenes: ["ADMIN"],
  agregarStaff: ["ADMIN"],
  verClientes: ["ADMIN"],
} satisfies Record<string, GrupoStaff[]>;

export type Accion = keyof typeof PERMISOS;

export function esStaff(grupos: string[]) {
  return grupos.some((grupo) => (GRUPOS_STAFF as readonly string[]).includes(grupo));
}

export function puede(grupos: string[], accion: Accion) {
  return grupos.some((grupo) => (PERMISOS[accion] as string[]).includes(grupo));
}
