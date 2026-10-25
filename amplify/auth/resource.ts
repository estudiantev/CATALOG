import { defineAuth } from "@aws-amplify/backend"
import { verificationEmail } from "./custom-message/templates/verification";
import { invitationEmail } from "./custom-message/templates/invitation";
import { customMessage } from "./custom-message/resource";
// import { preSignUp } from "./pre-sign-up/resource";
import { postConfirmation } from "../auth/post-confirmation/resource";

/**
 * Primero configura el recurso de autenticación de Amplify
 * @see https://docs.amplify.aws/nextjs/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    // correo de verificación para los clientes
    email: {
      verificationEmailStyle: "CODE",
      verificationEmailSubject: verificationEmail.asunto,
      verificationEmailBody: (createCode) => verificationEmail.cuerpo(createCode()),
      // correo de invitación para los usuarios del panel de administración
      userInvitation: {
        emailSubject: invitationEmail.asunto,
        emailBody: (user, code) => invitationEmail.cuerpo(user(), code()),
      },
    },
    /*
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
        scopes: ['openid', 'email', 'profile'],
        attributeMapping: {
          email: 'email',
          emailVerified: 'email_verified',
          givenName: 'given_name',
          familyName: 'family_name',
        },
      }, 
      callbackUrls: [
        'http://localhost:5173/',
        'https://www.dominiodeprueba.click/'
      ],
      logoutUrls: [
        'http://localhost:5173/',
        'https://www.dominiodeprueba.click/'
      ],
    },
    */
  },
  // Correo profesional configurado con amazon SES
  senders: {
    email: {
      fromEmail: "correodeprueba@dominiodeprueba.click",
      fromName: "FARA Collections",
      replyTo: "juanitoelestudiantev@gmail.com",
    },
  },
  
  multifactor: {
    mode: "OPTIONAL",
    totp: true,
  },
  userAttributes: {
    // mapea al atributo estándar 'given_name' de Cognito
    givenName: {
      mutable: true,
      required: false,
    },
    // mapea al atributo estándar ‘family_name’ de Cognito
    familyName: {
      mutable: true,
      required: false,
    },
  },

  groups: ["INVENTORY", "MARKETING", "ADMIN"],

  triggers: {
    customMessage,
    // preSignUp,
    postConfirmation
  },
})