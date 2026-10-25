"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { confirmSignIn, fetchAuthSession, signIn, signOut } from "aws-amplify/auth";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { mensajeErrorIngreso } from "@/lib/errores-auth";
import { esStaff } from "@/lib/permisos";

type Paso = "credenciales" | "nueva-contrasena";

export function FormularioIngresoAdmin() {
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>("credenciales");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Solo deja pasar cuentas del staff; una clienta no tiene nada que hacer en el panel
  async function entrarAlPanel() {
    const { tokens } = await fetchAuthSession();
    const grupos = tokens?.accessToken.payload["cognito:groups"];
    if (!esStaff(Array.isArray(grupos) ? grupos.map(String) : [])) {
      await signOut();
      setPaso("credenciales");
      setError("Esta cuenta no tiene acceso al panel de administración.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const { isSignedIn, nextStep } =
        paso === "credenciales"
          ? await signIn({ username: correo.trim().toLowerCase(), password: contrasena })
          : await confirmSignIn({ challengeResponse: nuevaContrasena });

      if (isSignedIn) {
        await entrarAlPanel();
      } else if (nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        // Cuentas creadas con la invitación: primero deben cambiar la contraseña temporal
        setPaso("nueva-contrasena");
      } else {
        setError("Tu cuenta necesita un paso adicional que todavía no está disponible en el panel.");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "UserAlreadyAuthenticatedException") {
        await entrarAlPanel();
      } else {
        setError(mensajeErrorIngreso(err));
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Panel de administración</CardTitle>
        <CardDescription>
          {paso === "credenciales"
            ? "Ingresa con tu cuenta del staff."
            : "Es tu primer ingreso: crea una contraseña nueva para reemplazar la temporal."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={enviar} noValidate className="space-y-4">
          {paso === "credenciales" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="correo">Correo</Label>
                <Input id="correo" type="email" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contrasena">Contraseña</Label>
                <Input id="contrasena" type="password" autoComplete="current-password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="nueva-contrasena">Contraseña nueva</Label>
              <Input id="nueva-contrasena" type="password" autoComplete="new-password" value={nuevaContrasena} onChange={(e) => setNuevaContrasena(e.target.value)} required />
              <p className="text-xs text-muted-foreground">
                Mínimo 8 caracteres, con mayúsculas, minúsculas, números y símbolos.
              </p>
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? "Ingresando…" : paso === "credenciales" ? "Iniciar sesión" : "Guardar y entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
