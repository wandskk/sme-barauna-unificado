import React from "react";
import Link from "next/link";
import { listCoordinators } from "@/server/repositories/coordinatorRepository";
import { createCoordinatorAction, deleteCoordinatorAction } from "./actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserCheck, Plus, Edit, Trash2 } from "lucide-react";

export default async function AdminCoordenadoresPage({
  searchParams,
}: {
  searchParams: { new?: string };
}) {
  const coordinators = await listCoordinators().catch(() => []);
  const showNewForm = searchParams.new === "true";

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Gestão de Coordenadores"
        description="Cadastro de coordenadores pedagógicos da rede municipal de ensino."
        badgeText={`${coordinators.length} registrados`}
        badgeVariant="outline"
        actions={
          <Link href={showNewForm ? "/admin/coordenadores" : "/admin/coordenadores?new=true"}>
            <Button variant={showNewForm ? "outline" : "primary"} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>{showNewForm ? "Cancelar" : "Novo Coordenador"}</span>
            </Button>
          </Link>
        }
      />

      {showNewForm && (
        <Card className="border-primary/50 bg-primary-soft/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              <span>Cadastrar Novo Coordenador</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createCoordinatorAction} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-semibold text-foreground">Nome Completo *</label>
                <input
                  name="name"
                  required
                  placeholder="Ex: João Paulo Medeiros"
                  className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                />
              </div>
              <div className="flex gap-2">
                <Link href="/admin/coordenadores">
                  <Button type="button" variant="outline">Cancelar</Button>
                </Link>
                <Button type="submit" variant="primary">Salvar Coordenador</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {coordinators.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <UserCheck className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-semibold text-foreground">Nenhum coordenador cadastrado ainda.</p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-subtle text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="p-4">Nome do Coordenador</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coordinators.map((c) => (
                <tr key={c.id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="p-4 font-semibold text-foreground">{c.name}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/coordenadores/${c.id}/editar`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Editar">
                          <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </Link>
                      <form action={deleteCoordinatorAction.bind(null, c.id)}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-danger" title="Excluir">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
