"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";
import { NOMBRES_GRUPO, clienteDatos, mensajeErrorDatos } from "@/components/admin/datos";

// La Lambda agregar-staff solo acepta estos grupos: un ADMIN no se crea desde el panel
const GRUPOS = [
  { valor: "INVENTORY", descripcion: "Crea y edita productos." },
  { valor: "MARKETING", descripcion: "Edita productos existentes." },
];

export function FormularioStaff() {
  const [correo, setCorreo] = useState("");
  const [grupo, setGrupo] = useState("INVENTORY");
  const [resultado, setResultado] = useState<{ tipo: "ok" | "error"; mensaje: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function agregar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = correo.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setResultado({ tipo: "error", mensaje: "Escribe un correo válido." });
      return;
    }

    setEnviando(true);
    setResultado(null);
    const { data, errors } = await clienteDatos.mutations.agregarStaff({ email, grupo });
    setEnviando(false);

    if (errors) {
      setResultado({ tipo: "error", mensaje: mensajeErrorDatos(errors) });
      return;
    }
    setCorreo("");
    setResultado({
      tipo: "ok",
      mensaje:
        data === "promovido"
          ? `${email} ya tenía cuenta: la agregamos al grupo ${NOMBRES_GRUPO[grupo]}.`
          : `Creamos la cuenta de ${email} en ${NOMBRES_GRUPO[grupo]} y le enviamos un correo con su contraseña temporal.`,
    });
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Agregar al staff</CardTitle>
        <CardDescription>
          Si la persona no tiene cuenta, recibirá una invitación con una contraseña temporal para entrar al panel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={agregar} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="correo-staff">Correo</Label>
            <Input id="correo-staff" type="email" autoComplete="off" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grupo-staff">Grupo</Label>
            <Select value={grupo} onValueChange={setGrupo}>
              <SelectTrigger id="grupo-staff" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRUPOS.map((g) => (
                  <SelectItem key={g.valor} value={g.valor}>
                    {NOMBRES_GRUPO[g.valor]} · {g.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {resultado && (
            <Alert variant={resultado.tipo === "error" ? "destructive" : "default"}>
              <AlertDescription>{resultado.mensaje}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={enviando}>
            {enviando ? "Agregando…" : "Agregar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
