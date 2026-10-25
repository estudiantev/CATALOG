"use client";

import { useEffect, useState } from "react";
import type { Schema } from "@/amplify/data/resource";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Badge } from "@/components/admin/ui/badge";
import { Input } from "@/components/admin/ui/input";
import { Skeleton } from "@/components/admin/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import { clienteDatos, mensajeErrorDatos } from "@/components/admin/datos";

type Cliente = Schema["Customer"]["type"];

async function cargarClientes() {
  const clientes: Cliente[] = [];
  let nextToken: string | null | undefined;
  do {
    const respuesta = await clienteDatos.models.Customer.list({ limit: 100, nextToken });
    if (respuesta.errors) throw new Error(mensajeErrorDatos(respuesta.errors));
    clientes.push(...respuesta.data);
    nextToken = respuesta.nextToken;
  } while (nextToken);
  // Los más recientes primero
  return clientes.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

const nombreCompleto = (c: Cliente) => [c.firstName, c.lastName].filter(Boolean).join(" ");

// owner es "<sub>::<usuario>"; las cuentas de Google tienen un usuario "google_..."
const viaGoogle = (c: Cliente) => (c.owner ?? "").split("::")[1]?.startsWith("google_") ?? false;

const formatoFecha = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" });

export function TablaClientes() {
  const [clientes, setClientes] = useState<Cliente[] | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    cargarClientes()
      .then(setClientes)
      .catch((err: Error) => setError(err.message));
  }, []);

  const texto = busqueda.trim().toLowerCase();
  const visibles = clientes?.filter((c) =>
    !texto || `${nombreCompleto(c)} ${c.email} ${c.phone ?? ""}`.toLowerCase().includes(texto),
  );

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          type="search"
          aria-label="Buscar clientes"
          placeholder="Buscar por nombre, correo o teléfono"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="max-w-sm"
        />
        {clientes && (
          <p className="text-sm text-muted-foreground">
            {visibles?.length === clientes.length
              ? `${clientes.length} ${clientes.length === 1 ? "cliente" : "clientes"}`
              : `${visibles?.length} de ${clientes.length}`}
          </p>
        )}
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead className="text-right">Desde</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes === null && !error &&
              [0, 1, 2].map((i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {visibles?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  {clientes?.length === 0 ? "Todavía no hay clientes registrados." : "No hay clientes que coincidan."}
                </TableCell>
              </TableRow>
            )}
            {visibles?.map((cliente) => (
              <TableRow key={cliente.customerId}>
                <TableCell className="font-medium">{nombreCompleto(cliente) || "—"}</TableCell>
                <TableCell>{cliente.email}</TableCell>
                <TableCell>{cliente.phone || "—"}</TableCell>
                <TableCell>
                  <Badge variant={viaGoogle(cliente) ? "outline" : "secondary"}>
                    {viaGoogle(cliente) ? "Google" : "Correo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatoFecha.format(new Date(cliente.createdAt))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
