import React from "react";
import Link from "next/link";
import { listSchoolYears } from "@/server/repositories/schoolYearRepository";
import { createSchoolYearAction, deleteSchoolYearAction } from "./actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Calendar, Plus, Edit, Trash2 } from "lucide-react";

export default async function AdminAnosLetivosPage({
  searchParams,
}: {
  searchParams: { new?: string };
}) {
  const years = await listSchoolYears().catch(() => []);
  const showNewForm = searchParams.new === "true";

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Gestão de Anos Letivos"
        description="Controle e ativação dos períodos letivos municipais."
        badgeText={`${years.length} registrados`}
        badgeVariant="outline"
        actions={
          <Link href={showNewForm ? "/admin/anos-letivos" : "/admin/anos-letivos?new=true"}>
            <Button variant={showNewForm ? "outline" : "primary"} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>{showNewForm ? "Cancelar" : "Novo Ano Letivo"}</span>
            </Button>
          </Link>
        }
      />

      {showNewForm && (
        <Card className="border-primary/50 bg-primary-soft/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Cadastrar Ano Letivo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createSchoolYearAction} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Ano *</label>
                <input
                  name="year"
                  type="number"
                  required
                  placeholder="2026"
                  defaultValue={new Date().getFullYear()}
                  className="h-10 w-32 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                />
              </div>

              <div className="flex items-center gap-2 pb-2">
                <input
                  name="active"
                  type="checkbox"
                  id="active"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="active" className="text-xs font-semibold text-foreground">
                  Definir como Ano Letivo Ativo
                </label>
              </div>

              <div className="flex gap-2">
                <Link href="/admin/anos-letivos">
                  <Button type="button" variant="outline">Cancelar</Button>
                </Link>
                <Button type="submit" variant="primary">Salvar Ano</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {years.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <Calendar className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-semibold text-foreground">Nenhum ano letivo cadastrado ainda.</p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-subtle text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="p-4">Ano Letivo</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {years.map((y) => (
                <tr key={y.id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="p-4 font-bold text-foreground">{y.year}</td>
                  <td className="p-4">
                    <Badge variant={y.active ? "success" : "outline"}>
                      {y.active ? "Ano Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/anos-letivos/${y.id}/editar`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Editar">
                          <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </Link>
                      <form action={deleteSchoolYearAction.bind(null, y.id)}>
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
