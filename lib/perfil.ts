// Perfil de la clienta (modelo Customer de amplify/data/resource.ts): tipos, listas y
// validación que comparten Mi cuenta (servidor) y el formulario de Mi perfil (navegador).

export const TALLAS_COPA = ["AA", "A", "B", "C", "D", "DD", "E", "F", "G"] as const;

// En centímetros. Fuera de estos rangos casi seguro es un error de tipeo.
export const MEDIDAS = [
  { campo: "altura", atributo: "heightCm", etiqueta: "Altura", min: 100, max: 220 },
  { campo: "busto", atributo: "bustCm", etiqueta: "Busto", min: 50, max: 200 },
  { campo: "cintura", atributo: "waistCm", etiqueta: "Cintura", min: 40, max: 200 },
  { campo: "cadera", atributo: "hipsCm", etiqueta: "Cadera", min: 50, max: 200 },
] as const;

export const LARGO_NOMBRE = 60;

export type CampoMedida = (typeof MEDIDAS)[number]["campo"];
export type Medidas = Record<CampoMedida, number | null> & { copa: string | null };

export type Perfil = {
  existe: boolean; // false: todavía no tiene Customer; se crea al guardar
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string | null; // E.164: +51987654321
  nacimiento: string | null; // AWSDate: AAAA-MM-DD
  medidas: Medidas;
};

export const SIN_MEDIDAS: Medidas = { altura: null, busto: null, cintura: null, cadera: null, copa: null };

// Lo que escribe la clienta en el formulario (todo texto)
export type ValoresPerfil = Record<"nombre" | "apellido" | "telefono" | "nacimiento" | "copa" | CampoMedida, string>;
export type CampoPerfil = keyof ValoresPerfil;
export type ErroresPerfil = Partial<Record<CampoPerfil, string>>;

type Atributo = (typeof MEDIDAS)[number]["atributo"];

// Lo que se guarda en Customer (null borra el valor)
export type DatosCustomer = {
  firstName: string;
  lastName: string | null;
  phone: string | null;
  birthdate: string | null;
  measurements: ({ cupSize: string | null } & Record<Atributo, number | null>) | null;
};

const limpiarTexto = (texto: string) => texto.trim().replace(/\s+/g, " ");

// Celular peruano sin código (9 dígitos que empiezan en 9) o cualquier número con su código de país.
// null = vacío; undefined = no es un teléfono válido. Se guarda sin espacios: AWSPhone
// interpreta los números sin código como de EE. UU., por eso se agrega +51.
export function normalizarTelefono(texto: string): string | null | undefined {
  const limpio = texto.replace(/[\s().-]/g, "");
  if (!limpio) return null;
  if (/^9\d{8}$/.test(limpio)) return `+51${limpio}`;
  if (/^519\d{8}$/.test(limpio)) return `+${limpio}`;
  if (/^00\d{8,15}$/.test(limpio)) return `+${limpio.slice(2)}`;
  if (/^\+\d{8,15}$/.test(limpio)) return limpio;
  return undefined;
}

// +51987654321 → +51 987 654 321 (los de otros países se muestran como están)
export function formatoTelefono(telefono: string) {
  return telefono.replace(/^\+51(9\d{2})(\d{3})(\d{3})$/, "+51 $1 $2 $3");
}

// 1998-03-15 → 15 de marzo de 1998 (en UTC para que la zona horaria no cambie el día)
export function formatoFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${fecha}T00:00:00Z`));
}

// Hoy en Perú (AAAA-MM-DD), igual en el servidor y en el navegador
export function hoyEnPeru() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());
}

function fechaValida(texto: string, hoy: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const fecha = new Date(`${texto}T00:00:00Z`);
  // Descarta fechas que no existen, como 2001-02-30
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === texto && texto >= "1900-01-01" && texto <= hoy;
}

// Número positivo con coma o punto decimal, redondeado a 1 decimal. null = vacío o no es un número.
// Sin revisar rangos: la ficha de medidas lo usa para mostrar lo que se va escribiendo.
export function leerNumero(texto: string): number | null {
  const limpio = texto.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(limpio)) return null;
  return Math.round(Number(limpio) * 10) / 10;
}

// null = vacío; undefined = no es un número en el rango
function leerMedida(texto: string, min: number, max: number): number | null | undefined {
  if (!texto.trim()) return null;
  const valor = leerNumero(texto);
  return valor !== null && valor >= min && valor <= max ? valor : undefined;
}

export function valoresIniciales(perfil: Perfil): ValoresPerfil {
  const texto = (n: number | null) => (n === null ? "" : String(n));
  return {
    nombre: perfil.nombre,
    apellido: perfil.apellido,
    telefono: perfil.telefono ? formatoTelefono(perfil.telefono) : "",
    nacimiento: perfil.nacimiento ?? "",
    copa: perfil.medidas.copa ?? "",
    altura: texto(perfil.medidas.altura),
    busto: texto(perfil.medidas.busto),
    cintura: texto(perfil.medidas.cintura),
    cadera: texto(perfil.medidas.cadera),
  };
}

export function validarPerfil(
  valores: ValoresPerfil,
  hoy: string,
): { ok: true; datos: DatosCustomer } | { ok: false; errores: ErroresPerfil } {
  const errores: ErroresPerfil = {};

  const nombre = limpiarTexto(valores.nombre);
  const apellido = limpiarTexto(valores.apellido);
  if (!nombre) errores.nombre = "Escribe tu nombre.";
  else if (nombre.length > LARGO_NOMBRE) errores.nombre = `Máximo ${LARGO_NOMBRE} caracteres.`;
  if (apellido.length > LARGO_NOMBRE) errores.apellido = `Máximo ${LARGO_NOMBRE} caracteres.`;

  const telefono = normalizarTelefono(valores.telefono);
  if (telefono === undefined) {
    errores.telefono = "Escribe un celular de 9 dígitos o un número con su código de país (por ejemplo, +51).";
  }

  const nacimiento = valores.nacimiento.trim();
  if (nacimiento && !fechaValida(nacimiento, hoy)) errores.nacimiento = "Elige una fecha válida que no sea futura.";

  const medidas = { ...SIN_MEDIDAS };
  for (const m of MEDIDAS) {
    const valor = leerMedida(valores[m.campo], m.min, m.max);
    if (valor === undefined) errores[m.campo] = `Escribe un número entre ${m.min} y ${m.max} cm.`;
    else medidas[m.campo] = valor;
  }

  const copa = valores.copa.trim();
  if (copa && !(TALLAS_COPA as readonly string[]).includes(copa)) errores.copa = "Elige una talla de la lista.";

  // Los errores quedan en el orden del formulario: el primero recibe el foco
  if (Object.keys(errores).length > 0) return { ok: false, errores };

  const hayMedidas = Boolean(copa) || MEDIDAS.some((m) => medidas[m.campo] !== null);
  return {
    ok: true,
    datos: {
      firstName: nombre,
      lastName: apellido || null,
      phone: telefono ?? null,
      birthdate: nacimiento || null,
      measurements: hayMedidas
        ? {
            cupSize: copa || null,
            heightCm: medidas.altura,
            bustCm: medidas.busto,
            waistCm: medidas.cintura,
            hipsCm: medidas.cadera,
          }
        : null,
    },
  };
}
