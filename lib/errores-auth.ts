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

// Traduce los errores de Cognito al registrarse o confirmar el correo
export function mensajeErrorRegistro(error: unknown) {
  const nombre = error instanceof Error ? error.name : "";
  switch (nombre) {
    case "UsernameExistsException":
      return "Ya existe una cuenta con ese correo. Inicia sesión.";
    case "InvalidPasswordException":
      return "La contraseña no cumple los requisitos: mínimo 8 caracteres, con mayúsculas, minúsculas, números y símbolos.";
    case "InvalidParameterException":
      return "Revisa los datos: el correo o la contraseña no son válidos.";
    case "CodeMismatchException":
      return "El código no es correcto.";
    case "ExpiredCodeException":
      return "El código venció. Pide uno nuevo.";
    case "NotAuthorizedException":
      return "Esta cuenta ya está confirmada. Inicia sesión.";
    case "UserNotFoundException":
      return "No hay una cuenta registrada con ese correo.";
    case "LimitExceededException":
    case "TooManyRequestsException":
      return "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.";
    default:
      return "No se pudo completar el registro. Inténtalo de nuevo.";
  }
}
