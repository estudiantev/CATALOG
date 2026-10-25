import { bloqueCodigo, notaPie, parrafo, plantilla, titulo, textoCodigo } from "../base";

export const forgotPasswordEmail = {
    asunto: "CODIGO PARA REESTABLECER TU CONTRASEÑA",

    cuerpo: (codigo: string, apellido = "") =>
        plantilla(
            titulo(apellido ? `¡Hola, ${apellido}!` : "¡Hola!") +
            parrafo("Recibimos una solicitud para restablecer la contraseña de tu cuenta de la tienda Fara Collections. Ingresa el siguiente código para crear una nueva contraseña.") +
            bloqueCodigo(codigo) +
            textoCodigo("Código de un solo uso.", "Vence en 24 horas.") +
            notaPie("Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.")
        ),
};