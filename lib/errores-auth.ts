// Traduce los errores de Cognito/Amplify al iniciar sesión a mensajes para el usuario
export function mensajeErrorIngreso(error: unknown) {
  const nombre = error instanceof Error ? error.name : "";
  switch (nombre) {
    case "NotAuthorizedException":
    case "UserNotFoundException":
      return "Correo o contraseña incorrectos.";
    case "UserNotConfirmedException":
      return "Tu cuenta aún no está confirmada. Revisa el código que te enviamos por correo.";
    case "EmptySignInUsername":
      return "Escribe tu correo.";
    case "EmptySignInPassword":
      return "Escribe tu contraseña.";
    case "LimitExceededException":
    case "TooManyRequestsException":
      return "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.";
    case "InvalidPasswordException":
      return "La contraseña no cumple los requisitos: mínimo 8 caracteres, con mayúsculas, minúsculas, números y símbolos.";
    default:
      return "No se pudo iniciar sesión. Inténtalo de nuevo.";
  }
}
