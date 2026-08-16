import React from "react";
import Link from "next/link";
import { listStudents } from "@/server/repositories/studentRepository";
import { listClasses } from "@/server/repositories/classRepository";
import { createStudentAction, deleteStudentAction } from "./actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { GraduationCap, Plus, Edit, Trash2, Search } from "lucide-react";

export default async function AdminAlunosPage({
  searchParams,
}: {
  searchParams: { new?: string; query?: string };
}) {
  const [allStudents, classes] = await Promise.all([
    listStudents().catch(() => []),
    listClasses().catch(() => []),
  ]);

  const query = searchParams.query?.toLowerCase() || "";
  const students = query
    ? allStudents.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          (s.matricula && s.matricula.toLowerCase().includes(query)) ||
          s.class.name.toLowerCase().includes(query)
      )
    : allStudents;

  const showNewForm = searchParams.new === "true";

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Gestão de Alunos"
        description="Matrícula e controle dos estudantes da rede municipal de ensino."
        badgeText={`${allStudents.length} matriculados`}
        badgeVariant="outline"
        actions={
          <Link href={showNewForm ? "/admin/alunos" : "/admin/alunos?new=true"}>
            <Button variant={showNewForm ? "outline" : "primary"} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>{showNewForm ? "Cancelar" : "Matricular Aluno"}</span>
            </Button>
          </Link>
        }
      />

      {showNewForm && (
        <Card className="border-primary/50 bg-primary-soft/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>Matricular Novo Aluno</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <p className="text-xs text-danger">Cadastre ao menos uma turma antes de matricular alunos.</p>
            ) : (
              <form action={createStudentAction} className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-foreground">Nome Completo do Aluno *</label>
                  <input
                    name="name"
                    placeholder="Ex: Ana Clara Silva"
                    required
                    className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-foreground">Turma *</label>
                  <select
                    name="classId"
                    required
                    className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <option value="">Selecione a turma...</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.school.name} · {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-foreground">Necessidades Especiais (Opcional)</label>
                  <input
                    name="specialNeeds"
                    placeholder="Ex: Deficiência auditiva, baixa visão..."
                    className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                  <Link href="/admin/alunos">
                    <Button type="button" variant="outline">Cancelar</Button>
                  </Link>
                  <Button type="submit" variant="primary">Salvar Matrícula</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Busca */}
      <div className="flex items-center gap-2">
        <form className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            name="query"
            defaultValue={query}
            placeholder="Buscar aluno por nome, matrícula ou turma..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          />
        </form>
      </div>

      {students.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <GraduationCap className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            {query ? "Nenhum aluno encontrado para a busca." : "Nenhum aluno matriculado ainda."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-subtle text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="p-4">Estudante</th>
                  <th className="p-4">Turma / Escola</th>
                  <th className="p-4">Necessidades Especiais</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="p-4 font-semibold text-foreground">
                      <Link href={`/admin/alunos/${s.id}`} className="hover:text-primary hover:underline">
                        {s.name}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground"><span className="font-semibold text-foreground">{s.class.name}</span></td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {s.specialNeeds ? <Badge variant="info">{s.specialNeeds}</Badge> : "Nenhuma"}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/alunos/${s.id}/editar`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Editar">
                            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </Link>
                        <form action={deleteStudentAction.bind(null, s.id)}>
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

          <div className="grid gap-3 md:hidden">
            {students.map((s) => (
              <Card key={s.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/admin/alunos/${s.id}`} className="font-semibold text-foreground hover:text-primary hover:underline">
                      {s.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{s.class.name}</p>
                  </div>
                  {s.specialNeeds && <Badge variant="info">{s.specialNeeds}</Badge>}
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                  <Link href={`/admin/alunos/${s.id}/editar`}>
                    <Button variant="outline" size="sm">Editar</Button>
                  </Link>
                  <form action={deleteStudentAction.bind(null, s.id)}>
                    <Button variant="danger" size="sm">Excluir</Button>
                  </form>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
