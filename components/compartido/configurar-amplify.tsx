"use client";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

// ssr: true guarda la sesión en cookies para que el servidor (y el middleware) la puedan leer
Amplify.configure(outputs, { ssr: true });

// Se monta en el layout raíz de la tienda y del panel; no dibuja nada
export function ConfigurarAmplify() {
  return null;
}
