import { bloqueCodigo, notaPie, parrafo, plantilla, titulo, textoCodigo } from "../base";

export const invitationEmail = {
    asunto: "CORREO DE INVITACIÓN A FARA COLLECTIONS",

    cuerpo: (codigo: string, usuario: string) =>
        plantilla(
            titulo("¡Bienvenido a Fara Collections!") +
            parrafo(`Se creó una cuenta para ti en la tienda Fara Collections. Tu usuario es: ${usuario}`) +
            parrafo("Has sido invitado a formar parte del equipo de Fara Collections como administrador de nuestra plataforma.") +
            bloqueCodigo(codigo) +
            textoCodigo("Código de un solo uso.", "Vence en 24 horas.") +
            notaPie("Por seguridad, deberás establecer una nueva contraseña al iniciar sesión por primera vez."),
            "Si no esperabas esta invitación, comunícate con el equipo de Fara Collections.",
            "#ace8fb"
        ),
};