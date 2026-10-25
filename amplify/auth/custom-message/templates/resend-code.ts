import { bloqueCodigo, notaPie, parrafo, plantilla, titulo, textoCodigo } from "../base";

export const resendCodeEmail = {
    asunto: "CODIGO REENVIADO PARA CONFIRMAR TU CORREO",

    cuerpo: (codigo: string, nombre = "") =>
        plantilla(
            titulo("Codigo Reestablecido") +
            parrafo(nombre ? `Hola ${nombre}. Has generado un nuevo código para que puedas continuar con la verificación de tu cuenta en Fara Collections.` 
                : `Se ha generado un nuevo código para que puedas continuar con la verificación de tu cuenta en Fara Collections.`) +
            bloqueCodigo(codigo) +
            textoCodigo("Código de un solo uso.", "Vence en 24 horas.") +
            notaPie("Si no solicitaste un nuevo código, puedes ignorar este correo."),
        ),
};
