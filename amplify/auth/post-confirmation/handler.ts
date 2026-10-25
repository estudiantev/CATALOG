import type { PostConfirmationTriggerHandler } from "aws-lambda";
import type { Schema } from "../../data/resource";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/post-confirmation";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export const handler: PostConfirmationTriggerHandler = async (event) => {
  // Este trigger también corre al recuperar contraseña: solo actuamos en el registro
  if (event.triggerSource !== "PostConfirmation_ConfirmSignUp") {
    return event;
  }

  const { sub, email, given_name, family_name } = event.request.userAttributes;

  const { errors } = await client.models.Customer.create({
    customerId: sub, // el id del perfil = el id de Cognito
    email,
    firstName: given_name,
    lastName: family_name,
    owner: `${sub}::${event.userName}`, // la Lambda no lo llena sola: hay que ponerlo
  });

  // No lanzar error aquí: la clienta vería un fallo al confirmar su cuenta
  if (errors) {
    console.error("No se pudo crear el Customer:", JSON.stringify(errors));
  }

  // Aquí también crearías su lista de Favoritos cuando exista ese modelo

  return event;
};