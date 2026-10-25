import type { Schema } from "../resource";
import { env } from "$amplify/env/agregar-staff";
import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";

type Handler = Schema["agregarStaff"]["functionHandler"];
const client = new CognitoIdentityProviderClient();

const GRUPOS_PERMITIDOS = ["INVENTORY", "MARKETING"];

export const handler: Handler = async (event) => {
  const correo = event.arguments.email.trim().toLowerCase();
  const grupo = event.arguments.grupo;
  const UserPoolId = env.AMPLIFY_AUTH_USERPOOL_ID;

  // Nunca permitir crear un ADMIN desde aquí
  if (!GRUPOS_PERMITIDOS.includes(grupo)) {
    throw new Error(`Grupo no permitido: ${grupo}`);
  }

  let nombreusuario = correo;
  let resultado = "creado";

  try {
    const created = await client.send(
      new AdminCreateUserCommand({
        UserPoolId,
        Username: correo,
        UserAttributes: [
          { Name: "email", Value: correo },
          { Name: "email_verified", Value: "true" },
        ],
        DesiredDeliveryMediums: ["EMAIL"],
      })
    );
    nombreusuario = created.User?.Username || correo;
  } catch (error) {
    // La cuenta ya existe: no se crea de nuevo, solo se agrega al grupo
    if ((error as Error).name !== "UsernameExistsException") throw error;
    resultado = "promovido";
  }

  await client.send(
    new AdminAddUserToGroupCommand({
      UserPoolId,
      Username: nombreusuario,
      GroupName: grupo,
    })
  );

  return resultado;
};