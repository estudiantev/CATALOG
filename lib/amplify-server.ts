import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import outputs from "@/amplify_outputs.json";

// Ejecuta las APIs de Amplify en el servidor (Server Components, Route Handlers, middleware)
// con la sesión de la petición actual
export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});
