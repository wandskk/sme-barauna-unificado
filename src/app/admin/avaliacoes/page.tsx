import React from "react";
import Link from "next/link";
import { listAssessments, listPrograms } from "@/server/repositories/assessmentRepository";
import { createAssessmentAction, deleteAssessmentAction } from "./actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Award, Plus, Edit, Trash2 } from "lucide-react";

export default async function AdminAvaliacoesPage({
  searchParams,
}: {
  searchParams: { new?: string };
}) {
  const [assessments, programs] = await Promise.all([
    listAssessments().catch(() => []),
    listPrograms().catch(() => []),
  ]);

  const showNewForm = searchParams.new === "true";

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Gestão de Avaliações"
        description="Cadastro dos exames e testes vinculados aos programas educacionais (SPADEB e Fluência Leitora)."
        badgeText={`${assessments.length} registradas`}
        badgeVariant="outline"
        actions={
          <Link href={showNewForm ? "/admin/avaliacoes" : "/admin/avaliacoes?new=true"}>
            <Button variant={showNewForm ? "outline" : "primary"} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>{showNewForm ? "Cancelar" : "Nova Avaliação"}</span>
            </Button>
          </Link>
        }
      />

      {showNewForm && (
        <Card className="border-primary/50 bg-primary-soft/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <span>Cadastrar Nova Avaliação</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {programs.length === 0 ? (
              <p className="text-xs text-danger">Nenhum programa cadastrado. Rode o seed primeiro.</p>
            ) : (
              <form action={createAssessmentAction} className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-foreground">Programa de Avaliação *</label>
                  <select
                    name="programId"
                    required
                    className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <option value="">Selecione o programa...</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-foreground">Nome da Avaliação *</label>
                  <input
                    name="name"
                    placeholder="Ex: 1ª Avaliação Diagnóstica 2026"
                    required
                    className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Ano Letivo *</label>
                  <input
                    name="year"
                    type="number"
                    defaultValue={new Date().getFullYear()}
                    required
                    className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Série Alvo (Opcional)</label>
                  <input
                    name="grade"
                    placeholder="Ex: 5º Ano"
                    className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Disciplina (SPADEB)</label>
                  <input
                    name="subject"
                    placeholder="Ex: Português e Matemática"
                    className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Total de Questões (SPADEB)</label>
                  <input
                    name="totalQuestions"
                    type="number"
                    placeholder="Ex: 20"
                    className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                  <Link href="/admin/avaliacoes">
                    <Button type="button" variant="outline">Cancelar</Button>
                  </Link>
                  <Button type="submit" variant="primary">Salvar Avaliação</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {assessments.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <Award className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-semibold text-foreground">Nenhuma avaliação cadastrada ainda.</p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-subtle text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="p-4">Avaliação</th>
                <th className="p-4">Programa</th>
                <th className="p-4">Ano</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assessments.map((a) => (
                <tr key={a.id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="p-4 font-semibold text-foreground">{a.name}</td>
                  <td className="p-4 text-muted-foreground"><Badge variant="info">{a.program.name}</Badge></td>
                  <td className="p-4 text-muted-foreground">{a.year}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/avaliacoes/${a.id}/editar`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Editar">
                          <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </Link>
                      <form action={deleteAssessmentAction.bind(null, a.id)}>
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
