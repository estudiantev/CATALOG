import { bloqueCodigo, notaPie, parrafo, plantilla, titulo, textoCodigo } from "../base";

export const verificationEmail = {
  asunto: "COMPLETA TU REGISTRO Y ACTIVA TU CUENTA",

  cuerpo: (codigo: string) =>
    plantilla(
      titulo("Confirma tu correo") +
        parrafo("Ingresa el siguiente código en la pantalla de verificación para completar tu registro") +
        bloqueCodigo(codigo) +
        textoCodigo("Código de un solo uso.", "Vence en 24 horas.") +
        notaPie("Si no te registraste en FARA collections, ignora este correo"),
      "Usa este código para terminar de crear tu cuenta.",
    ),
};