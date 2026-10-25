import type { CustomMessageTriggerHandler } from "aws-lambda";
import { resendCodeEmail } from "./templates/resend-code";
import { forgotPasswordEmail } from "./templates/forgot-password";

export const handler: CustomMessageTriggerHandler = async (event) => {
  const codigo = event.request.codeParameter;
  // atributos opcionales pueden ser undefined
  const nombre = event.request.userAttributes.given_name ?? "";
  const apellido = event.request.userAttributes.family_name ?? "";

  // Customiza unicamente el correo de reenvío de código y restablecimiento de contraseña
  if (event.triggerSource === "CustomMessage_ResendCode") {
    event.response.emailSubject = resendCodeEmail.asunto;
    event.response.emailMessage = resendCodeEmail.cuerpo(codigo, nombre);
  } else if (event.triggerSource === "CustomMessage_ForgotPassword") {
    event.response.emailSubject = forgotPasswordEmail.asunto;
    event.response.emailMessage = forgotPasswordEmail.cuerpo(codigo, apellido);
  }
    
  return event;
};