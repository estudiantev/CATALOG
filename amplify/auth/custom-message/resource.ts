import { defineFunction } from "@aws-amplify/backend";
// recuerda que este trigger el maximo son 5 segundos
export const customMessage = defineFunction({
  name: "custom-message",
  resourceGroupName: "auth", // trigger de cognito
  runtime: 24,
});